---
name: test-automation
description: "Run the full test automation pipeline for a PR. Use when: generating unit tests, generating E2E Playwright tests, running test pipeline, pushing tests to automation repo, creating test PRs. Detects PR number, module, and feature automatically from the current branch."
argument-hint: "Optional: module name (people, leave, etc.) or 'dry-run'"
---

# Test Automation Pipeline

Orchestrates FE unit test generation, Playwright E2E test generation, test execution, and PR creation — all autonomously.

## When to Use

- After pushing a feature branch with frontend changes
- When asked to "generate tests", "run the pipeline", "create test PR"
- When reviewing a PR and wanting automated test coverage

## Auto-Detection

The pipeline can detect everything from the current git state. No manual parameters needed.

### Detect PR Number

```powershell
$branch = git branch --show-current
$pr = gh pr list --head $branch --repo SkappHQ/skapp --json number --jq '.[0].number'
```

### Detect Module

Infer from changed file paths:

| Path contains | Module |
|---|---|
| `people` | `people` |
| `leave` | `leave` |
| `project` | `project-management` |
| `auth` | `authentication` |

```powershell
$changedFiles = git diff --name-only origin/test/automation-e2e-setup-ui...HEAD -- frontend/
$module = if ($changedFiles -match 'people') { 'people' }
          elseif ($changedFiles -match 'leave') { 'leave' }
          elseif ($changedFiles -match 'project') { 'project-management' }
          elseif ($changedFiles -match 'auth') { 'authentication' }
```

### Detect Feature

Extract from branch name (last segment after `/`):

```powershell
$branch = git branch --show-current
# feat/people-add-flow-validation → people-add-flow-validation
# feat/1979-work-location-add → work-location-add
$feature = ($branch -split '/')[-1] -replace '^\d+-', '' -replace '-', ''
```

Or from the most-changed new file's name:

```powershell
$newFiles = git diff --name-only --diff-filter=A origin/test/automation-e2e-setup-ui...HEAD -- frontend/src/
$feature = [System.IO.Path]::GetFileNameWithoutExtension(($newFiles | Select-Object -First 1)) -replace 'Utils$', ''
```

## Procedure

### Step 1: Detect Parameters

Run the auto-detect script or ask the user only if detection fails:

```powershell
cd c:\Users\thusala.piyarisi_roo\Desktop\NewCloneSkap\skapp
$branch = git branch --show-current
$prNumber = gh pr list --head $branch --repo SkappHQ/skapp --json number --jq '.[0].number'
```

Determine module and feature from changed files (see Auto-Detection above).

### Step 2: Run Pipeline

```powershell
.\scripts\Run-TestPipeline.ps1 -PrNumber $prNumber -Module $module -Feature $feature
```

### Available Flags

| Flag | Effect |
|---|---|
| `-SkipUnitTests` | Skip FE Jest unit test generation |
| `-SkipGenerate` | Skip E2E test generation (use existing files) |
| `-SkipTests` | Skip running Playwright tests before push |
| `-SkipPush` | Generate tests but don't push to remote |
| `-SkipPr` | Push but don't create PR |
| `-DryRun` | Show what would happen without executing |

### Step 3: Verify Results

After pipeline completes, check:
1. Unit tests committed to current branch in `frontend/src/community/<module>/`
2. E2E tests pushed to `thusala/skapp-automation` on branch `feat/<prNumber>-<feature>-e2e-tests`
3. PR created on automation repo linking back to source PR
4. PR comment posted on source PR with test results

## Pipeline Scripts

| Script | Purpose |
|---|---|
| [Run-TestPipeline.ps1](../../../scripts/Run-TestPipeline.ps1) | Master orchestrator |
| [Generate-FeUnitTests.ps1](../../../scripts/Generate-FeUnitTests.ps1) | Jest unit test generation |
| [Generate-UiTests.ps1](../../../scripts/Generate-UiTests.ps1) | Playwright E2E generation |
| [Push-E2ePr.ps1](../../../scripts/Push-E2ePr.ps1) | Push E2E tests + open PR |
| [TestAutomationConfig.psm1](../../../scripts/TestAutomationConfig.psm1) | Shared config module |

## Examples

```
# User says: "run the test pipeline"
# → Auto-detect PR, module, feature from current branch and run full pipeline

# User says: "generate tests for this PR"  
# → Same as above

# User says: "run pipeline dry-run"
# → Add -DryRun flag

# User says: "only generate unit tests"
# → Add -SkipGenerate -SkipPush flags

# User says: "only generate E2E tests"
# → Add -SkipUnitTests flag
```
