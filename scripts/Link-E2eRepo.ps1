<#
.SYNOPSIS
    Links the skapp-pm-e2e repository for E2E test generation workflow

.DESCRIPTION
    Verifies the E2E repo (thusala/skapp-pm-e2e) is accessible locally,
    validates its structure, installs dependencies, and confirms connectivity
    to the backend for test execution.

.PARAMETER E2eDir
    Path to the local clone of skapp-pm-e2e (default: configured path)

.PARAMETER BackendUrl
    Backend URL to verify connectivity (default: http://localhost:8080)

.PARAMETER Install
    Run npm install in the E2E repo

.PARAMETER Clone
    Clone the repo if not found locally

.EXAMPLE
    .\Link-E2eRepo.ps1
    .\Link-E2eRepo.ps1 -Install
    .\Link-E2eRepo.ps1 -Clone -E2eDir "C:\repos\skapp-pm-e2e"
#>

param(
    [string]$E2eDir,
    [string]$BackendUrl = "http://localhost:8080",
    [switch]$Install,
    [switch]$Clone
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Link E2E Repository" -ForegroundColor Cyan
Write-Host " Repo: $($CONFIG.E2eRepo)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Locate or clone the E2E repo
# ==============================================================================
Write-StepHeader -Step 1 -Message "Locating E2E repository..."

$e2eRoot = if ($E2eDir) { $E2eDir } else { $CONFIG.E2eLocalPath }

if (-not (Test-Path $e2eRoot)) {
    if ($Clone) {
        Write-Host "  Cloning from https://github.com/$($CONFIG.E2eRepo)..."
        $parentDir = Split-Path -Parent $e2eRoot
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
        }
        git clone "https://github.com/$($CONFIG.E2eRepo).git" $e2eRoot 2>&1 | ForEach-Object { Write-Host "  $_" }
        if ($LASTEXITCODE -ne 0) {
            Write-Failure "Clone failed. Check permissions and URL."
            exit 1
        }
        Write-Success "Cloned successfully"
    }
    else {
        Write-Failure "E2E repo not found at: $e2eRoot"
        Write-Host ""
        Write-Host "  Options:" -ForegroundColor Yellow
        Write-Host "    1. Run with -Clone flag:  .\Link-E2eRepo.ps1 -Clone"
        Write-Host "    2. Specify path:          .\Link-E2eRepo.ps1 -E2eDir 'C:\path\to\repo'"
        Write-Host "    3. Clone manually:        git clone https://github.com/$($CONFIG.E2eRepo) $e2eRoot"
        exit 1
    }
}

Write-Success "E2E repo found: $e2eRoot"

# ==============================================================================
# Step 2: Validate repo structure
# ==============================================================================
Write-StepHeader -Step 2 -Message "Validating repository structure..."

$requiredPaths = @(
    @{ Path = "package.json"; Desc = "Package manifest" },
    @{ Path = "playwright.config.ts"; Desc = "Playwright config" },
    @{ Path = "tests/api"; Desc = "API test directory" },
    @{ Path = "tests/helpers/auth.ts"; Desc = "Auth helper" },
    @{ Path = "tests/helpers/graphql.ts"; Desc = "GraphQL helper" }
)

$allValid = $true
foreach ($item in $requiredPaths) {
    $fullPath = Join-Path $e2eRoot $item.Path
    if (Test-Path $fullPath) {
        Write-Success "$($item.Desc): $($item.Path)"
    }
    else {
        Write-Warning "Missing: $($item.Path) ($($item.Desc))"
        $allValid = $false
    }
}

# ==============================================================================
# Step 3: Check git status
# ==============================================================================
Write-StepHeader -Step 3 -Message "Checking git status..."

Push-Location $e2eRoot
try {
    $currentBranch = git branch --show-current 2>$null
    $remote = git remote get-url origin 2>$null

    Write-Host "  Branch: $currentBranch"
    Write-Host "  Remote: $remote"

    # Fetch latest
    git fetch origin 2>&1 | Out-Null
    Write-Success "Git remote accessible"

    # Show status
    $status = git status --short 2>$null
    if ($status) {
        Write-Warning "Uncommitted changes in E2E repo:"
        $status | ForEach-Object { Write-Host "    $_" }
    }
    else {
        Write-Success "Working tree clean"
    }
}
finally {
    Pop-Location
}

# ==============================================================================
# Step 4: Install dependencies (optional)
# ==============================================================================
if ($Install) {
    Write-StepHeader -Step 4 -Message "Installing dependencies..."

    Push-Location $e2eRoot
    try {
        npm install 2>&1 | ForEach-Object { Write-Host "  $_" }
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependencies installed"
        }
        else {
            Write-Failure "npm install failed"
        }

        # Install Playwright browsers
        npx playwright install 2>&1 | ForEach-Object { Write-Host "  $_" }
        Write-Success "Playwright browsers installed"
    }
    finally {
        Pop-Location
    }
}
else {
    Write-StepHeader -Step 4 -Message "Checking dependencies..."

    $nodeModules = Join-Path $e2eRoot "node_modules"
    if (Test-Path $nodeModules) {
        Write-Success "node_modules exists"
    }
    else {
        Write-Warning "node_modules not found. Run with -Install flag."
    }
}

# ==============================================================================
# Step 5: List existing tests
# ==============================================================================
Write-StepHeader -Step 5 -Message "Existing test inventory..."

$testDir = Join-Path $e2eRoot "tests/api"
if (Test-Path $testDir) {
    $testFiles = Get-ChildItem -Path $testDir -Filter "*.test.ts"
    $genFiles = $testFiles | Where-Object { $_.Name -match "\.gen\.test\.ts$" }
    $manualFiles = $testFiles | Where-Object { $_.Name -notmatch "\.gen\.test\.ts$" }

    Write-Host "  Manual tests: $($manualFiles.Count)"
    foreach ($f in $manualFiles) {
        Write-Host "    - $($f.Name)" -ForegroundColor White
    }

    Write-Host "  Generated tests: $($genFiles.Count)"
    foreach ($f in $genFiles) {
        Write-Host "    - $($f.Name)" -ForegroundColor DarkGray
    }
}

# ==============================================================================
# Step 6: Test backend connectivity (optional)
# ==============================================================================
Write-StepHeader -Step 6 -Message "Testing backend connectivity..."

try {
    $healthUrl = "$BackendUrl/actuator/health"
    $response = Invoke-WebRequest -Uri $healthUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend is running at $BackendUrl"
    }
    else {
        Write-Warning "Backend responded with status $($response.StatusCode)"
    }
}
catch {
    Write-Warning "Backend not reachable at $BackendUrl (this is OK for generation-only)"
    Write-Host "    Start backend before running E2E tests."
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Link Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  E2E Repo:    $e2eRoot"
Write-Host "  GitHub:      https://github.com/$($CONFIG.E2eRepo)"
Write-Host "  Test Dir:    tests/api/"
Write-Host "  Helpers:     tests/helpers/{auth.ts, graphql.ts}"
Write-Host ""
Write-Host "  Workflow:"
Write-Host "    1. Generate:  .\scripts\Generate-E2eTests.ps1 -SkipRun"
Write-Host "    2. Run:       cd '$e2eRoot' && npx playwright test"
Write-Host "    3. Push:      .\scripts\Push-E2ePr.ps1 -PrNumber <N>"
Write-Host ""
