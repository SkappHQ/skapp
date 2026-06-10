<#
.SYNOPSIS
    Generates Jest unit tests for changed frontend source files

.DESCRIPTION
    Detects changed frontend files in a module, finds files without tests,
    reads existing test patterns and the source code, then generates Jest
    unit tests using GitHub Copilot CLI. Generated tests are written to the
    same directory as the source file (co-located test pattern).

    The generated tests are committed to the current feature branch so they
    become part of the feature PR.

.PARAMETER Module
    Target module (people, leave, attendance, settings, configurations)

.PARAMETER Feature
    Feature name to filter changed files (e.g. "add", "quick-add", "teams")

.PARAMETER BaseBranch
    Branch to diff against for change detection (default: develop)

.PARAMETER SkipRun
    Generate tests without running Jest

.PARAMETER SkipCommit
    Generate tests but don't commit them

.PARAMETER Force
    Regenerate tests even if test file already exists

.EXAMPLE
    # Generate unit tests for changed people module files
    .\Generate-FeUnitTests.ps1 -Module people -Feature "add"

    # Generate and skip running
    .\Generate-FeUnitTests.ps1 -Module people -Feature "teams" -SkipRun

    # Force regenerate existing tests
    .\Generate-FeUnitTests.ps1 -Module people -Feature "add" -Force
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("people", "leave", "attendance", "settings", "configurations")]
    [string]$Module,
    [Parameter(Mandatory = $true)]
    [string]$Feature,
    [string]$BaseBranch,
    [switch]$SkipRun,
    [switch]$SkipCommit,
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

# ==============================================================================
# Prompt Builder
# ==============================================================================

function Get-FeUnitTestPrompt {
    param(
        [string]$SourceFilePath,
        [string]$SourceContent,
        [string]$TestFilePath,
        [string]$ExistingTestContent,
        [string]$ReferenceTestContent,
        [string]$Module,
        [string]$Feature,
        [string[]]$ImportedModulesContent
    )

    $existingSection = ""
    if ($ExistingTestContent) {
        $existingSection = @"

=== EXISTING TEST FILE (update/extend, do NOT remove passing tests) ===
$ExistingTestContent
"@
    }

    $importsSection = ""
    if ($ImportedModulesContent -and $ImportedModulesContent.Count -gt 0) {
        $importsSection = @"

=== IMPORTED MODULES (understand dependencies for mocking) ===
$($ImportedModulesContent -join "`n`n")
"@
    }

    return @"
You are an expert Jest/TypeScript test engineer. Generate comprehensive unit tests for a Skapp frontend source file.

=== PROJECT SETUP ===
- Framework: Next.js 14 + React 18 + TypeScript
- Test runner: Jest + jest-environment-jsdom
- State management: Zustand
- Forms: Formik + Yup validation
- Module aliases: ~community -> src/community, ~enterprise -> src/fallback
- Test co-location: Tests live next to source files (foo.ts -> foo.test.ts)

=== CRITICAL MOCKING RULES ===
1. If the source file imports from '~community/common/utils/commonUtil', you MUST add:
   jest.mock('~community/common/utils/commonUtil', () => ({
     formatDate: jest.fn((d) => d),
     formatEmptyString: jest.fn((s) => s || null),
     formatPhoneNumber: jest.fn((code, phone) => code && phone ? code + phone : '')
   }));
   This avoids 'Request is not defined' from next/server.js.

2. If the source file imports from next-auth, axios, or any API module, mock them.

3. For Zustand stores, use: jest.mock('~community/<module>/store/store', () => ({ ... }))

4. For react-i18next:
   jest.mock('react-i18next', () => ({
     useTranslation: () => ({ t: (key: string) => key })
   }));

=== TESTING CONVENTIONS ===
1. File naming: <source>.test.ts or <source>.test.tsx (match source extension)
2. Use describe blocks grouped by function/feature
3. Test naming: 'should <expected behavior> when <condition>'
4. AAA pattern: Arrange -> Act -> Assert
5. Cover: happy path, edge cases, error conditions, null/undefined inputs
6. For Yup schemas: use schema.validate() with rejects.toThrow() for invalid data
7. For utility functions: test each exported function independently
8. For hooks: use renderHook from @testing-library/react
9. Do NOT test implementation details — test behavior and outputs
10. Do NOT add tests for scenarios the code doesn't handle (e.g. don't test
    name character validation if the schema only has required + max length)

