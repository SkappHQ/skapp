<#
.SYNOPSIS
    Generates backend unit and integration tests using GitHub Copilot CLI (Claude Opus 4.6)

.DESCRIPTION
    Detects changed Java source files vs the base branch, generates enterprise-grade
    JUnit 5 + Mockito unit tests and Spring Boot integration tests using Copilot CLI.

.PARAMETER BaseBranch
    Branch to diff against (default: develop)

.PARAMETER Files
    Specific files to generate tests for (overrides auto-detection)

.PARAMETER TestType
    Type of tests to generate: Unit, Integration, or Both (default: Both)

.PARAMETER DryRun
    Show what would be generated without actually generating

.PARAMETER SkipVerify
    Skip running Maven test after generation

.EXAMPLE
    .\Generate-BeTests.ps1
    .\Generate-BeTests.ps1 -TestType Unit
    .\Generate-BeTests.ps1 -Files "backend/src/main/java/com/skapp/community/peopleplanner/service/impl/PeopleServiceImpl.java"
#>

param(
    [string]$BaseBranch = "develop",
    [string[]]$Files,
    [ValidateSet("Unit", "Integration", "Both")]
    [string]$TestType = "Both",
    [switch]$DryRun,
    [switch]$SkipVerify
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Backend Test Generation" -ForegroundColor Cyan
Write-Host " Model: $($CONFIG.CopilotModel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Detect changed files
# ==============================================================================
Write-StepHeader -Step 1 -Message "Detecting changed files..."

if ($Files) {
    $changedFiles = $Files
    Write-Host "  Using specified files: $($changedFiles.Count) file(s)"
}
else {
    $changedFiles = Get-ChangedJavaFiles -BaseBranch $BaseBranch
    Write-Host "  Found $($changedFiles.Count) changed Java file(s) vs origin/$BaseBranch"
}

if (-not $changedFiles -or $changedFiles.Count -eq 0) {
    Write-Warning "No testable files detected. Try specifying files with -Files parameter."
    exit 0
}

# ==============================================================================
# Step 2: Filter to testable files
# ==============================================================================
Write-StepHeader -Step 2 -Message "Filtering testable files..."

$testableFiles = Get-TestableFiles -ChangedFiles $changedFiles

Write-Host "  Testable files (no existing tests):"
foreach ($f in $testableFiles) {
    Write-Host "    - $f" -ForegroundColor White
}

if ($testableFiles.Count -eq 0) {
    Write-Success "All changed files already have tests."
    exit 0
}

if ($DryRun) {
    Write-Host ""
    Write-Host "[DRY RUN] Would generate tests for $($testableFiles.Count) file(s)" -ForegroundColor Yellow
    exit 0
}

# ==============================================================================
# Step 3: Read support utilities for context
# ==============================================================================
Write-StepHeader -Step 3 -Message "Loading test context..."

$projectRoot = Get-ProjectRoot
$supportContext = ""

$supportFiles = @(
    "$($CONFIG.TestSupportPkg)/TestConstants.java",
    "$($CONFIG.TestSupportPkg)/SecurityTestUtils.java",
    "$($CONFIG.TestSupportPkg)/MockUserFactory.java"
)

foreach ($sf in $supportFiles) {
    $fullPath = Join-Path $projectRoot $sf
    if (Test-Path $fullPath) {
        $supportContext += "`n// === $(Split-Path -Leaf $sf) ===`n"
        $supportContext += Get-Content $fullPath -Raw
    }
}

Write-Success "Loaded $(($supportFiles | Where-Object { Test-Path (Join-Path $projectRoot $_) }).Count) support file(s)"

# ==============================================================================
# Step 4: Generate tests for each file
# ==============================================================================
Write-StepHeader -Step 4 -Message "Generating tests..."

$generatedCount = 0
$failedCount = 0

foreach ($sourceFile in $testableFiles) {
    $className = Get-ClassName -FilePath $sourceFile
    $packageName = Get-JavaPackageName -FilePath $sourceFile
    $fullSourcePath = Join-Path $projectRoot $sourceFile

    Write-Host ""
    Write-Host "  Generating tests for: $className" -ForegroundColor White

    # Determine test type based on file location
    $isController = $sourceFile -match "[\\/]controller[\\/]"
    $isService = $sourceFile -match "[\\/]service[\\/]"
    $isUtil = $sourceFile -match "[\\/]util[\\/]"
    $isComponent = $sourceFile -match "[\\/]component[\\/]"

    # Read source file
    $sourceContent = Get-Content $fullSourcePath -Raw

    # Build the prompt based on test type needed
    $testsToGenerate = @()

    if ($TestType -eq "Both" -or $TestType -eq "Unit") {
        if ($isService -or $isUtil -or $isComponent) {
            $testsToGenerate += "Unit"
        }
    }
    if ($TestType -eq "Both" -or $TestType -eq "Integration") {
        if ($isController) {
            $testsToGenerate += "Integration"
        }
    }

    # Fallback: if no specific match, generate unit test
    if ($testsToGenerate.Count -eq 0) {
        $testsToGenerate += "Unit"
    }

    foreach ($testKind in $testsToGenerate) {
        $testSuffix = if ($testKind -eq "Unit") { $NAMING.UnitSuffix } else { $NAMING.IntegrationSuffix }
        $testFileName = "${className}${testSuffix}.java"

        # Compute test file path (mirror source structure in test tree)
        $testFilePath = $sourceFile -replace "src/main/java", "src/test/java"
        $testFilePath = $testFilePath -replace "$className\.java$", $testFileName
        $fullTestPath = Join-Path $projectRoot $testFilePath

        # Ensure test directory exists
        $testDir = Split-Path -Parent $fullTestPath
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }

        # Build Copilot prompt
        $prompt = Get-TestGenerationPrompt -ClassName $className `
            -PackageName $packageName `
            -SourceContent $sourceContent `
            -TestKind $testKind `
            -SupportContext $supportContext `
            -TestFilePath $fullTestPath

        Write-Host "    [$testKind] $testFileName..." -NoNewline

        try {
            $output = copilot -p $prompt --model $CONFIG.CopilotModel --yolo 2>&1
            if ($LASTEXITCODE -eq 0 -and (Test-Path $fullTestPath)) {
                Write-Host " OK" -ForegroundColor Green
                $generatedCount++
            }
            else {
                Write-Host " FAILED" -ForegroundColor Red
                Write-Host "    Output: $($output | Select-Object -First 5 | Out-String)"
                $failedCount++
            }
        }
        catch {
            Write-Host " ERROR" -ForegroundColor Red
            Write-Host "    $_"
            $failedCount++
        }
    }
}

# ==============================================================================
# Step 5: Run Maven tests to verify
# ==============================================================================
if (-not $SkipVerify -and $generatedCount -gt 0) {
    Write-StepHeader -Step 5 -Message "Verifying generated tests..."

    Push-Location (Join-Path $projectRoot "backend")
    try {
        $mvnCmd = if (Test-Path "mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }
        Write-Host "  Running: $mvnCmd test -pl . -Dtest=*Test -DfailIfNoTests=false"

        & $mvnCmd test -pl . "-Dtest=*Test" -DfailIfNoTests=false 2>&1 | ForEach-Object {
            if ($_ -match "BUILD SUCCESS") {
                Write-Success "All generated tests pass!"
            }
            elseif ($_ -match "BUILD FAILURE") {
                Write-Warning "Some tests failed. Review the output above."
            }
        }
    }
    finally {
        Pop-Location
    }
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Generation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Generated: $generatedCount test file(s)"
Write-Host "  Failed:    $failedCount file(s)"
Write-Host ""

# ==============================================================================
# Prompt Builder Function
# ==============================================================================

function Get-TestGenerationPrompt {
    param(
        [string]$ClassName,
        [string]$PackageName,
        [string]$SourceContent,
        [string]$TestKind,
        [string]$SupportContext,
        [string]$TestFilePath
    )

    $testPackage = $PackageName -replace "com\.skapp\.community", "com.skapp.community"

    if ($TestKind -eq "Unit") {
        return @"
You are an expert Java test engineer. Generate a comprehensive JUnit 5 + Mockito UNIT TEST for the class below.

=== TARGET CLASS ===
Package: $PackageName
Class: $ClassName

$SourceContent

=== TEST SUPPORT UTILITIES (use these) ===
$SupportContext

=== REQUIREMENTS ===
1. Write the test file to: $TestFilePath
2. Use @ExtendWith(MockitoExtension.class) — NO Spring context
3. Mock ALL dependencies using @Mock annotations
4. Create the SUT (system under test) in @BeforeEach using constructor injection
5. Test naming: methodName_expectedBehavior_whenCondition()
6. Follow AAA pattern: Arrange (given/when), Act (call method), Assert (verify/assertEquals)
7. Cover: happy path, error paths, boundary cases, null inputs, validation logic
8. Use TestConstants for status values (STATUS_SUCCESSFUL, STATUS_UNSUCCESSFUL)
9. Use MockUserFactory for creating test users when needed
10. Verify mock interactions with verify() — check arguments
11. NO hardcoded strings for reusable values — extract to private constants
12. Group related tests with @Nested + @DisplayName
13. Test exceptions with assertThrows
14. Do NOT test private methods directly — test through public API
15. Each test should be independent and idempotent

=== DO NOT ===
- Do NOT use @SpringBootTest (this is a UNIT test)
- Do NOT use real database or network calls
- Do NOT use Thread.sleep or timing-dependent assertions
- Do NOT generate tests for getters/setters/constructors unless they have logic
"@
    }
    else {
        return @"
You are an expert Java test engineer. Generate a comprehensive Spring Boot INTEGRATION TEST for the controller below.

=== TARGET CLASS ===
Package: $PackageName
Class: $ClassName

$SourceContent

=== TEST SUPPORT UTILITIES (use these) ===
$SupportContext

=== REQUIREMENTS ===
1. Write the test file to: $TestFilePath
2. Use @SpringBootTest(classes = TestSkappApplication.class) + @AutoConfigureMockMvc + @Transactional
3. Inject MockMvc and JsonMapper (from tools.jackson.databind)
4. Create reusable performPostRequest/performGetRequest/performPatchRequest helper methods
5. Use SecurityTestUtils.bearerToken(authToken) for authenticated requests
6. Use TestConstants for JSON path assertions (STATUS_PATH, RESULTS_PATH, MESSAGE_PATH)
7. Test naming: endpointAction_expectedResult_whenCondition()
8. Cover per endpoint:
   - Valid request → success response
   - Missing auth → 401
   - Wrong role → 403
   - Invalid input → 400 with validation messages
   - Not found → appropriate error
9. Group tests by endpoint using @Nested + @DisplayName
10. NO hardcoded URLs — extract to private static final constants
11. Use builder patterns or factory methods for request DTOs
12. Verify response body structure with jsonPath assertions
13. Each @Nested class should have focused tests for one endpoint

=== DO NOT ===
- Do NOT mock the service layer (this is integration, test the full stack)
- Do NOT use Thread.sleep
- Do NOT depend on test execution order
- Do NOT leave test data behind (@Transactional handles rollback)
"@
    }
}
