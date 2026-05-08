<#
.SYNOPSIS
    Runs the full test automation pipeline end-to-end

.DESCRIPTION
    Single script that orchestrates all workflow steps:
    1. Validates prerequisites (tools, repos, submodules)
    2. Detects cross-repo changes and affected submodules
    3. Generates Jest FE unit tests for changed source files (committed to feature PR)
    4. Generates Playwright UI E2E tests (Page Object + Spec)
    5. Runs tests locally (optional)
    6. Pushes E2E tests to automation repo
    7. Opens PR with rich test report

.PARAMETER PrNumber
    Source PR number to link (required)

.PARAMETER Module
    Target module for tests (people, leave, project-management, authentication)

.PARAMETER Feature
    Feature name for tests (e.g. "work-location", "quick-add")

.PARAMETER FeatureBranch
    Feature branch name (auto-detected if not provided)

.PARAMETER FeatureName
    Short name for the branch (e.g. "work-location")

.PARAMETER SkipUnitTests
    Skip FE unit test generation phase

.PARAMETER SkipGenerate
    Skip E2E test generation (use existing test files)

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
    # Full pipeline (unit tests + E2E)
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "work-location"

    # Skip unit tests, only generate E2E
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "teams" -SkipUnitTests

    # Skip E2E, only generate unit tests
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "add" -SkipGenerate -SkipPush

    # Dry run
    .\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "teams" -DryRun
#>

param(
    [string]$PrNumber,
    [ValidateSet("people", "leave", "project-management", "authentication")]
    [string]$Module,
    [string]$Feature,
    [string]$FeatureBranch,
    [string]$FeatureName,
    [switch]$SkipUnitTests,
    [switch]$SkipGenerate,
    [switch]$SkipTests,
    [switch]$SkipPush,
    [switch]$SkipPr,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$startTime = Get-Date

# --- Auto-detect missing parameters ---
if (-not $PrNumber -or -not $Module -or -not $Feature) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Write-Host "  Auto-detecting pipeline parameters..." -ForegroundColor Yellow
    $detected = & "$scriptDir\Detect-PipelineParams.ps1"
    if (-not $PrNumber)  { $PrNumber = $detected.PrNumber }
    if (-not $Module)    { $Module   = $detected.Module }
    if (-not $Feature)   { $Feature  = $detected.Feature }
}

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
# Phase 2: FE Unit Test Generation
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 2: FE Unit Tests ===" -ForegroundColor Cyan
Write-Host ""

$unitTestsGenerated = 0
$unitTestsPassed = $true

# Map pipeline module to FE unit test module (project-management -> not applicable)
$feUnitModule = switch ($Module) {
    "people"              { "people" }
    "leave"               { "leave" }
    "authentication"      { $null }
    "project-management"  { $null }
    default               { $Module }
}

