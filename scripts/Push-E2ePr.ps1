<#
.SYNOPSIS
    Pushes generated E2E tests to the separate E2E repository and opens a PR

.DESCRIPTION
    Full automated flow:
    1. Locates the E2E repo (local path or auto-detected)
    2. Detects .gen.test.ts files
    3. Counts test cases from file contents for reporting
    4. Optionally runs Playwright tests to verify they pass
    5. Creates feature branch from base
    6. Stages and commits test files + helpers
    7. Pushes to remote (with retry on new branch)
    8. Opens PR with rich test coverage report (via gh CLI or opens browser fallback)
    9. Prints summary with all details

.PARAMETER PrNumber
    The source repository PR number to link in the E2E PR body

.PARAMETER E2eDir
    Path to the E2E test repository (auto-detected if not specified)

.PARAMETER BranchPrefix
    Prefix for the E2E branch name (default: feat/e2e-api-pr)

.PARAMETER FeatureName
    Short feature name for the branch (e.g. "work-location"). Creates branch: feat/<name>-e2e-tests

.PARAMETER RunTests
    Run Playwright tests before pushing to verify they pass

.PARAMETER SkipPr
    Push branch but skip PR creation

.EXAMPLE
    .\Push-E2ePr.ps1 -PrNumber 42
    .\Push-E2ePr.ps1 -PrNumber 1979 -FeatureName "work-location"
    .\Push-E2ePr.ps1 -PrNumber 42 -RunTests
    .\Push-E2ePr.ps1 -PrNumber 42 -E2eDir "C:\repos\skapp-pm-e2e"
    .\Push-E2ePr.ps1 -PrNumber 42 -SkipPr
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$PrNumber,
    [string]$E2eDir,
    [string]$BranchPrefix = "feat/e2e-api-pr",
    [string]$FeatureName,
    [switch]$RunTests,
    [switch]$SkipPr
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

# ==============================================================================
# Helper Functions (must be defined before use)
# ==============================================================================

function Open-PrManually {
    param(
        [string]$E2eRepo,
        [string]$BaseBranch,
        [string]$BranchName,
        [string]$PrBody,
        [string]$E2eRoot
    )

    $manualUrl = "https://github.com/$E2eRepo/compare/$BaseBranch...$($BranchName)?expand=1"
    Write-Host ""
    Write-Host "  Opening browser for manual PR creation..." -ForegroundColor Yellow
    Write-Host "  URL: $manualUrl" -ForegroundColor Cyan
    Write-Host ""

    # Save PR body to a file for easy copy-paste
    $prBodyFile = Join-Path $E2eRoot "PR_BODY.md"
    $PrBody | Out-File -FilePath $prBodyFile -Encoding utf8
    Write-Host "  PR body saved to: $prBodyFile" -ForegroundColor Yellow
    Write-Host "  Copy the content of PR_BODY.md into the PR description."

    # Try to open browser
    try {
        Start-Process $manualUrl
        Write-Success "Browser opened. Paste PR body from PR_BODY.md"
    }
    catch {
        Write-Host "  Could not open browser. Visit the URL above manually." -ForegroundColor DarkGray
    }
}

