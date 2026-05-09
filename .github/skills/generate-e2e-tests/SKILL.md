---
name: generate-e2e-tests
description: 'Generate Playwright E2E UI tests with Page Object Model. Use when: creating E2E tests, generating Playwright specs, UI testing, end-to-end testing, creating page objects for Skapp features.'
argument-hint: 'Module and feature name, e.g. "people work-location" or "leave apply"'
---

# Generate E2E UI Tests (Playwright)

Generate Playwright E2E UI tests following the Page Object Model pattern for the Skapp automation repository.

## When to Use

- After completing a frontend feature that needs E2E coverage
- When asked to "generate E2E tests", "create Playwright tests", or "add UI tests"
- Before pushing a feature for QA review

## Inputs

The user should provide:
- **Module**: `people`, `leave`, `project-management`, or `authentication`
- **Feature**: Feature name (e.g. `work-location`, `quick-add`, `teams`, `termination`)
- **Automation repo path** (optional): Path to the E2E repo (default: sibling `skapp-automation/` directory)

## Procedure

### Step 1: Locate the automation repository

The automation repo is typically at a sibling path to the main repo. Look for it:

```
ls ../skapp-automation
```

If not found, check common sibling paths (`../skapp-automation`, `../../skapp-automation`). If still not found, look for the path in the `TestAutomationConfig.psm1` file under `AutomationLocalPath`.

Verify the module directory exists. Create it if needed:
- `src/modules/<module>/pages/`
- `src/modules/<module>/tests/super-admin/`

### Step 1b: Create a feature branch in the automation repo

Before generating or modifying any test files, create a dedicated branch in the automation repo:

```
cd <automation-repo>
git fetch origin
```

Determine the branch name: `feat/<PR_NUMBER>-<FEATURE_NAME>-e2e-tests`

Check if it already exists locally or remotely:
```
git branch --list "feat/<PR_NUMBER>-<FEATURE_NAME>-e2e-tests"
git ls-remote --heads origin "feat/<PR_NUMBER>-<FEATURE_NAME>-e2e-tests"
```

- If the branch **does not exist**, create it:
  ```
  git checkout -b feat/<PR_NUMBER>-<FEATURE_NAME>-e2e-tests origin/develop
  ```
- If it **already exists**, append an incrementing suffix (`-2`, `-3`, …) until a free name is found:
  ```
  git checkout -b feat/<PR_NUMBER>-<FEATURE_NAME>-e2e-tests-<N> origin/develop
  ```

If `origin/develop` doesn't exist, use `origin/main` as the base.

All subsequent Page Object and spec file changes (Steps 4–5) must be made on this branch.

### Step 2: Detect frontend changes for context

Run git diff to find changed frontend pages/components related to the feature:

```
git diff --name-only origin/main -- "frontend/pages/**/*<feature>*" "frontend/src/**/*<feature>*"
```

Also check enterprise submodules by navigating into `frontend/src/enterprise/` and `frontend/pages/enterprise/` and running git diff there.

Read the relevant changed frontend source files to understand the UI being tested.

#### Component-level discovery

In addition to the top-level feature flow, scan for **individual UI sections/components** added or changed as part of the feature. These are typically:
- Files ending in `Section.tsx`, `Form.tsx`, or `Panel.tsx` inside a feature folder
- New utility files that define form fields, validation, types, or constants consumed by those components
- Components that render distinct form groups (dropdowns, inputs) within a larger step/page

For each discovered section component, note:
1. The field names, types (dropdown, input, textarea), labels, and placeholders from the JSX
2. The validation logic (from `validate` prop or imported validators)
3. Whether fields are required or optional
4. The dropdown option lists (imported constants)

This information drives per-section spec file generation in Step 5.

### Step 3: Load existing patterns

Read these files from the automation repo for style reference:
1. **An existing Page Object** from `src/modules/<module>/pages/*.ts` — follow the same structure
2. **An existing spec file** from `src/modules/<module>/tests/super-admin/*.spec.ts`
3. **Shared helpers**: `src/shared/helpers/urlHelper.ts`, `testDataHelper.ts`
4. **Routes constants**: `src/shared/constants/routes.ts`
5. **Test data**: `src/shared/data/people.json` (or module-specific data)

### Step 4: Generate or update Page Object class

