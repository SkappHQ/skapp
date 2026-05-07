<#
.SYNOPSIS
    Runs the full UI test automation pipeline end-to-end

.DESCRIPTION
    Single script that orchestrates all workflow steps:
    1. Validates prerequisites (tools, repos, submodules)
    2. Detects cross-repo changes and affected submodules
    3. Generates Playwright UI tests (Page Object + Spec)
    4. Runs tests locally (optional)
    5. Pushes tests to automation repo
    6. Opens PR with rich test report

.PARAMETER PrNumber
    Source PR number to link (required)

.PARAMETER Module
    Target module for UI tests (people, leave, project-management, authentication)

.PARAMETER Feature
    Feature name for UI tests (e.g. "work-location", "quick-add")

.PARAMETER FeatureBranch
    Feature branch name (auto-detected if not provided)

.PARAMETER FeatureName
    Short name for the branch (e.g. "work-location")

.PARAMETER SkipGenerate
    Skip test generation (use existing test files)

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
    # Full UI test pipeline
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "work-location"

    # Generate + push (skip running tests)
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "teams" -SkipTests

    # Dry run
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "teams" -DryRun
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$PrNumber,
    [Parameter(Mandatory = $true)]
    [ValidateSet("people", "leave", "project-management", "authentication")]
    [string]$Module,
    [Parameter(Mandatory = $true)]
    [string]$Feature,
    [string]$FeatureBranch,
    [string]$FeatureName,
    [switch]$SkipGenerate,
    [switch]$SkipTests,
    [switch]$SkipPush,
    [switch]$SkipPr,
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

# 1b. Locate automation repository
Write-StepHeader -Step 2 -Message "Locating automation repository..."

$projectRoot = Get-ProjectRoot
$automationLocalPath = $CONFIG.AutomationLocalPath

if (-not (Test-Path $automationLocalPath)) {
    Write-Failure "Automation repo not found at: $automationLocalPath"
    Write-Host "  Run: git clone https://github.com/$($CONFIG.AutomationRepo) $automationLocalPath"
    exit 1
}
Write-Success "Automation repo: $automationLocalPath"

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

$automationRoot = $CONFIG.AutomationLocalPath
$generatedTests = @()
$totalTests = 0
if (-not $FeatureName) { $FeatureName = $Feature }

$moduleTestDir = Join-Path $automationRoot "src/modules/$Module/tests"
$testGlob = "src/modules/$Module/tests/**/*.spec.ts"

if (-not $SkipGenerate) {
    Write-StepHeader -Step 4 -Message "Generating UI tests for $Module/$Feature..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would generate Page Object + Spec for $Module/$Feature"
        Write-Host "  [DRY RUN] Output: $automationRoot/src/modules/$Module/"
    }
    else {
        try {
            & "$scriptDir\Generate-UiTests.ps1" -Module $Module -Feature $Feature -SkipRun
        }
        catch {
            Write-Warning "UI generation encountered an error: $_"
            Write-Host "  Checking for existing test files..."
        }
    }
}
else {
    Write-StepHeader -Step 4 -Message "Skipping generation (-SkipGenerate)"
}

# Find generated/existing spec files for this module
$generatedTests = Get-ChildItem -Path $moduleTestDir -Filter "*.spec.ts" -Recurse -ErrorAction SilentlyContinue

if (-not $generatedTests -or $generatedTests.Count -eq 0) {
    Write-Failure "No test files found."
    Write-Host "  Either generation failed or no tests exist yet."
    Write-Host "  Create tests manually or fix the generation step."
    exit 1
}

Write-Success "Found $($generatedTests.Count) test file(s)"

# Count tests
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
        Write-Host "  [DRY RUN] Would run: npx playwright test $testGlob"
    }
    else {
        Push-Location $automationRoot
        try {
            # Install deps if needed
            if (-not (Test-Path "node_modules")) {
                Write-Host "  Installing dependencies..."
                npm install 2>&1 | Out-Null
            }

            Write-Host "  Running: npx playwright test $testGlob --project=chromium"
            Write-Host ""

            npx playwright test $testGlob --project=chromium --reporter=list 2>&1 | ForEach-Object {
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
}

# ==============================================================================
# Phase 4: Push & PR
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 4: Push & PR ===" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipPush) {
    Write-StepHeader -Step 6 -Message "Pushing to automation repo and opening PR..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would push to: $($CONFIG.AutomationRepo)"
        Write-Host "  [DRY RUN] Branch: feat/$PrNumber-$FeatureName-e2e-tests"
        Write-Host "  [DRY RUN] Would create PR with $totalTests test cases in report"
    }
    else {
        $pushParams = @{
            PrNumber = $PrNumber
            E2eDir   = $automationRoot
        }
        if ($FeatureName) { $pushParams.FeatureName = $FeatureName }
        if ($SkipPr) { $pushParams.SkipPr = $true }

        try {
            & "$scriptDir\Push-E2ePr.ps1" @pushParams
        }
        catch {
            Write-Warning "Push/PR step encountered an error: $_"
            Write-Host "  You can retry: .\scripts\Push-E2ePr.ps1 -PrNumber $PrNumber -E2eDir `"$automationRoot`""
        }
    }
}
else {
    Write-StepHeader -Step 6 -Message "Skipping push (-SkipPush)"
    Write-Host "  Tests generated locally at: $automationRoot"
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
Write-Host "  Module/Feature:  $Module/$Feature"
Write-Host "  Duration:        $([math]::Round($duration.TotalSeconds, 1))s"
Write-Host "  Feature:         $FeatureBranch"
Write-Host "  Repos affected:  $($affectedSubs.Count)"
Write-Host "  Test files:      $($generatedTests.Count)"
Write-Host "  Test cases:      $totalTests"
Write-Host "  Tests passed:    $(if ($SkipTests) { 'skipped' } elseif ($testsPassed) { 'YES' } else { 'SOME FAILED' })"
Write-Host "  Pushed:          $(if ($SkipPush) { 'no' } else { 'yes' })"
Write-Host "  PR:              $(if ($SkipPush -or $SkipPr) { 'skipped' } else { 'created/updated' })"
Write-Host ""
Write-Host "  Automation Repo: https://github.com/$($CONFIG.AutomationRepo)" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Next steps:" -ForegroundColor Yellow
if ($SkipTests) {
    Write-Host "    - Run tests: cd '$automationRoot' && npx playwright test $testGlob --project=chromium"
}
if (-not $testsPassed) {
    Write-Host "    - Fix failing tests and re-run pipeline"
}
if ($SkipPush) {
    Write-Host "    - Push: .\scripts\Push-E2ePr.ps1 -PrNumber $PrNumber -E2eDir `"$automationRoot`""
}
Write-Host "    - Review PR and merge when ready"
Write-Host ""
