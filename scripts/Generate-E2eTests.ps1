<#
.SYNOPSIS
    Generates Playwright E2E API tests using GitHub Copilot CLI (Claude Opus 4.6)

.DESCRIPTION
    Detects changed backend controllers, generates Playwright E2E tests that exercise
    the REST API endpoints with full auth matrix, CRUD lifecycle, and contract testing.

.PARAMETER BaseBranch
    Branch to diff against (default: develop)

.PARAMETER E2eDir
    Path to the E2E test repository (auto-detected if not specified)

.PARAMETER SkipRun
    Generate tests without running Playwright

.PARAMETER PushPr
    After generation, push to E2E repo and open PR linked to this PR number

.PARAMETER BaseUrl
    Backend base URL for test execution (default: http://localhost:8080)

.EXAMPLE
    .\Generate-E2eTests.ps1 -SkipRun
    .\Generate-E2eTests.ps1 -BaseUrl "http://localhost:8080"
    .\Generate-E2eTests.ps1 -PushPr "42"
#>

param(
    [string]$BaseBranch = "develop",
    [string]$E2eDir,
    [switch]$SkipRun,
    [string]$PushPr,
    [string]$BaseUrl = "http://localhost:3000"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " E2E Test Generation (Playwright)" -ForegroundColor Cyan
Write-Host " Model: $($CONFIG.CopilotModel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Locate E2E repository
# ==============================================================================
Write-StepHeader -Step 1 -Message "Locating E2E test repository..."

$projectRoot = Get-ProjectRoot

if ($E2eDir) {
    $e2eRoot = Resolve-Path $E2eDir
}
else {
    # Check configured local path first, then fallback candidates
    $candidatePaths = @(
        $CONFIG.E2eLocalPath,
        (Join-Path $projectRoot "skapp-pm-e2e"),
        (Join-Path (Split-Path $projectRoot) "skapp-pm-e2e")
    )

    $e2eRoot = $null
    foreach ($path in $candidatePaths) {
        if ($path -and (Test-Path $path)) {
            $e2eRoot = $path
            break
        }
    }
}

if (-not $e2eRoot -or -not (Test-Path $e2eRoot)) {
    Write-Failure "E2E repository not found. Specify with -E2eDir or use configured path."
    Write-Host "  Configured path: $($CONFIG.E2eLocalPath)"
    Write-Host "  Or clone: git clone https://github.com/$($CONFIG.E2eRepo) $($CONFIG.E2eLocalPath)"
    exit 1
}

Write-Success "E2E repo: $e2eRoot"

# Ensure test directories exist
$e2eTestDir = Join-Path $e2eRoot $CONFIG.E2eTestDir
$e2eHelpersDir = Join-Path $e2eRoot $CONFIG.E2eHelpersDir

if (-not (Test-Path $e2eTestDir)) {
    New-Item -ItemType Directory -Path $e2eTestDir -Force | Out-Null
}
if (-not (Test-Path $e2eHelpersDir)) {
    New-Item -ItemType Directory -Path $e2eHelpersDir -Force | Out-Null
}

# ==============================================================================
# Step 2: Detect changed controllers (across all repos/submodules)
# ==============================================================================
Write-StepHeader -Step 2 -Message "Detecting changed controllers across repos..."

# Get cross-repo context (detects feature branch across all submodules)
$featureBranch = Get-FeatureBranchName
Write-Host "  Feature branch: $featureBranch"

$crossRepoContext = Get-CrossRepoContext -FeatureBranch $featureBranch
$controllers = $crossRepoContext.Controllers

# Show affected repos
$affectedSubs = $crossRepoContext.AffectedRepos
if ($affectedSubs.Count -gt 0) {
    Write-Host "  Affected repositories:"
    foreach ($sub in $affectedSubs) {
        Write-Host "    - $($sub.Repo) ($($sub.Layer)) [$($sub.ChangedFiles.Count) files]" -ForegroundColor White
    }
    Write-Host ""
}

if (-not $controllers -or $controllers.Count -eq 0) {
    # Fallback: try old method (main repo only)
    $allChanged = Get-ChangedJavaFiles -BaseBranch $BaseBranch
    $controllers = $allChanged | Where-Object { $_ -match "[\\/]controller[\\/]" }
}

if (-not $controllers -or $controllers.Count -eq 0) {
    Write-Warning "No changed controllers found in any repo. E2E tests target controllers."
    Write-Host "  Tip: Ensure submodules are on feature branch"
    Write-Host "       git submodule foreach 'git checkout $featureBranch 2>/dev/null'"
    exit 0
}

Write-Host "  Changed controllers:"
foreach ($c in $controllers) {
    Write-Host "    - $(Get-ClassName -FilePath $c)" -ForegroundColor White
}

# ==============================================================================
# Step 3: Read context files for prompt
# ==============================================================================
Write-StepHeader -Step 3 -Message "Loading context..."

# Read existing E2E helpers for reference
$helpersContext = ""
$helperFiles = @("api.ts", "auth.ts")
foreach ($hf in $helperFiles) {
    $helperPath = Join-Path $e2eHelpersDir $hf
    if (Test-Path $helperPath) {
        $helpersContext += "`n// === $hf ===`n"
        $helpersContext += Get-Content $helperPath -Raw
    }
}

# Read existing E2E test for pattern reference
$existingTests = Get-ChildItem -Path $e2eTestDir -Filter "*.test.ts" -ErrorAction SilentlyContinue | Select-Object -First 1
$existingTestContent = ""
if ($existingTests) {
    $existingTestContent = Get-Content $existingTests.FullName -Raw
}

# Build cross-repo context summary for the prompt
$crossRepoSummary = ""
if ($affectedSubs.Count -gt 1) {
    $crossRepoSummary = "`n=== CROSS-REPO CONTEXT ===`n"
    $crossRepoSummary += "This feature spans $($affectedSubs.Count) repositories:`n"
    foreach ($sub in $affectedSubs) {
        $crossRepoSummary += "  - $($sub.Repo) ($($sub.Layer)/$($sub.Type)): $($sub.ChangedFiles.Count) files on branch $($sub.Branch)`n"
    }
    $crossRepoSummary += "`nBackend changes: $($crossRepoContext.BackendChanges.Count) files`n"
    $crossRepoSummary += "Frontend changes: $($crossRepoContext.FrontendChanges.Count) files`n"
}

Write-Success "Context loaded (helpers: $($helperFiles.Count), reference test: $($existingTests.Count), repos: $($affectedSubs.Count))"

# ==============================================================================
# Step 4: Generate E2E tests for each controller
# ==============================================================================
Write-StepHeader -Step 4 -Message "Generating E2E tests..."

$generatedCount = 0
$failedCount = 0

foreach ($controllerFile in $controllers) {
    $className = Get-ClassName -FilePath $controllerFile
    $moduleName = ""

    # Extract module name from path (e.g., peopleplanner, leaveplanner)
    if ($controllerFile -match "[\\/](community|enterprise)[\\/]([^\\/]+)[\\/]") {
        $moduleName = $Matches[2]
    }

    $testFileName = "$($className -replace 'Controller$', '').gen.test.ts"
    $testFilePath = Join-Path $e2eTestDir $testFileName

    Write-Host ""
    Write-Host "  Generating: $testFileName" -ForegroundColor White

    # Read the controller source
    $fullControllerPath = Join-Path $projectRoot $controllerFile
    $controllerContent = Get-Content $fullControllerPath -Raw

    # Also read the service interface if available
    $serviceContent = ""
    $servicePath = $controllerFile -replace "controller[\\/]v\d+[\\/]", "service/" -replace "Controller\.java$", "Service.java"
    $fullServicePath = Join-Path $projectRoot $servicePath
    if (Test-Path $fullServicePath) {
        $serviceContent = Get-Content $fullServicePath -Raw
    }

    # Build prompt
    $prompt = Get-E2eTestPrompt -ClassName $className `
        -ModuleName $moduleName `
        -ControllerContent $controllerContent `
        -ServiceContent $serviceContent `
        -HelpersContext $helpersContext `
        -ExistingTestContent $existingTestContent `
        -TestFilePath $testFilePath `
        -BaseUrl $BaseUrl

    Write-Host "    Sending to Copilot CLI..." -NoNewline

    try {
        $output = copilot -p $prompt --model $CONFIG.CopilotModel --yolo 2>&1
        if ($LASTEXITCODE -eq 0 -and (Test-Path $testFilePath)) {
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

# ==============================================================================
# Step 5: Run Playwright (optional)
# ==============================================================================
if (-not $SkipRun -and $generatedCount -gt 0) {
    Write-StepHeader -Step 5 -Message "Running Playwright tests..."

    Push-Location $e2eRoot
    try {
        $env:API_BASE_URL = $BaseUrl
        Write-Host "  Running: npx playwright test $($CONFIG.E2eTestDir) --reporter=list"

        npx playwright test $CONFIG.E2eTestDir --reporter=list 2>&1 | ForEach-Object {
            Write-Host "  $_"
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "All E2E tests passed!"
        }
        else {
            Write-Warning "Some E2E tests failed. Review output above."
        }
    }
    finally {
        Pop-Location
    }
}

# ==============================================================================
# Step 6: Push to E2E repo (optional)
# ==============================================================================
if ($PushPr -and $generatedCount -gt 0) {
    Write-StepHeader -Step 6 -Message "Pushing to E2E repo..."
    & "$scriptDir\Push-E2ePr.ps1" -PrNumber $PushPr -E2eDir $e2eRoot
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " E2E Generation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Generated: $generatedCount test file(s)"
Write-Host "  Failed:    $failedCount file(s)"
Write-Host "  Location:  $e2eTestDir"
Write-Host ""

# ==============================================================================
# E2E Prompt Builder Function
# ==============================================================================

function Get-E2eTestPrompt {
    param(
        [string]$ClassName,
        [string]$ModuleName,
        [string]$ControllerContent,
        [string]$ServiceContent,
        [string]$HelpersContext,
        [string]$ExistingTestContent,
        [string]$TestFilePath,
        [string]$BaseUrl
    )

    return @"
You are an expert Playwright API test engineer. Generate a comprehensive E2E API test for the Spring Boot controller below.

=== WORKSPACE LAYOUT ===
- Backend: Spring Boot 4.0.3 + Java 21 + REST API + JWT Auth
- API Base: $BaseUrl
- API versioning: /v1/ prefix
- Auth: Bearer JWT token in Authorization header (created via jsonwebtoken)
- Response format: { "status": "successful"|"unsuccessful", "results": [...], "message": "..." }
- E2E Repo: thusala/skapp-pm-e2e (Playwright + TypeScript)

=== TARGET CONTROLLER ===
Class: $ClassName
Module: $ModuleName

$ControllerContent

=== SERVICE INTERFACE (for understanding behavior) ===
$ServiceContent

=== EXISTING TEST HELPERS (import and use these) ===
$HelpersContext

=== EXISTING TEST PATTERN (follow this style) ===
$ExistingTestContent

=== REQUIREMENTS ===
1. Write the test file to: $TestFilePath
2. Use Playwright test framework with @playwright/test
3. Import helpers:
   - import { createTestToken } from '../helpers/auth';
   - Use request.post/get/patch/delete for REST endpoints
4. Structure:
   - Constants section at top: ENDPOINTS, TEST_DATA, EXPECTED values
   - test.describe blocks grouping by endpoint
   - Full CRUD lifecycle where applicable
5. For EACH endpoint test:
   - Happy path with valid auth token → 200/201
   - No auth token → 401
   - Wrong role → 403 (use createTestToken with different role payload)
   - Invalid input → 400 with validation message
   - Not found (where applicable) → 404 or error response
6. Name tests: 'should <behavior> when <condition>'
7. Use unique test data with timestamps for parallel safety (e.g., Date.now())
8. Assert on: status code, response body structure, field types, error messages
9. NO hardcoded values — all in constants at top of file
10. NO test interdependencies — each test is standalone
11. Clean up created resources in afterAll/afterEach where needed
12. Use TypeScript strict types for request/response shapes

=== AUTH HELPER USAGE ===
```typescript
import { createTestToken } from '../helpers/auth';

// Default admin token
const token = createTestToken();

// Token with specific user context
const employeeToken = createTestToken({ userId: 2, email: 'emp@test.com' });

// Make authenticated REST request
const response = await request.post('$BaseUrl/v1/people/employees', {
  headers: { Authorization: token },
  data: { ... },
});

expect(response.status()).toBe(200);
const body = await response.json();
expect(body.status).toBe('successful');
```

=== DO NOT ===
- Do NOT use page/browser — this is API-only testing
- Do NOT use delays or sleep
- Do NOT depend on external services being available
- Do NOT hardcode tokens — use createTestToken helper
- Do NOT skip error cases — test ALL response codes
"@
}