Create or update the Page Object file at `src/modules/<module>/pages/<FeatureName>Page.ts`.

Follow the conventions in [playwright-conventions.md](./references/playwright-conventions.md).

If the Page Object file already exists:
- Read the existing file fully
- **Do NOT edit, rename, or remove any existing locators or methods** — they may be used by other specs
- Only **append** new locators and methods for the changed/added UI elements
- If a new locator conflicts with an existing one, give it a distinct name (e.g. suffix with section name)

If creating from scratch, the Page Object must:
- Import `{ Page, Locator, expect }` from `@playwright/test`
- Define all locators as `readonly` properties in the constructor
- Use semantic locators: `getByRole`, `getByText`, `getByPlaceholder`, `getByTestId`, `getByLabel`
- Group locators by section (navigation, form fields, actions, verification)
- Have small focused methods: navigate, fill, click, verify
- Have one high-level orchestrator method (e.g. `addFullProfile`, `deleteUser`)

### Step 5: Generate or update Spec files

Generate **one spec file per logical UI section** within the feature:

| Scope | File path | Example |
|-------|-----------|----------|
| Main flow | `<feature-name>.spec.ts` | `people-add-validation.spec.ts` |
| Per-section | `<feature-name>-<section>.spec.ts` | `people-add-work-preferences.spec.ts` |

#### When to create separate section specs

Create a separate spec file for a UI section when it has **any** of:
- Its own form fields (inputs, dropdowns, textareas) with distinct labels/placeholders
- Its own validation logic (inline or imported validator function)
- A dedicated `*Section.tsx`, `*Form.tsx`, or `*Panel.tsx` component file

Examples: `WorkPreferencesSection`, `EmergencyContactForm`, `EmploymentDetailsPanel`.

#### Section spec test cases (auto-generate all of these)

For each section with form fields, generate tests covering:
1. **Visibility** — section heading/title is visible on the correct step
2. **Dropdown selection** — one test per dropdown field, selecting an option and verifying the value
3. **Text input** — one test per text/number input, filling a value and verifying
4. **Validation: invalid input** — one test per validated field with an invalid value, verify error appears on blur
5. **Validation: error clears** — enter invalid → fix → verify error disappears
6. **All fields filled** — fill all section fields + required parent fields, click Next, verify step advances
7. **Optional skip** — if all section fields are optional, verify proceeding without filling them
8. **Value persistence** — change dropdown selections and verify updated values stick
9. **Boundary: max length** — if a field has `maxLength`, fill to limit and verify acceptance
10. **Block navigation** — if a field has validation, fill invalid value and verify Next is blocked

Skip test categories that don't apply (e.g., skip dropdown tests if the section has no dropdowns).

#### Section Page Object additions

When generating section specs, also add to the Page Object:
- Locators for every field in the section (dropdown: `getByLabel`, input: `getByPlaceholder`, section title: `getByText`)
- Locators for section-specific error messages
- Methods: `select<Field>(option)`, `fill<Field>(value)`, `clear<Field>()`, `verify<Field>Value(expected)`, `verify<Section>Visible()`, `verify<Field>Error()`, `verifyNo<Field>Error()`, `fillAll<Section>(...args)`

#### General spec rules

If the spec file already exists:
- Read the existing file fully
- Preserve all existing passing tests
- Add new test cases for changed/added functionality
- Update existing tests only if the underlying flow changed

The spec must:
- Import `{ test, expect }` from `@playwright/test`
- Import the Page Object class from `../../pages/<FeatureName>Page`
- Import helpers: `getTenantUrl`, `generateRandomEmail`, `ROUTES`, test data
- Use `test.describe` block per feature/section
- Navigate via `page.goto(getTenantUrl(ROUTES.DASHBOARD))`
- Use page object methods exclusively (never raw locators in specs)
- Follow AAA pattern: Arrange → Act → Assert
- Test naming: `should <behavior> when <condition>`

### Step 6: Generate and run frontend unit tests (MUST complete before E2E)

**Gate**: Do NOT proceed to Steps 7–8 (build, start, E2E) until all unit tests pass.

Generate and verify unit tests for the changed frontend utility/hook files. This ensures the underlying logic is correct before testing it in the browser.

#### 6a: Filter testable changed files

