<#
.SYNOPSIS
    Generates Playwright UI E2E tests for the skapp-automation repo

.DESCRIPTION
    Detects changed frontend pages/components across submodules, then generates
    Playwright UI tests following the existing patterns in thusala/skapp-automation:
    - Page Object Model (POM) classes in src/modules/<module>/pages/
    - Spec files in src/modules/<module>/tests/super-admin/
    - Shared helpers from src/shared/helpers/
    - Test data from src/shared/data/

.PARAMETER Module
    Target module (people, leave, project-management, authentication)

.PARAMETER Feature
    Feature name within the module (e.g. "quick-add", "teams", "termination")

.PARAMETER FeatureBranch
    Feature branch to detect changes from (auto-detected)

.PARAMETER SkipRun
    Generate tests without running Playwright

.PARAMETER PushPr
    After generation, push to automation repo and open PR

.EXAMPLE
    .\Generate-UiTests.ps1 -Module people -Feature "work-location"
    .\Generate-UiTests.ps1 -Module people -Feature "full-add" -SkipRun
    .\Generate-UiTests.ps1 -Module leave -Feature "apply" -PushPr 1979
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("people", "leave", "project-management", "authentication")]
    [string]$Module,
    [Parameter(Mandatory = $true)]
    [string]$Feature,
    [string]$FeatureBranch,
    [switch]$SkipRun,
    [string]$PushPr
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Import shared config
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

# ==============================================================================
# Prompt Builder Function (must be defined before use)
# ==============================================================================