function Build-TestReportPrBody {
    param(
        [string]$SourceRepo,
        [string]$PrNumber,
        [array]$TestReport,
        [int]$TotalTests,
        [array]$GeneratedTests,
        [bool]$TestsPassed,
        [string]$BaseUrl,
        [array]$AffectedRepos = @()
    )

    # Build file table rows
    $fileTableRows = ""
    foreach ($report in $TestReport) {
        $fileTableRows += "| ``$($report.FileName)`` | $($report.TestCount) | $($report.DescribeCount) |`n"
    }

    # Build auth coverage table rows
    $authTableRows = ""
    foreach ($report in $TestReport) {
        $auth401 = if ($report.HasAuth401) { "Yes" } else { "-" }
        $forbid403 = if ($report.HasForbid403) { "Yes" } else { "-" }
        $validation = if ($report.HasValidation) { "Yes" } else { "-" }
        $crud = if ($report.HasCrud) { "Yes" } else { "-" }
        $authTableRows += "| ``$($report.FileName)`` | $crud | $auth401 | $forbid403 | $validation |`n"
    }

    # Build scenario list
    $scenarioList = ""
    foreach ($report in $TestReport) {
        $scenarioList += "`n#### ``$($report.FileName)``  ($($report.TestCount) tests)`n"
        if ($report.Scenarios -and $report.Scenarios.Count -gt 0) {
            foreach ($scenario in $report.Scenarios) {
                $scenarioList += "- $scenario`n"
            }
        }
        else {
            $scenarioList += "- *(test.describe blocks not parsed - see file for details)*`n"
        }
    }

    # File list
    $fileList = ($GeneratedTests | ForEach-Object { "- ``$($_.Name)``" }) -join "`n"

    $statusBadge = if ($TestsPassed) { "All tests passing" } else { "Some tests need review" }

    # Build affected repos section (for cross-repo features)
    $reposSection = ""
    if ($AffectedRepos -and $AffectedRepos.Count -gt 0) {
        $reposSection = @"

---

### Affected Repositories

This feature spans **$($AffectedRepos.Count) repositories**:

| Repository | Layer | Branch | Files |
|-----------|-------|--------|:-----:|

"@
        foreach ($sub in $AffectedRepos) {
            $reposSection += "| ``$($sub.Repo)`` | $($sub.Layer) | ``$($sub.Branch)`` | $($sub.ChangedFiles.Count) |`n"
        }
    }

    return @"
## E2E API Tests - Automated Generation

### Summary
Automated Playwright E2E tests generated for source PR: [**$SourceRepo#$PrNumber**](https://github.com/$SourceRepo/pull/$PrNumber)

> **Status**: $statusBadge
> **Total Tests**: $TotalTests across $($GeneratedTests.Count) file(s)
> **Framework**: Playwright + TypeScript
> **Target**: $BaseUrl
$reposSection
---

### Test Coverage Report

| File | Tests | Suites |
|------|:-----:|:------:|
$fileTableRows

---

### Security & Auth Matrix

| File | CRUD Ops | 401 No Auth | 403 Wrong Role | 400 Validation |
|------|:---:|:---:|:---:|:---:|
$authTableRows

---

### Test Scenarios
$scenarioList

---

### Best Practices Applied

- **No hardcoded values** - Constants extracted to test data objects
- **Parallel-safe** - Unique timestamps for test isolation
- **Self-contained** - Each test creates/cleans its own resources
- **Auth helper reuse** - ``createTestToken()`` from shared ``tests/helpers/auth.ts``
- **AAA pattern** - Arrange, Act, Assert in every test case
- **Contract testing** - Status codes, body structure, field types verified

---

### How to Run

``````bash
# Install dependencies
npm install

# Run all generated tests
API_BASE_URL=$BaseUrl npx playwright test tests/api/*.gen.test.ts

# Run with HTML report
npx playwright test tests/api/*.gen.test.ts --reporter=html

# Run specific file
npx playwright test tests/api/$($GeneratedTests[0].Name)
``````

---

### Files
$fileList
"@
}

# --- Configuration ---
$SourceRepo = $CONFIG.SourceRepo
$AutomationRepo = $CONFIG.AutomationRepo

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Push Tests to Automation Repo" -ForegroundColor Cyan
Write-Host " PR: $SourceRepo#$PrNumber" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Locate automation repository
# ==============================================================================
Write-StepHeader -Step 1 -Message "Locating automation repository..."

$projectRoot = Get-ProjectRoot

if ($E2eDir) {
    $e2eRoot = Resolve-Path $E2eDir
}
else {
    $e2eRoot = $CONFIG.AutomationLocalPath
}

if (-not $e2eRoot -or -not (Test-Path $e2eRoot)) {
    Write-Failure "Automation repository not found."
    Write-Host "  Configured path: $($CONFIG.AutomationLocalPath)"
    Write-Host "  Clone: git clone https://github.com/$AutomationRepo $($CONFIG.AutomationLocalPath)"
    exit 1
}

Write-Success "Automation repo: $e2eRoot"

# ==============================================================================
# Step 2: Detect test files
# ==============================================================================
Write-StepHeader -Step 2 -Message "Detecting test files..."

$modulesDir = Join-Path $e2eRoot $CONFIG.UiTestModulesDir
$generatedTests = Get-ChildItem -Path $modulesDir -Filter "*.spec.ts" -Recurse -ErrorAction SilentlyContinue

if (-not $generatedTests -or $generatedTests.Count -eq 0) {
    Write-Warning "No .spec.ts files found in $modulesDir"
    Write-Host "  Run Generate-UiTests.ps1 first."
    exit 0
}

Write-Host "  Found $($generatedTests.Count) test file(s):"
foreach ($t in $generatedTests) {
    Write-Host "    - $($t.Name)" -ForegroundColor White
}

# ==============================================================================
# Step 3: Count test cases and build report data
# ==============================================================================
Write-StepHeader -Step 3 -Message "Analyzing test coverage..."

$testReport = @()
$totalTests = 0

foreach ($testFile in $generatedTests) {
    $content = Get-Content $testFile.FullName -Raw
    $testCount = ([regex]::Matches($content, '\btest\(|it\(')).Count
    $describeBlocks = ([regex]::Matches($content, 'test\.describe\(')).Count
    $totalTests += $testCount

    # Extract test.describe names for scenario listing
    $describeNames = [regex]::Matches($content, "test\.describe\([`"'``]([^`"'``]+)[`"'``]") |
        ForEach-Object { $_.Groups[1].Value }

    # Detect coverage categories
    $hasAuthTests = $content -match "401|unauthorized|no.*auth.*token|without.*token"
    $hasForbiddenTests = $content -match "403|forbidden|wrong.*role|insufficient"
    $hasValidationTests = $content -match "400|bad.*request|invalid|missing.*field"
    $hasCrud = $content -match "GET|POST|PUT|PATCH|DELETE"

    $testReport += @{
        FileName       = $testFile.Name
        TestCount      = $testCount
        DescribeCount  = $describeBlocks
        Scenarios      = $describeNames
        HasAuth401     = $hasAuthTests
        HasForbid403   = $hasForbiddenTests
        HasValidation  = $hasValidationTests
        HasCrud        = $hasCrud
    }

    Write-Host "    $($testFile.Name): $testCount tests, $describeBlocks suites"
}

Write-Success "Total: $totalTests test cases across $($generatedTests.Count) file(s)"

# ==============================================================================
# Step 4: Run Playwright tests (optional)
# ==============================================================================
$testsPassed = $true
$testRunOutput = ""

if ($RunTests) {
    Write-StepHeader -Step 4 -Message "Running Playwright tests..."

    Push-Location $e2eRoot
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies..."
            npm install 2>&1 | Out-Null
        }

        Write-Host "  Running: npx playwright test --project=chromium"
        $testRunOutput = npx playwright test --project=chromium --reporter=list 2>&1 | Out-String

        if ($LASTEXITCODE -eq 0) {
            Write-Success "All tests passed!"
        }
        else {
            Write-Warning "Some tests failed (exit code: $LASTEXITCODE). Continuing with push..."
            $testsPassed = $false
            Write-Host $testRunOutput
        }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-StepHeader -Step 4 -Message "Skipping test execution (use -RunTests to enable)"
}

# ==============================================================================
# Step 5: Create branch and commit
# ==============================================================================
Write-StepHeader -Step 5 -Message "Creating branch and committing..."

# Determine branch name
$branchName = if ($FeatureName) {
    "feat/$PrNumber-$FeatureName-e2e-tests"
} else {
    "$BranchPrefix-$PrNumber"
}

Push-Location $e2eRoot
try {
    # Fetch latest from remote
    Write-Host "  Fetching latest..."
    git fetch origin 2>&1 | Out-Null

    # Determine base branch
    $baseBranch = $CONFIG.DevelopBranch
    $hasDevBranch = git branch -r --list "origin/$baseBranch" 2>$null
    if (-not $hasDevBranch) {
        $baseBranch = $CONFIG.DefaultBranch
    }

    # Check if branch already exists locally or remotely
    $localBranch = git branch --list $branchName 2>$null
    $remoteBranch = git branch -r --list "origin/$branchName" 2>$null

    if ($localBranch) {
        Write-Host "  Branch $branchName exists locally, switching to it..."
        git checkout $branchName 2>&1 | Out-Null
    }
    elseif ($remoteBranch) {
        Write-Host "  Branch $branchName exists on remote, checking out..."
        git checkout -b $branchName "origin/$branchName" 2>&1 | Out-Null
    }
    else {
        Write-Host "  Creating new branch: $branchName (from origin/$baseBranch)"
        git checkout -b $branchName "origin/$baseBranch" 2>&1 | Out-Null
    }

    Write-Success "On branch: $branchName"

    # Stage all changes in modules and shared dirs
    Write-Host "  Staging test files..."
    git add "$($CONFIG.UiTestModulesDir)/" 2>&1 | Out-Null
    git add "$($CONFIG.UiTestSharedDir)/" 2>&1 | Out-Null

    # Check if there are staged changes to commit
    $stagedChanges = git diff --cached --name-only 2>$null
    if ($stagedChanges) {
        # Build a descriptive commit message
        $commitMsg = "test(ui): add Playwright tests for PR #$PrNumber`n`nGenerated $totalTests test cases across $($generatedTests.Count) file(s):`n"
        foreach ($tf in $generatedTests) {
            $commitMsg += "  - $($tf.Name)`n"
        }

        git commit -m $commitMsg 2>&1 | Out-Null
        Write-Success "Committed: test(ui): add Playwright tests for PR #$PrNumber"
    }
    else {
        # Check if there are untracked test files
        $untrackedTests = git ls-files --others --exclude-standard -- "$($CONFIG.UiTestModulesDir)/" 2>$null
        if ($untrackedTests) {
            git add $untrackedTests 2>&1 | Out-Null
            $commitMsg = "test(ui): add Playwright tests for PR #$PrNumber"
            git commit -m $commitMsg 2>&1 | Out-Null
            Write-Success "Committed new test files"
        }
        else {
            Write-Warning "No new changes to commit. Files may already be committed."
            # Check if we have any commits ahead of base branch
            $commitsAhead = git rev-list --count "origin/$baseBranch..HEAD" 2>$null
            if (-not $commitsAhead -or $commitsAhead -eq "0") {
                Write-Warning "No new test files to push. Skipping push and PR."
                Write-Host "  E2E test generation may have failed. Check Copilot CLI output above."
                Write-Host "  Existing tests are already on the $baseBranch branch."
                Pop-Location
                return
            }
        }
    }

    # ==============================================================================
    # Step 6: Push to remote
    # ==============================================================================
    Write-StepHeader -Step 6 -Message "Pushing to remote..."

    # Try push with force-with-lease first (safer)
    $pushResult = git push origin $branchName --force-with-lease 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Pushed to origin/$branchName"
    }
    else {
        # If force-with-lease fails (new branch), try regular push
        Write-Host "  Retrying with regular push (new branch)..."
        $pushResult = git push -u origin $branchName 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Pushed to origin/$branchName (new branch)"
        }
        else {
            Write-Failure "Push failed. Output:"
            Write-Host "  $pushResult"
            Write-Host ""
            Write-Host "  Possible fixes:" -ForegroundColor Yellow
            Write-Host "    - Check remote permissions: git remote -v"
            Write-Host "    - Verify auth: gh auth status"
            exit 1
        }
    }

    # ==============================================================================
    # Step 7: Open PR with test report
    # ==============================================================================
    if (-not $SkipPr) {
        Write-StepHeader -Step 7 -Message "Opening PR in E2E repo..."

        # Detect cross-repo context for the PR description
        $featureBranch = Get-FeatureBranchName
        $affectedRepos = @()
        if ($featureBranch) {
            $affectedRepos = Get-AffectedSubmodules -FeatureBranch $featureBranch
            if ($affectedRepos.Count -gt 1) {
                Write-Host "  Cross-repo feature detected ($($affectedRepos.Count) repos):"
                foreach ($sub in $affectedRepos) {
                    Write-Host "    - $($sub.Repo) ($($sub.Layer))" -ForegroundColor White
                }
            }
        }

        # Build the rich PR body with test report
        $prTitle = "test(ui): Playwright tests for $SourceRepo#$PrNumber"
        $prBody = Build-TestReportPrBody `
            -SourceRepo $SourceRepo `
            -PrNumber $PrNumber `
            -TestReport $testReport `
            -TotalTests $totalTests `
            -GeneratedTests $generatedTests `
            -TestsPassed $testsPassed `
            -BaseUrl "https://{tenant}.skapp.dev" `
            -AffectedRepos $affectedRepos

        # Check if gh CLI is available
        $ghAvailable = $null -ne (Get-Command gh -ErrorAction SilentlyContinue)

        if ($ghAvailable) {
            # Check if PR already exists for this branch
            $existingPrJson = gh pr list --repo $AutomationRepo --head $branchName --json number,url 2>$null
            $existingPr = if ($existingPrJson) { $existingPrJson | ConvertFrom-Json } else { $null }

            if ($existingPr -and $existingPr.Count -gt 0) {
                Write-Host "  PR already exists: #$($existingPr[0].number)"
                gh pr edit $existingPr[0].number --repo $AutomationRepo --body $prBody 2>&1 | Out-Null
                Write-Success "Updated existing PR #$($existingPr[0].number) with latest test report"
                Write-Host "  URL: $($existingPr[0].url)"
            }
            else {
                $baseBranchForPr = $baseBranch
                $prCreateOutput = gh pr create --repo $AutomationRepo --base $baseBranchForPr --head $branchName --title $prTitle --body $prBody 2>&1
                if ($LASTEXITCODE -ne 0 -and $baseBranchForPr -ne $CONFIG.DefaultBranch) {
                    Write-Host "  Retrying with base=$($CONFIG.DefaultBranch)..."
                    $prCreateOutput = gh pr create --repo $AutomationRepo --base $CONFIG.DefaultBranch --head $branchName --title $prTitle --body $prBody 2>&1
                }

                if ($LASTEXITCODE -eq 0) {
                    Write-Success "PR created: $prCreateOutput"
                }
                else {
                    Write-Warning "gh pr create failed. Opening browser instead."
                    Open-PrManually -E2eRepo $AutomationRepo -BaseBranch $baseBranch -BranchName $branchName -PrBody $prBody -E2eRoot $e2eRoot
                }
            }
        }
        else {
            Write-Warning "GitHub CLI (gh) not found in PATH."
            Write-Host "  Install: winget install --id GitHub.cli" -ForegroundColor DarkGray
            Open-PrManually -E2eRepo $AutomationRepo -BaseBranch $baseBranch -BranchName $branchName -PrBody $prBody -E2eRoot $e2eRoot
        }
    }
    else {
        Write-Host "  Skipping PR creation (-SkipPr flag)"
    }
}
finally {
    Pop-Location
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Push Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Branch:   $branchName"
Write-Host "  Files:    $($generatedTests.Count) test file(s)"
Write-Host "  Tests:    $totalTests test cases"
Write-Host "  Repo:     https://github.com/$AutomationRepo"
Write-Host "  Status:   $(if ($testsPassed) { 'Ready to merge' } else { 'Some tests need review' })"
Write-Host ""