if (-not $SkipUnitTests -and $feUnitModule) {
    Write-StepHeader -Step 4 -Message "Detecting changed FE files for unit tests..."

    if ($DryRun) {
        Write-Host "  [DRY RUN] Would detect changed files in frontend/src/community/$feUnitModule/"
        Write-Host "  [DRY RUN] Would generate Jest unit tests and commit to feature branch"
    }
    else {
        # Detect changed files that need unit tests
        $changedFeFiles = Get-ChangedFeFiles -Module $feUnitModule

        # Filter by feature
        $featureFeFiles = @($changedFeFiles | Where-Object {
            $_.RelativePath -match ($Feature -replace '-', '[-_]?')
        })
        if (-not $featureFeFiles -or $featureFeFiles.Count -eq 0) {
            $featureFeFiles = $changedFeFiles
        }

        $needTests = @($featureFeFiles | Where-Object { -not $_.HasTest })

        Write-Host "  Changed FE files: $(if ($changedFeFiles) { $changedFeFiles.Count } else { 0 })"
        Write-Host "  Matching feature '$Feature': $(if ($featureFeFiles) { $featureFeFiles.Count } else { 0 })"
        Write-Host "  Need unit tests: $(if ($needTests) { $needTests.Count } else { 0 })"

        if ($needTests -and $needTests.Count -gt 0) {
            Write-StepHeader -Step 5 -Message "Generating Jest unit tests..."

            try {
                & "$scriptDir\Generate-FeUnitTests.ps1" -Module $feUnitModule -Feature $Feature -SkipRun
                $unitTestsGenerated = $needTests.Count
            }
            catch {
                Write-Warning "Unit test generation encountered an error: $_"
            }

            # Run the unit tests to verify
            Write-Host ""
            Write-Host "  Validating generated unit tests..." -ForegroundColor Yellow
            $feRoot = Join-Path $projectRoot $CONFIG.FrontendRoot
            Push-Location $feRoot
            try {
                $jestResult = npx jest --testPathPattern="src/community/$feUnitModule" --no-coverage 2>&1 | Out-String
                if ($LASTEXITCODE -eq 0) {
                    $unitTestsPassed = $true
                    Write-Success "All $feUnitModule unit tests pass!"
                }
                else {
                    $unitTestsPassed = $false
                    Write-Warning "Some unit tests failed. Review output."
                }
            }
            finally {
                Pop-Location
            }

            # --- Attach unit test results to source PR ---
            if ($PrNumber -and $PrNumber -ne "0") {
                Write-Host ""
                Write-Host "  Attaching unit test results to PR #$PrNumber..." -ForegroundColor Yellow

                # Extract summary line from Jest output
                $summaryLines = $jestResult -split "`n" | Where-Object {
                    $_ -match "Test Suites:|Tests:|Time:" 
                }
                $failedTests = $jestResult -split "`n" | Where-Object { $_ -match "FAIL " }

                $statusEmoji = if ($unitTestsPassed) { ":white_check_mark:" } else { ":x:" }
                $statusText = if ($unitTestsPassed) { "All Passed" } else { "Some Failed" }

                $commentBody = @"
## $statusEmoji FE Unit Test Results — ``$feUnitModule/$Feature``

| Item | Value |
|------|-------|
| Module | ``$feUnitModule`` |
| Feature | ``$Feature`` |
| Status | **$statusText** |
| Generated | $unitTestsGenerated test file(s) |
| Branch | ``$FeatureBranch`` |

<details>
<summary>Jest Summary</summary>

``````
$($summaryLines -join "`n")
``````

</details>

"@

                if (-not $unitTestsPassed -and $failedTests) {
                    $commentBody += @"

<details>
<summary>:x: Failed Tests</summary>

``````
$($failedTests -join "`n")
``````

</details>

"@
                }

                $commentBody += @"

---
*Generated by Test Automation Pipeline — $(Get-Date -Format 'yyyy-MM-dd HH:mm')*
"@

                # Post comment via gh CLI
                $ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
                if ($ghAvailable) {
                    try {
                        Push-Location $projectRoot
                        $commentBody | gh pr comment $PrNumber --body-file - 2>&1 | Out-Null
                        Pop-Location
                        Write-Success "Unit test results posted to PR #$PrNumber"
                    }
                    catch {
                        Pop-Location
                        Write-Warning "Failed to post PR comment: $_"
                    }
                }
                else {
                    Write-Warning "gh CLI not available. Skipping PR comment."
                    Write-Host "  Install: https://cli.github.com/"
                }
            }
        }
        else {
            Write-Success "All changed files already have unit tests."
        }
    }
}
elseif ($SkipUnitTests) {
    Write-StepHeader -Step 4 -Message "Skipping FE unit tests (-SkipUnitTests)"
}
else {
    Write-StepHeader -Step 4 -Message "Skipping FE unit tests (not applicable for $Module)"
}

# ==============================================================================
# Phase 3: E2E Test Generation
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 3: E2E Test Generation ===" -ForegroundColor Cyan
Write-Host ""