function Get-UiTestPrompt {
    param(
        [string]$Module,
        [string]$Feature,
        [string]$PageClassName,
        [string]$PageFilePath,
        [string]$SpecFilePath,
        [string]$ReferencePageContent,
        [string]$ReferenceSpecContent,
        [string]$HelpersContext,
        [string]$RoutesContent,
        [string]$TestDataContent,
        [string]$FeatureSourceContext
    )

    return @"
You are an expert Playwright UI test engineer. Generate comprehensive E2E UI tests for a Skapp feature.

=== PROJECT: thusala/skapp-automation ===
- Framework: Playwright + TypeScript
- Pattern: Page Object Model (POM)
- Test dir: src/modules/<module>/tests/super-admin/
- Pages dir: src/modules/<module>/pages/
- Shared: src/shared/{helpers, constants, data}
- Auth: Pre-authenticated via storageState (login handled by setup project)
- Base URL: Environment-based (https://{tenant}.skapp.dev or https://{tenant}.skapp.com)
- Navigation: Uses getTenantUrl(ROUTES.DASHBOARD) then POM methods to navigate

=== ARCHITECTURE CONVENTIONS ===
1. Page Object classes:
   - Import { Page, Locator, expect } from '@playwright/test'
   - All locators defined as readonly properties in constructor
   - Use semantic locators: getByRole, getByText, getByPlaceholder, getByTestId, getByLabel
   - Group locators by section (navigation, form fields, actions, verification)
   - Methods: navigate, fill, click, verify (each small and focused)
   - One high-level orchestrator method (e.g. addFullProfile, deleteUser)

2. Spec files:
   - Import { test, expect } from '@playwright/test'
   - Import page object from relative path: ../../pages/PageName
   - Import helpers: ../../../../shared/helpers/...
   - Import routes: ../../../../shared/constants/routes
   - Import test data: ../../../../shared/data/people.json
   - test.describe block per feature
   - Tests use page object methods (never raw locators in specs)
   - Use generateRandomEmail() for unique test data
   - Navigate via: page.goto(getTenantUrl(ROUTES.DASHBOARD))

3. Naming:
   - Page files: PascalCase (e.g. PeopleFullAddPage.ts, TeamsPage.ts)
   - Spec files: kebab-case (e.g. people-full-profile-add.spec.ts, add-team.spec.ts)
   - Test names: 'should <behavior> when <condition>'

4. Selectors priority:
   - getByRole('button', { name: '...' })
   - getByRole('combobox', { name: '...' })
   - getByPlaceholder('...')
   - getByText('...')
   - getByTestId('...')
   - getByLabel('...')
   - page.locator('button').filter({ hasText: '...' })

=== TARGET ===
Module: $Module
Feature: $Feature
Page class: $PageClassName
Page file: $PageFilePath
Spec file: $SpecFilePath

=== EXISTING PAGE OBJECT REFERENCE (follow this style exactly) ===
$ReferencePageContent

=== EXISTING SPEC REFERENCE (follow this style exactly) ===
$ReferenceSpecContent

=== SHARED HELPERS (available for import) ===
$HelpersContext

=== ROUTES CONSTANTS ===
$RoutesContent

=== TEST DATA (src/shared/data/people.json) ===
$TestDataContent

=== FRONTEND SOURCE (the actual UI being tested) ===
$FeatureSourceContext

=== GENERATE TWO FILES ===

FILE 1: $PageFilePath
- Page Object class following the exact pattern above
- All locators as readonly Locator properties
- Semantic locators (getByRole, getByText, etc.)
- Navigation, form fill, action, and verify methods
- One orchestrator method combining the full flow

FILE 2: $SpecFilePath
- Spec file with test.describe
- Import the page object class
- Import shared helpers (generateRandomEmail, getTenantUrl, ROUTES, testData)
- Happy path test (full successful flow)
- Additional edge cases if applicable (validation, cancel, etc.)
- Use AAA pattern: Arrange (navigate/setup), Act (perform action), Assert (verify result)

=== DO NOT ===
- Do NOT use page.waitForTimeout() — use waitFor({ state: 'visible' }) or expect().toBeVisible()
- Do NOT use CSS selectors unless absolutely necessary
- Do NOT hardcode URLs — use getTenantUrl() helper
- Do NOT hardcode emails — use generateRandomEmail()
- Do NOT skip assertions — every test must verify the outcome
- Do NOT duplicate locator logic — keep it in the page object only
"@
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " UI Test Generation (Playwright)" -ForegroundColor Cyan
Write-Host " Module: $Module | Feature: $Feature" -ForegroundColor Cyan
Write-Host " Model: $($CONFIG.CopilotModel)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ==============================================================================
# Step 1: Locate automation repository
# ==============================================================================
Write-StepHeader -Step 1 -Message "Locating automation repository..."

$automationRoot = $CONFIG.AutomationLocalPath

if (-not (Test-Path $automationRoot)) {
    Write-Failure "Automation repo not found at: $automationRoot"
    Write-Host "  Clone it: git clone https://github.com/$($CONFIG.AutomationRepo) $automationRoot"
    exit 1
}

Write-Success "Automation repo: $automationRoot"

# Verify module directory exists
$moduleDir = Join-Path $automationRoot "$($CONFIG.UiTestModulesDir)/$Module"
if (-not (Test-Path $moduleDir)) {
    Write-Host "  Creating module directory: $moduleDir"
    New-Item -ItemType Directory -Path $moduleDir -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $moduleDir "pages") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $moduleDir "tests/super-admin") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $moduleDir "helpers") -Force | Out-Null
}

# ==============================================================================
# Step 2: Detect frontend changes for context
# ==============================================================================
Write-StepHeader -Step 2 -Message "Detecting frontend changes..."

$projectRoot = Get-ProjectRoot

if (-not $FeatureBranch) {
    $FeatureBranch = Get-FeatureBranchName
}

Write-Host "  Feature branch: $FeatureBranch"

# Get cross-repo context to understand what changed
$crossRepoContext = Get-CrossRepoContext -FeatureBranch $FeatureBranch
$frontendChanges = $crossRepoContext.FrontendChanges

if ($frontendChanges -and $frontendChanges.Count -gt 0) {
    Write-Host "  Frontend changes: $($frontendChanges.Count) files"
    $relevantChanges = $frontendChanges | Where-Object { $_ -match $Module -or $_ -match ($Feature -replace '-', '') }
    if ($relevantChanges) {
        Write-Host "  Relevant to $Module/$($Feature):"
        $relevantChanges | Select-Object -First 10 | ForEach-Object { Write-Host "    - $_" -ForegroundColor White }
    }
}
else {
    Write-Warning "No frontend changes detected. Will generate based on feature description."
}

