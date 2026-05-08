<#
.SYNOPSIS
    Auto-detects pipeline parameters from git state

.DESCRIPTION
    Returns PR number, module, and feature name by inspecting:
    - Current branch name
    - Open PRs via gh CLI
    - Changed files vs base branch

.EXAMPLE
    $params = .\Detect-PipelineParams.ps1
    .\Run-TestPipeline.ps1 @params
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module "$scriptDir\TestAutomationConfig.psm1" -Force

# --- Detect branch ---
$branch = git branch --show-current 2>$null
if (-not $branch) {
    Write-Error "Not on a branch (detached HEAD?)"
    exit 1
}
Write-Host "Branch: $branch" -ForegroundColor Cyan

# --- Detect PR number ---
$prNumber = $null
try {
    $prJson = gh pr list --head $branch --repo $CONFIG.SourceRepo --json number --jq '.[0].number' 2>$null
    if ($prJson -and $prJson -match '^\d+$') {
        $prNumber = $prJson.Trim()
    }
}
catch { }

if (-not $prNumber) {
    Write-Warning "No open PR found for branch '$branch'. You may need to create one first."
    Write-Host "  gh pr create --head $branch --base $($CONFIG.BaseBranch) --repo $($CONFIG.SourceRepo)"
    exit 1
}
Write-Host "PR: #$prNumber" -ForegroundColor Green

# --- Detect module from changed files ---
$baseBranch = $CONFIG.BaseBranch
$changedFiles = git diff --name-only "origin/$baseBranch...HEAD" -- frontend/ 2>$null

$module = $null
$moduleCounts = @{
    "people"              = @($changedFiles | Where-Object { $_ -match 'people' }).Count
    "leave"               = @($changedFiles | Where-Object { $_ -match 'leave' }).Count
    "project-management"  = @($changedFiles | Where-Object { $_ -match 'project' }).Count
    "authentication"      = @($changedFiles | Where-Object { $_ -match 'auth' }).Count
}

$module = ($moduleCounts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key
if ($moduleCounts[$module] -eq 0) {
    Write-Warning "Could not detect module from changed files. Defaulting to 'people'."
    $module = "people"
}
Write-Host "Module: $module" -ForegroundColor Green

# --- Detect feature from branch name or new files ---
$feature = $null

# Try from branch: feat/people-add-flow-validation → peopleAddFlowValidation
$branchSuffix = ($branch -split '/')[-1]
# Remove leading PR/issue number prefix like "1979-"
$branchSuffix = $branchSuffix -replace '^\d+-', ''

# Convert kebab-case to camelCase
$parts = $branchSuffix -split '-'
if ($parts.Count -gt 1) {
    $feature = $parts[0].ToLower()
    for ($i = 1; $i -lt $parts.Count; $i++) {
        if ($parts[$i].Length -gt 0) {
            $feature += $parts[$i].Substring(0,1).ToUpper() + $parts[$i].Substring(1).ToLower()
        }
    }
}
else {
    $feature = $branchSuffix.ToLower()
}

# Fallback: try from newly added files
if (-not $feature -or $feature.Length -lt 3) {
    $newFiles = git diff --name-only --diff-filter=A "origin/$baseBranch...HEAD" -- "frontend/src/" 2>$null
    if ($newFiles) {
        $firstNew = ($newFiles | Select-Object -First 1)
        $feature = [System.IO.Path]::GetFileNameWithoutExtension($firstNew) -replace 'Utils$', '' -replace 'Section$', ''
    }
}

Write-Host "Feature: $feature" -ForegroundColor Green

# --- Output as hashtable for splatting ---
Write-Host ""
Write-Host "Detected pipeline command:" -ForegroundColor Yellow
Write-Host "  .\scripts\Run-TestPipeline.ps1 -PrNumber $prNumber -Module $module -Feature `"$feature`"" -ForegroundColor White
Write-Host ""

# Return params for splatting
return @{
    PrNumber = $prNumber
    Module   = $module
    Feature  = $feature
}