=== SOURCE FILE TO TEST ===
Path: $SourceFilePath
```typescript
$SourceContent
```
$existingSection
$importsSection

=== REFERENCE TEST (follow this style) ===
$ReferenceTestContent

=== OUTPUT ===
Generate a complete test file for: $TestFilePath

Requirements:
- Import only what's needed from the source file
- Mock external dependencies (APIs, next/server, stores)
- Test every exported function/constant/hook
- Include edge cases and boundary conditions
- All tests must pass — do NOT assert behavior that doesn't exist in the source
- If extending an existing test file, keep all existing passing tests and add new ones

Output ONLY the complete test file content. No explanations, no markdown fences.
"@
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " FE Unit Test Generation (Jest)" -ForegroundColor Cyan
Write-Host " Module: $Module | Feature: $Feature" -ForegroundColor Cyan
Write-Host " Model: $($CONFIG.CopilotModel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Detect changed frontend files
# ==============================================================================
Write-StepHeader -Step 1 -Message "Detecting changed frontend files..."

$projectRoot = Get-ProjectRoot
$feRoot = Join-Path $projectRoot $CONFIG.FrontendRoot

if (-not $BaseBranch) { $BaseBranch = $CONFIG.BaseBranch }

$changedFiles = Get-ChangedFeFiles -Module $Module -BaseBranch $BaseBranch

# Filter by feature name
$featureFiles = @($changedFiles | Where-Object {
    $_.RelativePath -match ($Feature -replace '-', '[-_]?')
})

# If feature filter returns nothing, use all changed files
if (-not $featureFiles -or $featureFiles.Count -eq 0) {
    Write-Warning "No files matching feature '$Feature'. Using all changed $Module files."
    $featureFiles = $changedFiles
}

if (-not $featureFiles -or $featureFiles.Count -eq 0) {
    Write-Warning "No testable changed files found in $Module module."
    Write-Host "  Tip: Ensure you have uncommitted or branch-diffed changes in frontend/src/community/$Module/"
    exit 0
}

# Filter: skip files that already have tests (unless -Force)
$filesToTest = @(if ($Force) {
    $featureFiles
} else {
    $featureFiles | Where-Object { -not $_.HasTest }
})

Write-Host "  Changed files: $($featureFiles.Count)"
Write-Host "  Already have tests: $(@($featureFiles | Where-Object { $_.HasTest }).Count)"
Write-Host "  Need tests: $($filesToTest.Count)"
Write-Host ""

if ($filesToTest.Count -eq 0) {
    Write-Success "All changed files already have tests. Use -Force to regenerate."
    exit 0
}

foreach ($f in $filesToTest) {
    $status = if ($f.HasTest) { "[has test]" } else { "[needs test]" }
    Write-Host "    $status $($f.RelativePath)" -ForegroundColor $(if ($f.HasTest) { 'DarkGray' } else { 'White' })
}

# ==============================================================================
# Step 2: Load reference test patterns
# ==============================================================================
Write-StepHeader -Step 2 -Message "Loading reference test patterns..."

# Find an existing passing test in this module for style reference
$existingTests = Get-ChildItem -Path (Join-Path $feRoot "src/community/$Module") -Filter "*.test.ts" -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 3