$automationRoot = $CONFIG.AutomationLocalPath
$generatedTests = @()
$totalTests = 0
if (-not $FeatureName) { $FeatureName = $Feature }

# --- Create matching branch in automation repo ---
$automationBranchName = if ($FeatureName) {
    "feat/$PrNumber-$FeatureName-e2e-tests"
} else {
    "feat/e2e-api-pr-$PrNumber"
}

Push-Location $automationRoot
try {
    Write-Host "  Setting up automation repo branch..."
    git fetch origin 2>&1 | Out-Null

    # Determine base branch
    $autoBaseBranch = $CONFIG.DevelopBranch
    $hasDevBranch = git branch -r --list "origin/$autoBaseBranch" 2>$null
    if (-not $hasDevBranch) {
        $autoBaseBranch = $CONFIG.DefaultBranch
    }

    # Check if branch already exists
    $localBranch = git branch --list $automationBranchName 2>$null
    $remoteBranch = git branch -r --list "origin/$automationBranchName" 2>$null

    if ($localBranch) {
        git checkout $automationBranchName 2>&1 | Out-Null
        Write-Host "  Switched to existing branch: $automationBranchName"
    }
    elseif ($remoteBranch) {
        git checkout -b $automationBranchName "origin/$automationBranchName" 2>&1 | Out-Null
        Write-Host "  Checked out remote branch: $automationBranchName"
    }
    else {
        git checkout -b $automationBranchName "origin/$autoBaseBranch" 2>&1 | Out-Null
        Write-Host "  Created new branch: $automationBranchName (from origin/$autoBaseBranch)"
    }

    Write-Success "Automation repo on branch: $automationBranchName"
}
finally {
    Pop-Location
}

$moduleTestDir = Join-Path $automationRoot "src/modules/$Module/tests"
$testGlob = "src/modules/$Module/tests/"