# ==============================================================================
# Step 3: Load existing patterns for reference
# ==============================================================================
Write-StepHeader -Step 3 -Message "Loading existing test patterns..."

# Load an existing page object for reference
$existingPages = Get-ChildItem -Path (Join-Path $moduleDir "pages") -Filter "*.ts" -ErrorAction SilentlyContinue
$referencePageContent = ""
if ($existingPages) {
    $referencePageContent = Get-Content $existingPages[0].FullName -Raw
    Write-Host "  Reference page: $($existingPages[0].Name)"
}

# Load an existing spec for reference
$existingSpecs = Get-ChildItem -Path (Join-Path $moduleDir "tests") -Filter "*.spec.ts" -Recurse -ErrorAction SilentlyContinue
$referenceSpecContent = ""
if ($existingSpecs) {
    $referenceSpecContent = Get-Content $existingSpecs[0].FullName -Raw
    Write-Host "  Reference spec: $($existingSpecs[0].Name)"
}

# Load shared helpers
$sharedDir = Join-Path $automationRoot $CONFIG.UiTestSharedDir
$helpersContext = ""
$helperFiles = @("urlHelper.ts", "mailosaurHelper.ts", "testDataHelper.ts")
foreach ($hf in $helperFiles) {
    $helperPath = Join-Path $sharedDir "helpers/$hf"
    if (Test-Path $helperPath) {
        $helpersContext += "`n// === $hf ===`n"
        $helpersContext += Get-Content $helperPath -Raw
    }
}

# Load routes
$routesPath = Join-Path $sharedDir "constants/routes.ts"
$routesContent = ""
if (Test-Path $routesPath) {
    $routesContent = Get-Content $routesPath -Raw
}

# Load existing test data for the module
$testDataPath = Join-Path $sharedDir "data/people.json"
$testDataContent = ""
if (Test-Path $testDataPath) {
    $testDataContent = Get-Content $testDataPath -Raw
}

Write-Success "Context loaded (pages: $($existingPages.Count), specs: $($existingSpecs.Count))"

# ==============================================================================
# Step 4: Read relevant frontend source for the feature
# ==============================================================================
Write-StepHeader -Step 4 -Message "Reading frontend source for context..."

$featureSourceContext = ""

# Try to find the frontend page/component for this feature
$featurePatterns = @(
    "frontend/pages/**/people/**$Feature*",
    "frontend/src/**/people/**$Feature*",
    "frontend/pages/enterprise/people/**$Feature*",
    "frontend/src/enterprise/people/**$Feature*",
    "frontend/src/community/people/**$Feature*"
)

$featureFiles = @()
foreach ($pattern in $featurePatterns) {
    $found = Get-ChildItem -Path $projectRoot -Include "*.tsx","*.ts" -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match ($Feature -replace '-', '[-_]?') -and $_.FullName -match $Module }
    if ($found) {
        $featureFiles += $found | Select-Object -First 5
        break
    }
}

if ($featureFiles.Count -gt 0) {
    Write-Host "  Found $($featureFiles.Count) relevant source file(s):"
    foreach ($ff in $featureFiles) {
        Write-Host "    - $($ff.Name)" -ForegroundColor White
        $featureSourceContext += "`n// === $($ff.Name) ===`n"
        # Read first 200 lines for context (avoid huge files)
        $featureSourceContext += (Get-Content $ff.FullName -TotalCount 200) -join "`n"
    }
}
else {
    Write-Warning "No feature source files found matching '$Feature' in '$Module'"
}

# ==============================================================================
# Step 5: Generate Page Object and Spec
# ==============================================================================
Write-StepHeader -Step 5 -Message "Generating UI tests..."

$featurePascal = ($Feature -split '-' | ForEach-Object { $_.Substring(0,1).ToUpper() + $_.Substring(1) }) -join ''
$pageClassName = "$featurePascal" + "Page"
$pageFileName = "$pageClassName.ts"
$specFileName = "$($Feature).spec.ts"

$pageFilePath = Join-Path $moduleDir "pages/$pageFileName"
$specFilePath = Join-Path $moduleDir "tests/super-admin/$specFileName"