From the files detected in Step 2, filter to files in testable directories (`utils`, `hooks`, `actions`, `store`, `helpers`). Exclude non-testable patterns (`types`, `enums`, `constants`, `index.ts`, `.css`, `.json`, `QueryKeys`, `configs`).

For each testable file, check whether a co-located `.test.ts` / `.test.tsx` already exists:
- **No test file** → generate from scratch
- **Test file exists** → read existing tests, add new cases for changed/added code, preserve all existing passing tests

#### 6b: Load unit test patterns

Read an existing `.test.ts` file in the same module for style reference. Follow the conventions in the [jest-conventions.md](../generate-fe-unit-tests/references/jest-conventions.md) reference.

#### 6c: Generate unit test files

For each source file:
1. Read the full source file
2. Read imported local modules (starting with `.` or `~`) to understand dependencies for mocking
3. If an existing test file exists, read it fully and preserve passing tests
4. Generate the test file next to the source: `<source>.test.ts`

Follow these critical mocking rules:
- If the source imports `commonUtil`, mock it to avoid `Request is not defined` errors
- Mock external modules (`next-auth`, `axios`, API modules)
- Mock Zustand stores
- Use AAA pattern (Arrange → Act → Assert)
- Test naming: `should <behavior> when <condition>`

#### 6d: Run unit tests

```
cd <main-repo>/frontend && npx jest --testPathPattern="src/community/<MODULE>" --no-coverage
```

If tests fail, read the error output, fix the test file, and re-run. **Repeat until all unit tests pass. Do NOT proceed to Step 7 (build) or Step 8 (E2E) until every unit test is green.**

#### 6e: Commit unit tests

```
cd <main-repo>
git add frontend/src/community/<MODULE>/**/*.test.ts frontend/src/community/<MODULE>/**/*.test.tsx
git commit -m "test: add unit tests for <MODULE>/<FEATURE>"
```

### Step 7: Build and start the local environment

Before running E2E tests, ensure the frontend is built and served locally:

1. **Build the frontend**:
```
cd <main-repo>/frontend && npm run build
```
Wait for the build to complete successfully before proceeding.

2. **Start the production server** (in async/background mode so it keeps running):
```
cd <main-repo>/frontend && npm run start
```
The server must be running and ready before executing tests.

### Step 8: Run E2E tests in headed mode

Run **only the spec files that were created or modified** in this session — do NOT run the entire module test suite. Pass each spec file path explicitly:

```
cd <automation-repo> && npx playwright test <path/to/spec1.spec.ts> <path/to/spec2.spec.ts> --project=chromium --headed --reporter=list
```

For example:
```
cd <automation-repo> && npx playwright test \
  src/modules/people/tests/super-admin/people-add-validation.spec.ts \
  src/modules/people/tests/super-admin/people-add-work-preferences.spec.ts \
  --project=chromium --headed --reporter=list
```

Build the file list from `git status --porcelain -- "src/modules/**/*.spec.ts"` to identify exactly which specs are new or changed.

## Important Notes

- Everything runs on **localhost** — builds, server start, and E2E tests will be slower than CI. Use generous timeouts:
  - `npm run build`: allow up to **5 minutes** (timeout ~300000ms)
  - `npm run start`: run in **async/background** mode; wait for the server to be ready before proceeding
  - Playwright config should have `timeout: 60_000` (per test), `actionTimeout: 15_000`, `navigationTimeout: 30_000`, and the `setup` project should have `timeout: 90_000` for auth login
  - When running Playwright via the terminal, set a sync timeout of at least **120000ms** (2 min) per spec file to account for local latency
- **Unit tests** are generated and committed to the **main monorepo** feature branch (same PR as feature code)
- Unit tests must pass before proceeding to E2E test generation
- E2E tests go in the **separate automation repo**, not the main monorepo
- Auth is pre-handled via `storageState` (login handled by setup project)
- The local environment must be running (`npm run start`) before executing E2E tests
- Base URL is environment-based: `https://{tenant}.skapp.dev`
- Navigation uses `getTenantUrl(ROUTES.DASHBOARD)` then POM methods
- Do NOT use `page.waitForTimeout()` — use `waitFor({ state: 'visible' })` or `expect().toBeVisible()`
- Do NOT use CSS selectors unless absolutely necessary
- Do NOT hardcode URLs or emails — use helpers