$referenceTestContent = ""
if ($existingTests) {
    $refTest = $existingTests[0]
    $referenceTestContent = Get-Content $refTest.FullName -Raw -ErrorAction SilentlyContinue
    Write-Host "  Reference test: $($refTest.Name)"
    # Truncate if too long
    if ($referenceTestContent.Length -gt 3000) {
        $referenceTestContent = $referenceTestContent.Substring(0, 3000) + "`n// ... (truncated)"
    }
}
else {
    Write-Warning "No existing test files found for reference."
}

# ==============================================================================
# Step 3: Generate tests for each file
# ==============================================================================
Write-StepHeader -Step 3 -Message "Generating unit tests..."

$generatedTests = @()
$failedFiles = @()

foreach ($fileInfo in $filesToTest) {
    $sourcePath = $fileInfo.FullPath
    $testPath = $fileInfo.TestPath
    $relativePath = $fileInfo.RelativePath

    if (-not (Test-Path $sourcePath)) {
        Write-Warning "Source file not found: $sourcePath"
        continue
    }

    Write-Host ""
    Write-Host "  Generating: $([System.IO.Path]::GetFileName($testPath))" -ForegroundColor Yellow
    Write-Host "    Source: $relativePath"

    # Read source content
    $sourceContent = Get-Content $sourcePath -Raw

    # Read existing test content if updating
    $existingTestContent = ""
    if ($fileInfo.HasTest -and (Test-Path $testPath)) {
        $existingTestContent = Get-Content $testPath -Raw
    }

    # Read imported modules for mocking context (first 5 imports)
    $importedContent = @()
    $importLines = $sourceContent -split "`n" | Where-Object { $_ -match "^import " } | Select-Object -First 5
    foreach ($imp in $importLines) {
        if ($imp -match "from\s+[`"']([^`"']+)[`"']") {
            $importPath = $Matches[1]
            # Only read local imports (starting with . or ~)
            if ($importPath -match "^[.~]") {
                $resolvedPath = $importPath -replace "~community", "src/community" -replace "~enterprise", "src/fallback"
                $fullImportPath = Join-Path $feRoot "$resolvedPath.ts"
                if (-not (Test-Path $fullImportPath)) {
                    $fullImportPath = Join-Path $feRoot "$resolvedPath.tsx"
                }
                if (-not (Test-Path $fullImportPath)) {
                    $fullImportPath = Join-Path $feRoot "$resolvedPath/index.ts"
                }
                if (Test-Path $fullImportPath) {
                    $content = Get-Content $fullImportPath -TotalCount 50 -ErrorAction SilentlyContinue
                    if ($content) {
                        $importedContent += "// === $importPath ===`n$($content -join "`n")"
                    }
                }
            }
        }
    }

    # Build prompt
    $prompt = Get-FeUnitTestPrompt `
        -SourceFilePath $relativePath `
        -SourceContent $sourceContent `
        -TestFilePath $testPath `
        -ExistingTestContent $existingTestContent `
        -ReferenceTestContent $referenceTestContent `
        -Module $Module `
        -Feature $Feature `
        -ImportedModulesContent $importedContent

    Write-Host "    Sending to Copilot CLI ($($CONFIG.CopilotModel))..." -NoNewline

    try {
        $output = copilot -p $prompt --model $CONFIG.CopilotModel --yolo 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path $testPath)) {
            Write-Host " OK" -ForegroundColor Green
            $generatedTests += $testPath
        }
        else {
            Write-Host " FAILED" -ForegroundColor Red
            $failedFiles += $relativePath
            if ($output) {
                Write-Host "    Output: $($output | Select-Object -First 5 | Out-String)" -ForegroundColor DarkGray
            }
        }
    }
    catch {
        Write-Host " ERROR" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor DarkGray
        $failedFiles += $relativePath

        # Save prompt for manual use
        $promptFile = Join-Path $fileInfo.Directory "GENERATION_PROMPT.md"
        $prompt | Out-File -FilePath $promptFile -Encoding utf8
        Write-Host "    Prompt saved: $promptFile" -ForegroundColor Yellow
    }
}