Write-Host "  Page Object: $pageFileName -> $pageFilePath"
Write-Host "  Spec file:   $specFileName -> $specFilePath"

# Build the generation prompt
$prompt = Get-UiTestPrompt `
    -Module $Module `
    -Feature $Feature `
    -PageClassName $pageClassName `
    -PageFilePath $pageFilePath `
    -SpecFilePath $specFilePath `
    -ReferencePageContent $referencePageContent `
    -ReferenceSpecContent $referenceSpecContent `
    -HelpersContext $helpersContext `
    -RoutesContent $routesContent `
    -TestDataContent $testDataContent `
    -FeatureSourceContext $featureSourceContext

Write-Host "  Sending to Copilot CLI ($($CONFIG.CopilotModel))..." -NoNewline

try {
    # Save prompt to file for reference
    $promptFile = Join-Path $automationRoot "GENERATION_PROMPT.md"
    $prompt | Out-File -FilePath $promptFile -Encoding utf8

    # Call node.exe directly to avoid copilot.ps1 wrapper's StandardOutputEncoding error
    $nodeExe = (Get-Command node).Source
    $copilotModule = Join-Path (Split-Path $nodeExe -Parent) "node_modules\@github\copilot\npm-loader.js"
    & $nodeExe $copilotModule -p $prompt --model $CONFIG.CopilotModel --yolo
    $copilotExit = $LASTEXITCODE

    if ($copilotExit -eq 0) {
        Write-Host " OK" -ForegroundColor Green
    }
    else {
        Write-Host " FAILED (exit $copilotExit)" -ForegroundColor Red
    }
}
catch {
    Write-Host " ERROR" -ForegroundColor Red
    Write-Host "  $_"
    Write-Host ""
    Write-Host "  Copilot CLI not available. Generate manually or use VS Code Copilot chat."
    Write-Host "  Prompt saved to: $(Join-Path $automationRoot 'GENERATION_PROMPT.md')"
    $prompt | Out-File -FilePath (Join-Path $automationRoot "GENERATION_PROMPT.md") -Encoding utf8
}

# Verify files were generated
$generatedFiles = @()
if (Test-Path $pageFilePath) {
    $generatedFiles += $pageFilePath
    Write-Success "Generated: $pageFileName"
}
if (Test-Path $specFilePath) {
    $generatedFiles += $specFilePath
    Write-Success "Generated: $specFileName"
}

if ($generatedFiles.Count -eq 0) {
    Write-Warning "No files generated. Check Copilot CLI output above."
    Write-Host "  You can manually create:"
    Write-Host "    - $pageFilePath"
    Write-Host "    - $specFilePath"
}

# ==============================================================================
# Step 6: Run tests (optional)
# ==============================================================================
if (-not $SkipRun -and $generatedFiles.Count -gt 0) {
    Write-StepHeader -Step 6 -Message "Running Playwright tests..."

    Push-Location $automationRoot
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  Installing dependencies..."
            npm install 2>&1 | Out-Null
        }

        Write-Host "  Running: npx playwright test $specFilePath --project=chromium"
        npx playwright test $specFilePath --project=chromium --reporter=list 2>&1 | ForEach-Object {
            Write-Host "  $_"
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Success "All tests passed!"
        }
        else {
            Write-Warning "Some tests failed. Review output above."
        }
    }
    finally {
        Pop-Location
    }
}

# ==============================================================================
# Step 7: Push to automation repo (optional)
# ==============================================================================
if ($PushPr -and $generatedFiles.Count -gt 0) {
    Write-StepHeader -Step 7 -Message "Pushing to automation repo..."
    & "$scriptDir\Push-E2ePr.ps1" -PrNumber $PushPr -FeatureName $Feature -E2eDir $automationRoot
}

# ==============================================================================
# Summary
# ==============================================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " UI Test Generation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Module:     $Module"
Write-Host "  Feature:    $Feature"
Write-Host "  Generated:  $($generatedFiles.Count) file(s)"
Write-Host "  Location:   $moduleDir"
Write-Host ""
