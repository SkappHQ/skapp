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

If not found, ask the user for the path.

Verify the module directory exists. Create it if needed:
- `src/modules/<module>/pages/`
- `src/modules/<module>/tests/super-admin/`

### Step 2: Detect frontend changes for context

Run git diff to find changed frontend pages/components related to the feature:

```
git diff --name-only origin/main -- "frontend/pages/**/*<feature>*" "frontend/src/**/*<feature>*"
```

Also check enterprise submodules by navigating into `frontend/src/enterprise/` and `frontend/pages/enterprise/` and running git diff there.

Read the relevant changed frontend source files to understand the UI being tested.

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
- Preserve all existing locators and methods
- Add new locators and methods for the changed/added UI elements
- Update existing methods only if the source UI changed

If creating from scratch, the Page Object must:
- Import `{ Page, Locator, expect }` from `@playwright/test`
- Define all locators as `readonly` properties in the constructor
- Use semantic locators: `getByRole`, `getByText`, `getByPlaceholder`, `getByTestId`, `getByLabel`
- Group locators by section (navigation, form fields, actions, verification)
- Have small focused methods: navigate, fill, click, verify
- Have one high-level orchestrator method (e.g. `addFullProfile`, `deleteUser`)

### Step 5: Generate or update Spec file

Create or update the spec file at `src/modules/<module>/tests/super-admin/<feature-name>.spec.ts`.

If the spec file already exists:
- Read the existing file fully
- Preserve all existing passing tests
- Add new test cases for changed/added functionality
- Update existing tests only if the underlying flow changed

The spec must:
- Import `{ test, expect }` from `@playwright/test`
- Import the Page Object class from `../../pages/<FeatureName>Page`
- Import helpers: `getTenantUrl`, `generateRandomEmail`, `ROUTES`, test data
- Use `test.describe` block per feature
- Navigate via `page.goto(getTenantUrl(ROUTES.DASHBOARD))`
- Use page object methods exclusively (never raw locators in specs)
- Follow AAA pattern: Arrange → Act → Assert
- Test naming: `should <behavior> when <condition>`

### Step 6: Run tests in headed mode

Always run E2E tests in **headed mode** so the user can see browser interactions:

```
cd <automation-repo> && npx playwright test src/modules/<module>/tests/ --project=chromium --headed --reporter=list
```

If the user explicitly asks for headless mode, drop the `--headed` flag.

## Important Notes

- E2E tests go in the **separate automation repo**, not the main monorepo
- Auth is pre-handled via `storageState` (login handled by setup project)
- Base URL is environment-based: `https://{tenant}.skapp.dev`
- Navigation uses `getTenantUrl(ROUTES.DASHBOARD)` then POM methods
- Do NOT use `page.waitForTimeout()` — use `waitFor({ state: 'visible' })` or `expect().toBeVisible()`
- Do NOT use CSS selectors unless absolutely necessary
- Do NOT hardcode URLs or emails — use helpers