if (-not $SkipGenerate) {
    Write-StepHeader -Step 6 -Message "Generating UI tests for $Module/$Feature..."

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
    Write-StepHeader -Step 6 -Message "Skipping generation (-SkipGenerate)"
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
Write-Host "=== PHASE 4: E2E Test Execution ===" -ForegroundColor Cyan
Write-Host ""

$testsPassed = $true
$playwrightOutput = ""

if (-not $SkipTests) {
    Write-StepHeader -Step 7 -Message "Running Playwright tests..."

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

            $playwrightOutput = npx playwright test $testGlob --project=chromium --reporter=list 2>&1 | Out-String
            $playwrightOutput -split "`n" | ForEach-Object { Write-Host "  $_" }

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
    Write-StepHeader -Step 7 -Message "Skipping test execution (-SkipTests)"
}

# ==============================================================================
# Phase 4: Push & PR
# ==============================================================================
Write-Host ""
Write-Host "=== PHASE 5: Push & PR ===" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipPush) {
    Write-StepHeader -Step 8 -Message "Pushing to automation repo and opening PR..."

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

        # --- Attach E2E test results to automation PR ---
        if ($playwrightOutput) {
            Write-Host ""
            Write-Host "  Attaching E2E test results to automation PR..." -ForegroundColor Yellow

            # Extract summary from Playwright output
            $pwSummaryLines = $playwrightOutput -split "`n" | Where-Object {
                $_ -match "passed|failed|skipped|flaky" -and $_ -match "\d+"
            } | Select-Object -Last 3
            $pwFailedLines = $playwrightOutput -split "`n" | Where-Object { $_ -match "^\s*\d+\)" -or ($_ -match "\[chromium\]" -and $_ -match "failed|─") }

            $e2eStatusEmoji = if ($testsPassed) { ":white_check_mark:" } else { ":x:" }
            $e2eStatusText = if ($testsPassed) { "All Passed" } else { "Some Failed" }

            $e2eCommentBody = @"
## $e2eStatusEmoji E2E Test Results — ``$Module/$Feature``

| Item | Value |
|------|-------|
| Module | ``$Module`` |
| Feature | ``$Feature`` |
| Status | **$e2eStatusText** |
| Test Files | $($generatedTests.Count) |
| Test Cases | $totalTests |
| Source PR | SkappHQ/skapp#$PrNumber |
| Branch | ``$automationBranchName`` |

<details>
<summary>Playwright Summary</summary>

``````
$($pwSummaryLines -join "`n")
``````

</details>

"@

            if (-not $testsPassed -and $pwFailedLines) {
                $e2eCommentBody += @"

<details>
<summary>:x: Failed Tests</summary>

``````
$($pwFailedLines | Select-Object -First 30 | Out-String)
``````

</details>

"@
            }

            $e2eCommentBody += @"

---
*Generated by Test Automation Pipeline — $(Get-Date -Format 'yyyy-MM-dd HH:mm')*
"@

            $ghAvailable = Get-Command gh -ErrorAction SilentlyContinue
            if ($ghAvailable) {
                try {
                    Push-Location $automationRoot
                    # Find PR number in automation repo for this branch
                    $autoPrNumber = gh pr list --head $automationBranchName --json number --jq ".[0].number" 2>$null
                    if ($autoPrNumber) {
                        $e2eCommentBody | gh pr comment $autoPrNumber --body-file - 2>&1 | Out-Null
                        Write-Success "E2E test results posted to automation PR #$autoPrNumber"
                    }
                    else {
                        Write-Warning "No open PR found for branch $automationBranchName. Results not posted."
                    }
                    Pop-Location
                }
                catch {
                    Pop-Location
                    Write-Warning "Failed to post automation PR comment: $_"
                }
            }
            else {
                Write-Warning "gh CLI not available. Skipping automation PR comment."
            }
        }
    }
}
else {
    Write-StepHeader -Step 8 -Message "Skipping push (-SkipPush)"
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
Write-Host ""
Write-Host "  --- FE Unit Tests ---" -ForegroundColor White
Write-Host "  Unit tests gen:  $(if ($SkipUnitTests) { 'skipped' } else { $unitTestsGenerated })"
Write-Host "  Unit tests pass: $(if ($SkipUnitTests) { 'skipped' } elseif ($unitTestsPassed) { 'YES' } else { 'SOME FAILED' })"
Write-Host "  Committed to:    $(if ($SkipUnitTests) { 'N/A' } else { 'feature branch (in source PR)' })"
Write-Host ""
Write-Host "  --- E2E Tests ---" -ForegroundColor White
Write-Host "  E2E branch:     $automationBranchName"
Write-Host "  E2E test files:  $($generatedTests.Count)"
Write-Host "  E2E test cases:  $totalTests"
Write-Host "  E2E tests pass:  $(if ($SkipTests) { 'skipped' } elseif ($testsPassed) { 'YES' } else { 'SOME FAILED' })"
Write-Host "  Pushed:          $(if ($SkipPush) { 'no' } else { 'yes' })"
Write-Host "  PR:              $(if ($SkipPush -or $SkipPr) { 'skipped' } else { 'created/updated' })"
Write-Host ""
Write-Host "  Automation Repo: https://github.com/$($CONFIG.AutomationRepo)" -ForegroundColor Cyan
Write-Host ""

Write-Host "  Next steps:" -ForegroundColor Yellow
if (-not $unitTestsPassed) {
    Write-Host "    - Fix failing unit tests and re-commit to feature branch"
}
if ($SkipTests) {
    Write-Host "    - Run E2E tests: cd '$automationRoot' && npx playwright test $testGlob --project=chromium"
}
if (-not $testsPassed) {
    Write-Host "    - Fix failing E2E tests and re-run pipeline"
}
if ($SkipPush) {
    Write-Host "    - Push: .\scripts\Push-E2ePr.ps1 -PrNumber $PrNumber -E2eDir `"$automationRoot`""
}
Write-Host "    - Review PR and merge when ready"
Write-Host ""
