<#
.SYNOPSIS
    One-time setup for Skapp Test Automation

.DESCRIPTION
    Validates prerequisites, installs missing tools, and configures the workspace
    for automated test generation using GitHub Copilot CLI with Claude Opus 4.6.

.PARAMETER SourceRepo
    The main source repository (default: SkappHQ/skapp)

.PARAMETER E2eRepo
    The E2E test repository (default: rootcodelabs/skapp-ep-be-tests)

.EXAMPLE
    .\Setup-TestAutomation.ps1
    .\Setup-TestAutomation.ps1 -SourceRepo "SkappHQ/skapp" -E2eRepo "rootcodelabs/skapp-ep-be-tests"
#>

param(
    [string]$SourceRepo = "SkappHQ/skapp",
    [string]$E2eRepo = "rootcodelabs/skapp-ep-be-tests"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Skapp Test Automation Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Check Prerequisites
# ==============================================================================
Write-StepHeader -Step 1 -Message "Checking prerequisites..."

$prereqs = Test-Prerequisites
$allPassed = $true

$prereqItems = @(
    @{ Name = "Java 21+"; Key = "Java"; Install = "Download from https://adoptium.net/" },
    @{ Name = "Maven (mvnw)"; Key = "Maven"; Install = "Included in backend/mvnw" },
    @{ Name = "Node.js 20+"; Key = "Node"; Install = "nvm install 20" },
    @{ Name = "Git"; Key = "Git"; Install = "winget install Git.Git" },
    @{ Name = "GitHub CLI (gh)"; Key = "GhCli"; Install = "winget install GitHub.cli" },
    @{ Name = "Copilot CLI"; Key = "Copilot"; Install = "VS Code Copilot extension (includes CLI)" }
)

foreach ($item in $prereqItems) {
    if ($prereqs[$item.Key]) {
        Write-Success "$($item.Name)"
    }
    else {
        Write-Failure "$($item.Name) — Install: $($item.Install)"
        $allPassed = $false
    }
}

# ==============================================================================
# Step 2: Install GitHub CLI if missing
# ==============================================================================
Write-StepHeader -Step 2 -Message "GitHub CLI setup..."

if (-not $prereqs.GhCli) {
    Write-Host "Installing GitHub CLI..."
    try {
        winget install GitHub.cli --accept-source-agreements --accept-package-agreements
        Write-Success "GitHub CLI installed. Restart terminal and re-run this script."
        exit 0
    }
    catch {
        Write-Failure "Could not auto-install gh. Install manually: winget install GitHub.cli"
    }
}
else {
    Write-Success "GitHub CLI already installed"
}

# ==============================================================================
# Step 3: Verify GitHub Authentication
# ==============================================================================
Write-StepHeader -Step 3 -Message "Verifying GitHub authentication..."

$ghStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Not authenticated. Run: gh auth login"
    Write-Host "  Or set: `$env:GH_TOKEN = '<your-pat>'"
}
else {
    Write-Success "GitHub CLI authenticated"
}

# ==============================================================================
# Step 4: Verify Copilot CLI Model Access
# ==============================================================================
Write-StepHeader -Step 4 -Message "Verifying Copilot CLI model access..."

if ($prereqs.Copilot) {
    Write-Host "Testing Copilot CLI with $($CONFIG.CopilotModel)..."
    $testOutput = copilot -s -p "Reply with OK" --model $CONFIG.CopilotModel 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Copilot CLI with $($CONFIG.CopilotModel) is working"
    }
    else {
        Write-Warning "Copilot CLI may not have premium model access. Output: $testOutput"
    }
}
else {
    Write-Warning "Copilot CLI not found. Ensure VS Code Copilot extension is active."
}

# ==============================================================================
# Step 5: Verify E2E Repository Access
# ==============================================================================
Write-StepHeader -Step 5 -Message "Checking E2E repository access..."

$e2eAccess = gh repo view $E2eRepo --json name 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "E2E repo ($E2eRepo) accessible on GitHub"
}
else {
    Write-Warning "Cannot access E2E repo ($E2eRepo). Check permissions."
}

# Check local E2E repo
if (Test-Path $CONFIG.E2eLocalPath) {
    Write-Success "E2E repo found locally: $($CONFIG.E2eLocalPath)"
}
else {
    Write-Warning "E2E repo not found locally at: $($CONFIG.E2eLocalPath)"
    Write-Host "  Run: .\scripts\Link-E2eRepo.ps1 -Clone"
}

# ==============================================================================
# Step 6: Verify Backend Test Dependencies
# ==============================================================================
Write-StepHeader -Step 6 -Message "Checking backend test dependencies..."

$pomPath = Join-Path (Get-ProjectRoot) "backend/pom.xml"
if (Test-Path $pomPath) {
    $pomContent = Get-Content $pomPath -Raw
    $requiredDeps = @(
        "spring-boot-starter-test",
        "spring-boot-starter-webmvc-test",
        "h2",
        "spring-security-test"
    )

    foreach ($dep in $requiredDeps) {
        if ($pomContent -match $dep) {
            Write-Success "Dependency: $dep"
        }
        else {
            Write-Warning "Missing dependency: $dep in pom.xml"
        }
    }
}
else {
    Write-Failure "Cannot find backend/pom.xml"
}

# ==============================================================================
# Step 7: Verify Test Support Utilities
# ==============================================================================
Write-StepHeader -Step 7 -Message "Checking test support utilities..."

$projectRoot = Get-ProjectRoot
$supportFiles = @(
    "backend/src/test/java/com/skapp/support/TestConstants.java",
    "backend/src/test/java/com/skapp/support/SecurityTestUtils.java",
    "backend/src/test/java/com/skapp/support/MockUserFactory.java",
    "backend/src/test/java/com/skapp/TestSkappApplication.java"
)

foreach ($file in $supportFiles) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        Write-Success $file
    }
    else {
        Write-Warning "Missing: $file"
    }
}

# ==============================================================================
# Step 8: Verify E2E Repo Structure
# ==============================================================================
Write-StepHeader -Step 8 -Message "Checking E2E test repo structure..."

$e2eRoot = $CONFIG.E2eLocalPath
if (Test-Path $e2eRoot) {
    $e2eChecks = @(
        @{ Path = "playwright.config.ts"; Desc = "Playwright config" },
        @{ Path = "tests/helpers/auth.ts"; Desc = "Auth helper" },
        @{ Path = "tests/helpers/graphql.ts"; Desc = "GraphQL helper" },
        @{ Path = "tests/api"; Desc = "API test directory" }
    )

    foreach ($check in $e2eChecks) {
        $fullPath = Join-Path $e2eRoot $check.Path
        if (Test-Path $fullPath) {
            Write-Success "$($check.Desc)"
        }
        else {
            Write-Warning "Missing: $($check.Path)"
        }
    }
}
else {
    Write-Warning "E2E repo not available locally. Run: .\scripts\Link-E2eRepo.ps1 -Clone"
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Setup Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Link E2E repo:        .\scripts\Link-E2eRepo.ps1 -Install"
Write-Host "  2. Generate unit tests:  .\scripts\Generate-BeTests.ps1"
Write-Host "  3. Generate E2E tests:   .\scripts\Generate-E2eTests.ps1 -SkipRun"
Write-Host "  4. Push E2E to repo:     .\scripts\Push-E2ePr.ps1 -PrNumber <N>"
Write-Host ""

if (-not $allPassed) {
    Write-Warning "Some prerequisites are missing. Fix them before generating tests."
    exit 1
}