if ($generatedTests.Count -eq 0) {
    Write-Warning "No test files were generated."
    Write-Host "  Copilot CLI may not be available. Use VS Code Copilot chat instead."
    exit 1
}

Write-Success "Generated $($generatedTests.Count) test file(s)"

# ==============================================================================
# Step 4: Run Jest to validate (optional)
# ==============================================================================
$testsPassed = $true

if (-not $SkipRun) {
    Write-StepHeader -Step 4 -Message "Running Jest to validate generated tests..."

    Push-Location $feRoot
    try {
        # Build test path pattern for jest
        $testPathPatterns = $generatedTests | ForEach-Object {
            $_ -replace [regex]::Escape($feRoot), "" -replace "\\", "/" -replace "^/", ""
        }
        $jestPattern = $testPathPatterns -join " "

        Write-Host "  Running: npx jest $jestPattern --no-coverage"
        Write-Host ""

        $jestOutput = npx jest $testPathPatterns --no-coverage 2>&1 | Out-String
        Write-Host $jestOutput

        if ($LASTEXITCODE -eq 0) {
            Write-Success "All generated tests pass!"
        }
        else {
            $testsPassed = $false
            Write-Warning "Some tests failed. Review and fix before committing."
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-StepHeader -Step 4 -Message "Skipping test execution (-SkipRun)"
}

# ==============================================================================
# Step 5: Commit to feature branch (optional)
# ==============================================================================
if (-not $SkipCommit -and $testsPassed -and $generatedTests.Count -gt 0) {
    Write-StepHeader -Step 5 -Message "Committing generated tests to feature branch..."

    Push-Location $projectRoot
    try {
        $currentBranch = git branch --show-current 2>$null
        Write-Host "  Branch: $currentBranch"

        # Stage only the generated test files
        foreach ($testFile in $generatedTests) {
            $relPath = $testFile -replace [regex]::Escape("$projectRoot\"), "" -replace [regex]::Escape("$projectRoot/"), ""
            git add $relPath 2>&1 | Out-Null
        }

        # Check if there are staged changes
        $staged = git diff --cached --name-only 2>$null
        if ($staged) {
            $commitMsg = "test(fe): add Jest unit tests for $Module/$Feature`n`nGenerated $($generatedTests.Count) test file(s):`n"
            foreach ($tf in $generatedTests) {
                $commitMsg += "  - $([System.IO.Path]::GetFileName($tf))`n"
            }

            git commit -m $commitMsg 2>&1 | Out-Null
            Write-Success "Committed: test(fe): add Jest unit tests for $Module/$Feature"
        }
        else {
            Write-Warning "No new changes to commit."
        }
    }
    finally {
        Pop-Location
    }
}
elseif (-not $testsPassed) {
    Write-Warning "Skipping commit — tests did not pass. Fix and commit manually."
}
else {
    Write-Host "  Skipping commit (-SkipCommit)"
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " FE Unit Test Generation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Module:      $Module"
Write-Host "  Feature:     $Feature"
Write-Host "  Generated:   $($generatedTests.Count) test file(s)"
Write-Host "  Failed:      $($failedFiles.Count)"
Write-Host "  Tests pass:  $(if ($SkipRun) { 'skipped' } elseif ($testsPassed) { 'YES' } else { 'NO — fix before committing' })"
Write-Host "  Committed:   $(if ($SkipCommit) { 'no' } elseif ($testsPassed) { 'yes' } else { 'no (tests failed)' })"
Write-Host ""

if ($generatedTests.Count -gt 0) {
    Write-Host "  Generated files:" -ForegroundColor White
    foreach ($tf in $generatedTests) {
        Write-Host "    - $([System.IO.Path]::GetFileName($tf))" -ForegroundColor White
    }
}

if ($failedFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "  Failed files (generate manually):" -ForegroundColor Yellow
    foreach ($ff in $failedFiles) {
        Write-Host "    - $ff" -ForegroundColor Yellow
    }
}
Write-Host ""
