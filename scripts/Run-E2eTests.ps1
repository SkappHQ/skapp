<#
.SYNOPSIS
    Runs Playwright E2E tests and generates an HTML report

.DESCRIPTION
    Runs the generated E2E tests in the linked E2E repository.
    Optionally generates HTML/JSON reports for PR attachments.

    Steps:
    1. Locate E2E repository
    2. Install dependencies (if needed)
    3. Run Playwright tests with selected reporter
    4. Open HTML report (optional)

.PARAMETER E2eDir
    Path to the E2E test repository (auto-detected)

.PARAMETER Filter
    Glob pattern to filter which test files to run (default: *.gen.test.ts)

.PARAMETER Reporter
    Playwright reporter type: list, html, json, dot (default: list)

.PARAMETER BaseUrl
    Backend base URL (default: from config)

.PARAMETER OpenReport
    Open HTML report in browser after run

.PARAMETER Install
    Run npm install before tests

.EXAMPLE
    .\Run-E2eTests.ps1
    .\Run-E2eTests.ps1 -Reporter html -OpenReport
    .\Run-E2eTests.ps1 -Filter "work-location*"
    .\Run-E2eTests.ps1 -BaseUrl "http://localhost:8080" -Install
#>

param(
    [string]$E2eDir,
    [string]$Filter = "*.gen.test.ts",
    [ValidateSet("list", "html", "json", "dot")]
    [string]$Reporter = "list",
    [string]$BaseUrl,
    [switch]$OpenReport,
    [switch]$Install
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Run E2E Tests (Playwright)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Locate E2E repository
# ==============================================================================
Write-StepHeader -Step 1 -Message "Locating E2E repository..."

$projectRoot = Get-ProjectRoot

if ($E2eDir) {
    $e2eRoot = Resolve-Path $E2eDir
}
else {
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
    Write-Failure "E2E repository not found."
    Write-Host "  Run: .\scripts\Link-E2eRepo.ps1 -Clone"
    exit 1
}

Write-Success "E2E repo: $e2eRoot"

# ==============================================================================
# Step 2: Install dependencies (if needed)
# ==============================================================================
Write-StepHeader -Step 2 -Message "Checking dependencies..."

Push-Location $e2eRoot
try {
    if ($Install -or -not (Test-Path "node_modules")) {
        Write-Host "  Installing dependencies..."
        npm install 2>&1 | ForEach-Object { Write-Host "    $_" }
        if ($LASTEXITCODE -ne 0) {
            Write-Failure "npm install failed"
            exit 1
        }
        Write-Success "Dependencies installed"
    }
    else {
        Write-Success "node_modules exists"
    }

    # ==============================================================================
    # Step 3: List matching test files
    # ==============================================================================
    Write-StepHeader -Step 3 -Message "Finding test files..."

    $testDir = Join-Path $e2eRoot $CONFIG.E2eTestDir
    $testFiles = Get-ChildItem -Path $testDir -Filter $Filter -ErrorAction SilentlyContinue

    if (-not $testFiles -or $testFiles.Count -eq 0) {
        Write-Warning "No test files matching '$Filter' in $testDir"
        exit 0
    }

    Write-Host "  Matching files: $($testFiles.Count)"
    foreach ($tf in $testFiles) {
        $testCount = ([regex]::Matches((Get-Content $tf.FullName -Raw), '\btest\(|it\(')).Count
        Write-Host "    - $($tf.Name) ($testCount tests)" -ForegroundColor White
    }

    # ==============================================================================
    # Step 4: Run Playwright tests
    # ==============================================================================
    Write-StepHeader -Step 4 -Message "Running Playwright tests (reporter: $Reporter)..."

    # Set environment
    $env:API_BASE_URL = if ($BaseUrl) { $BaseUrl } else { $API.BaseUrl }
    Write-Host "  API_BASE_URL: $env:API_BASE_URL"
    Write-Host ""

    # Build test glob pattern
    $testGlob = "$($CONFIG.E2eTestDir)/$Filter"

    # Run playwright
    $startTime = Get-Date
    npx playwright test $testGlob --reporter=$Reporter 2>&1 | ForEach-Object {
        Write-Host "  $_"
    }
    $endTime = Get-Date
    $duration = $endTime - $startTime
    $exitCode = $LASTEXITCODE

    Write-Host ""
    Write-Host "  Duration: $([math]::Round($duration.TotalSeconds, 1))s"

    if ($exitCode -eq 0) {
        Write-Success "All tests passed!"
    }
    else {
        Write-Failure "Some tests failed (exit code: $exitCode)"
    }

    # ==============================================================================
    # Step 5: Open report (optional)
    # ==============================================================================
    if ($Reporter -eq "html" -or $OpenReport) {
        Write-StepHeader -Step 5 -Message "Opening HTML report..."

        $reportDir = Join-Path $e2eRoot "playwright-report"
        if (Test-Path $reportDir) {
            npx playwright show-report 2>&1 | Out-Null
            Write-Success "Report opened in browser"
        }
        else {
            # Generate HTML report if we used a different reporter
            if ($Reporter -ne "html") {
                Write-Host "  Generating HTML report..."
                npx playwright test $testGlob --reporter=html 2>&1 | Out-Null
                npx playwright show-report 2>&1 | Out-Null
            }
        }
    }

    # ==============================================================================
    # Summary
    # ==============================================================================
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " Test Run Complete" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Files:     $($testFiles.Count)"
    Write-Host "  Duration:  $([math]::Round($duration.TotalSeconds, 1))s"
    Write-Host "  Result:    $(if ($exitCode -eq 0) { 'PASSED' } else { 'FAILED' })"
    Write-Host "  Reporter:  $Reporter"
    Write-Host ""

    if ($exitCode -ne 0) {
        Write-Host "  Next steps:" -ForegroundColor Yellow
        Write-Host "    - Review failures above"
        Write-Host "    - Run with -Reporter html -OpenReport for detailed view"
        Write-Host "    - Ensure backend is running at $env:API_BASE_URL"
    }

    exit $exitCode
}
finally {
    Pop-Location
}
