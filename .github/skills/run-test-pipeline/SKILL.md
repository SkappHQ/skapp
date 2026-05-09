---
name: run-test-pipeline
description: 'Run the full test automation pipeline: detect changes, generate FE unit tests, generate E2E tests, run tests, push E2E PR. Use when: running full test pipeline, automating all tests, end-to-end test workflow, complete test generation.'
argument-hint: 'PR number, module, and feature, e.g. "1979 people work-location"'
---

# Run Full Test Automation Pipeline

Orchestrates the complete test generation workflow: FE unit tests + E2E tests + push to automation repo.

## When to Use

- When the user wants the full pipeline: "run the test pipeline", "generate all tests for this feature"
- When working on a feature PR that needs both unit and E2E coverage

## Inputs

Required:
- **PrNumber**: The source PR number
- **Module**: `people`, `leave`, `project-management`, or `authentication`
- **Feature**: Feature name (e.g. `work-location`, `quick-add`, `teams`)

Optional:
- **SkipUnitTests**: Skip FE unit test generation
- **SkipE2E**: Skip E2E test generation
- **SkipPush**: Don't push to automation repo

## Procedure

### Phase 1: Prerequisites

1. Verify git is available
2. Verify the automation repo exists (sibling `skapp-automation/` or ask user for path)
3. Detect the current feature branch:
   ```
   git branch --show-current
   ```
4. Detect affected submodules — check each submodule path to see if it's on a feature branch:
   - `backend/src/main/java/com/skapp/enterprise`
   - `backend/src/main/resources/enterprise`
   - `backend/src/test/java/com/skapp/enterprise`
   - `frontend/src/enterprise`
   - `frontend/pages/enterprise`
   - `frontend/pages/api/enterprise`

   For each path that exists, run:
   ```
   cd <submodule-path> && git branch --show-current
   ```
   If it's not on `main` or `develop`, it has feature changes.

5. Get changed files across all affected repos using `git diff --name-only origin/develop` in each.

Print a summary of affected repos and total changed files.

### Phase 2: FE Unit Tests (skip if `--SkipUnitTests`)

Map the module to the FE unit test module:
- `people` → `people`
- `leave` → `leave`
- `authentication` → skip (no FE unit tests)
- `project-management` → skip

If applicable, invoke the **generate-fe-unit-tests** skill procedure:
1. Detect changed FE files for the module
2. Filter to files needing tests
3. Generate Jest unit tests
4. Run Jest to verify
5. Post results as a comment on the source PR (if `gh` CLI is available):
   ```
   echo "<comment-body>" | gh pr comment <PR_NUMBER> --body-file -
   ```

### Phase 3: E2E Test Generation (skip if `--SkipE2E`)

1. Set up the automation repo branch:
   ```
   cd <automation-repo>
   git fetch origin
   git checkout -b feat/<PR_NUMBER>-<FEATURE>-e2e-tests origin/develop
   ```

2. Invoke the **generate-e2e-tests** skill procedure:
   - Read frontend source for context
   - Load existing POM and spec patterns
   - Generate Page Object + Spec files

3. Count generated test files and test cases.

### Phase 4: Test Execution (headed mode)

Run Playwright tests in **headed mode** so the user can see browser interactions:
```
cd <automation-repo> && npx playwright test src/modules/<MODULE>/tests/ --project=chromium --headed --reporter=list
```

This is the only step that uses headed mode. All other test runs (e.g. pre-push verification) use headless.

If the user explicitly requests headless mode, drop the `--headed` flag.

### Phase 5: Push & PR (skip if `--SkipPush`)

Invoke the **push-e2e-pr** skill procedure:
1. Commit test files
2. Push to remote
3. Create **draft PR** with detailed test coverage report

**Always ask user for confirmation before pushing.**

### Phase 6: Summary

Print a final summary:

```
================================================================
  TEST AUTOMATION PIPELINE — COMPLETE
================================================================
  Source PR:        SkappHQ/skapp#<PR_NUMBER>
  Module:           <MODULE>
  Feature:          <FEATURE>
  FE Unit Tests:    <count> generated, <pass/fail>
  E2E Tests:        <count> spec files, <total> test cases
  E2E PR:           <PR_URL or "skipped">
  Duration:         <elapsed time>
================================================================
```

## Important Notes

- This skill orchestrates the other skills — it follows the same conventions
- FE unit tests are committed to the **feature branch** (same PR)
- E2E tests are committed to the **automation repo** (separate PR)
- Always verify tests pass before pushing
- Confirm with user before any push/PR operations
