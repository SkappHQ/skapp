<#
.SYNOPSIS
    Runs the full test automation pipeline end-to-end

.DESCRIPTION
    Single script that orchestrates all workflow steps:
    1. Validates prerequisites (tools, repos, submodules)
    2. Detects cross-repo changes and affected submodules
    3. Generates E2E Playwright API tests
    4. Runs tests locally (optional, requires backend)
    5. Pushes tests to E2E repo
    6. Opens PR with rich test report

.PARAMETER PrNumber
    Source PR number to link (required)

.PARAMETER FeatureBranch
    Feature branch name (auto-detected if not provided)

.PARAMETER FeatureName
    Short name for the E2E branch (e.g. "work-location")

.PARAMETER SkipGenerate
    Skip test generation (use existing .gen.test.ts files)

.PARAMETER SkipTests
    Skip running Playwright tests before push

.PARAMETER SkipPush
    Generate tests but don't push to remote

.PARAMETER SkipPr
    Push but don't create PR

.PARAMETER BaseUrl
    Backend URL for test execution (default: http://localhost:3000)

.PARAMETER DryRun
    Show what would happen without executing

.EXAMPLE
    # Full pipeline
    .\Run-TestPipeline.ps1 -PrNumber 1979 -FeatureName "work-location"

    # Generate + push (skip running tests)
    .\Run-TestPipeline.ps1 -PrNumber 1979 -SkipTests

    # Just generate locally
    .\Run-TestPipeline.ps1 -PrNumber 1979 -SkipPush

    # Use existing generated tests, just push + PR
    .\Run-TestPipeline.ps1 -PrNumber 1979 -SkipGenerate
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$PrNumber,
    [string]$FeatureBranch,
    [string]$FeatureName,
    [switch]$SkipGenerate,
    [switch]$SkipTests,
    [switch]$SkipPush,
    [switch]$SkipPr,
    [string]$BaseUrl,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$startTime = Get-Date

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

# ==============================================================================
# Banner
# ==============================================================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  SKAPP TEST AUTOMATION PIPELINE" -ForegroundColor Magenta
Write-Host "  PR: $($CONFIG.SourceRepo)#$PrNumber" -ForegroundColor Magenta
Write-Host "  Model: $($CONFIG.CopilotModel)" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""

if ($DryRun) {
    Write-Host "  [DRY RUN MODE — no changes will be made]" -ForegroundColor Yellow
    Write-Host ""
}

# ==============================================================================
# Phase 1: Prerequisites & Environment
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 1: Prerequisites ===" -ForegroundColor Cyan
Write-Host ""

# 1a. Check required tools
Write-StepHeader -Step 1 -Message "Checking tools..."

$prereqs = Test-Prerequisites
$criticalMissing = @()

if (-not $prereqs.Git)  { $criticalMissing += "git" }
if (-not $prereqs.Node) { $criticalMissing += "node" }

if ($criticalMissing.Count -gt 0) {
    Write-Failure "Missing critical tools: $($criticalMissing -join ', ')"
    exit 1
}

Write-Success "Git: OK | Node: $(if ($prereqs.Node) {'OK'} else {'MISSING'})"
Write-Success "Java: $(if ($prereqs.Java) {'OK'} else {'N/A'}) | Maven: $(if ($prereqs.Maven) {'OK'} else {'N/A'})"
Write-Host "  gh CLI: $(if ($prereqs.GhCli) {'OK'} else {'Not found (browser fallback for PR)'})" -ForegroundColor $(if ($prereqs.GhCli) {'Green'} else {'Yellow'})

# 1b. Locate E2E repo
Write-StepHeader -Step 2 -Message "Locating E2E repository..."

$projectRoot = Get-ProjectRoot
$e2eRoot = $null
$candidatePaths = @(
    $CONFIG.E2eLocalPath,
    (Join-Path $projectRoot "skapp-pm-e2e"),
    (Join-Path (Split-Path $projectRoot) "skapp-pm-e2e")
)

foreach ($path in $candidatePaths) {
    if ($path -and (Test-Path $path)) {
        $e2eRoot = $path
        break
    }
}

if (-not $e2eRoot) {
    Write-Failure "E2E repo not found. Run: .\scripts\Link-E2eRepo.ps1 -Clone"
    exit 1
}
Write-Success "E2E repo: $e2eRoot"

# 1c. Detect feature branch and affected submodules
Write-StepHeader -Step 3 -Message "Detecting cross-repo changes..."

if (-not $FeatureBranch) {
    $FeatureBranch = Get-FeatureBranchName
}

if (-not $FeatureBranch) {
    Write-Warning "Could not detect feature branch. Using parent repo branch."
    $FeatureBranch = git branch --show-current 2>$null
}

Write-Host "  Feature branch: $FeatureBranch"

$affectedSubs = Get-AffectedSubmodules -FeatureBranch $FeatureBranch
$crossRepoContext = Get-CrossRepoContext -FeatureBranch $FeatureBranch

Write-Host ""
Write-Host "  Affected repositories: $($affectedSubs.Count)"
foreach ($sub in $affectedSubs) {
    Write-Host "    - $($sub.Repo) ($($sub.Layer)): $($sub.ChangedFiles.Count) files" -ForegroundColor White
}
Write-Host "  Total changed files: $($crossRepoContext.TotalChangedFiles)"
Write-Host "  Backend: $($crossRepoContext.BackendChanges.Count) | Frontend: $($crossRepoContext.FrontendChanges.Count)"
Write-Host "  Controllers detected: $($crossRepoContext.Controllers.Count)"

if ($crossRepoContext.Controllers.Count -eq 0 -and -not $SkipGenerate) {
    Write-Warning "No controllers found. Generation may produce no output."
    Write-Host "  The pipeline will still check for existing .gen.test.ts files."
}

# ==============================================================================
# Phase 2: Test Generation
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 2: Test Generation ===" -ForegroundColor Cyan
Write-Host ""

$e2eTestDir = Join-Path $e2eRoot $CONFIG.E2eTestDir

if (-not $SkipGenerate) {
    Write-StepHeader -Step 4 -Message "Generating E2E tests..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would generate tests for $($crossRepoContext.Controllers.Count) controller(s)"
        Write-Host "  [DRY RUN] Output dir: $e2eTestDir"
    }
    else {
        $generateArgs = @{
            FilePath     = "$scriptDir\Generate-E2eTests.ps1"
            ArgumentList = "-SkipRun"
        }
        if ($BaseUrl) {
            $generateArgs.ArgumentList += " -BaseUrl `"$BaseUrl`""
        }

        # Run the generation script
        try {
            $genOutput = & "$scriptDir\Generate-E2eTests.ps1" -SkipRun -BaseUrl $(if ($BaseUrl) { $BaseUrl } else { $API.BaseUrl }) 2>&1 | Out-String
            Write-Host $genOutput
        }
        catch {
            Write-Warning "Generation script encountered an error: $_"
            Write-Host "  Checking for existing generated tests..."
        }
    }
}
else {
    Write-StepHeader -Step 4 -Message "Skipping generation (-SkipGenerate)"
}

# Check what test files exist
$generatedTests = Get-ChildItem -Path $e2eTestDir -Filter "*.gen.test.ts" -ErrorAction SilentlyContinue

if (-not $generatedTests -or $generatedTests.Count -eq 0) {
    Write-Failure "No .gen.test.ts files found in $e2eTestDir"
    Write-Host "  Either generation failed or no tests exist."
    Write-Host "  Create tests manually or fix the generation step."
    exit 1
}

Write-Success "Found $($generatedTests.Count) generated test file(s)"

# Count tests
$totalTests = 0
foreach ($tf in $generatedTests) {
    $content = Get-Content $tf.FullName -Raw
    $count = ([regex]::Matches($content, '\btest\(|it\(')).Count
    $totalTests += $count
    Write-Host "    - $($tf.Name): $count tests"
}
Write-Host "  Total: $totalTests test cases"

# ==============================================================================
# Phase 3: Test Execution (optional)
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 3: Test Execution ===" -ForegroundColor Cyan
Write-Host ""

$testsPassed = $true

if (-not $SkipTests) {
    Write-StepHeader -Step 5 -Message "Running Playwright tests..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would run: npx playwright test $($CONFIG.E2eTestDir)/*.gen.test.ts"
    }
    else {
        Push-Location $e2eRoot
        try {
            # Install deps if needed
            if (-not (Test-Path "node_modules")) {
                Write-Host "  Installing dependencies..."
                npm install 2>&1 | Out-Null
            }

            $env:API_BASE_URL = if ($BaseUrl) { $BaseUrl } else { $API.BaseUrl }
            Write-Host "  API_BASE_URL: $env:API_BASE_URL"
            Write-Host "  Running tests..."
            Write-Host ""

            npx playwright test "$($CONFIG.E2eTestDir)/*.gen.test.ts" --reporter=list 2>&1 | ForEach-Object {
                Write-Host "  $_"
            }

            if ($LASTEXITCODE -eq 0) {
                Write-Success "All tests passed!"
            }
            else {
                $testsPassed = $false
                Write-Warning "Some tests failed (exit code: $LASTEXITCODE). Continuing..."
            }
        }
        finally {
            Pop-Location
        }
    }
}
else {
    Write-StepHeader -Step 5 -Message "Skipping test execution (-SkipTests)"
    Write-Host "  Tip: Start backend and run with tests enabled for validation"
}

# ==============================================================================
# Phase 4: Push & PR
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 4: Push & PR ===" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipPush) {
    Write-StepHeader -Step 6 -Message "Pushing to E2E repo and opening PR..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would push to: $($CONFIG.E2eRepo)"
        Write-Host "  [DRY RUN] Branch: feat/$PrNumber-$FeatureName-e2e-tests"
        Write-Host "  [DRY RUN] Would create PR with $totalTests test cases in report"
    }
    else {
        $pushArgs = "-PrNumber `"$PrNumber`""
        if ($FeatureName) {
            $pushArgs += " -FeatureName `"$FeatureName`""
        }
        if ($SkipPr) {
            $pushArgs += " -SkipPr"
        }

        # Build argument list for Push-E2ePr.ps1
        $pushParams = @{
            PrNumber = $PrNumber
        }
        if ($FeatureName) { $pushParams.FeatureName = $FeatureName }
        if ($SkipPr) { $pushParams.SkipPr = $true }

        try {
            & "$scriptDir\Push-E2ePr.ps1" @pushParams
        }
        catch {
            Write-Warning "Push/PR step encountered an error: $_"
            Write-Host "  You can retry manually: .\scripts\Push-E2ePr.ps1 -PrNumber $PrNumber"
        }
    }
}
else {
    Write-StepHeader -Step 6 -Message "Skipping push (-SkipPush)"
    Write-Host "  Tests generated locally at: $e2eTestDir"
}

# ==============================================================================
# Final Summary
# ==============================================================================
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host "  PIPELINE COMPLETE" -ForegroundColor Magenta
Write-Host "================================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "  Duration:        $([math]::Round($duration.TotalSeconds, 1))s"
Write-Host "  Feature:         $FeatureBranch"
Write-Host "  Repos affected:  $($affectedSubs.Count)"
Write-Host "  Test files:      $($generatedTests.Count)"
Write-Host "  Test cases:      $totalTests"
Write-Host "  Tests passed:    $(if ($SkipTests) { 'skipped' } elseif ($testsPassed) { 'YES' } else { 'SOME FAILED' })"
Write-Host "  Pushed:          $(if ($SkipPush) { 'no' } else { 'yes' })"
Write-Host "  PR:              $(if ($SkipPush -or $SkipPr) { 'skipped' } else { 'created/updated' })"
Write-Host ""

if (-not $SkipPush) {
    Write-Host "  E2E Repo: https://github.com/$($CONFIG.E2eRepo)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Yellow
if ($SkipTests) {
    Write-Host "    - Run tests: .\scripts\Run-E2eTests.ps1 -Reporter html -OpenReport"
}
if (-not $testsPassed) {
    Write-Host "    - Fix failing tests and re-run pipeline"
}
if ($SkipPush) {
    Write-Host "    - Push: .\scripts\Push-E2ePr.ps1 -PrNumber $PrNumber"
}
Write-Host "    - Review PR and merge when ready"
Write-Host ""
