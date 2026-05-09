# Playwright E2E Conventions — Skapp Automation

## Project Setup

- Framework: Playwright + TypeScript
- Pattern: Page Object Model (POM)
- Test dir: `src/modules/<module>/tests/super-admin/`
- Pages dir: `src/modules/<module>/pages/`
- Shared: `src/shared/{helpers, constants, data}`
- Auth: Pre-authenticated via `storageState` (login handled by setup project)
- Base URL: Environment-based (`https://{tenant}.skapp.dev` or `https://{tenant}.skapp.com`)
- Navigation: Uses `getTenantUrl(ROUTES.DASHBOARD)` then POM methods

## Page Object Conventions

```typescript
import { Page, Locator, expect } from "@playwright/test";

export class PeopleFullAddPage {
  // --- Navigation ---
  readonly peopleNavItem: Locator;

  // --- Form Fields ---
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;

  // --- Actions ---
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // --- Verification ---
  readonly successToast: Locator;

  constructor(private page: Page) {
    this.peopleNavItem = page.getByRole("link", { name: "People" });
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.emailInput = page.getByPlaceholder("Email");
    this.saveButton = page.getByRole("button", { name: "Save" });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.successToast = page.getByText("Successfully added");
  }

  async navigateToPeople() {
    await this.peopleNavItem.click();
    await this.page.waitForLoadState("networkidle");
  }

  async fillBasicInfo(firstName: string, lastName: string, email: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
  }

  async clickSave() {
    await this.saveButton.click();
  }

  async verifySuccess() {
    await expect(this.successToast).toBeVisible();
  }

  // Orchestrator method
  async addFullProfile(data: { firstName: string; lastName: string; email: string }) {
    await this.navigateToPeople();
    await this.fillBasicInfo(data.firstName, data.lastName, data.email);
    await this.clickSave();
    await this.verifySuccess();
  }
}
```

## Spec File Conventions

```typescript
import { test, expect } from "@playwright/test";
import { PeopleFullAddPage } from "../../pages/PeopleFullAddPage";
import { getTenantUrl } from "../../../../shared/helpers/urlHelper";
import { generateRandomEmail } from "../../../../shared/helpers/testDataHelper";
import { ROUTES } from "../../../../shared/constants/routes";
import testData from "../../../../shared/data/people.json";

test.describe("People Full Profile Add", () => {
  let addPage: PeopleFullAddPage;

  test.beforeEach(async ({ page }) => {
    addPage = new PeopleFullAddPage(page);
    await page.goto(getTenantUrl(ROUTES.DASHBOARD));
  });

  test("should add a new employee with full profile", async ({ page }) => {
    const email = generateRandomEmail();
    await addPage.addFullProfile({
      firstName: testData.firstName,
      lastName: testData.lastName,
      email,
    });
  });

  test("should show validation when required fields are empty", async ({ page }) => {
    await addPage.navigateToPeople();
    await addPage.clickSave();
    // Assert validation messages are visible
  });
});
```

## Selector Priority

1. `getByRole('button', { name: '...' })`
2. `getByRole('combobox', { name: '...' })`
3. `getByPlaceholder('...')`
4. `getByText('...')`
5. `getByTestId('...')`
6. `getByLabel('...')`
7. `page.locator('button').filter({ hasText: '...' })`

## Naming

- Page files: **PascalCase** — `PeopleFullAddPage.ts`, `TeamsPage.ts`
- Spec files: **kebab-case** — `people-full-profile-add.spec.ts`, `add-team.spec.ts`
- Test names: `should <behavior> when <condition>`

## Anti-patterns

- Do NOT use `page.waitForTimeout()` — use `waitFor({ state: 'visible' })` or `expect().toBeVisible()`
- Do NOT use CSS selectors unless absolutely necessary
- Do NOT hardcode URLs — use `getTenantUrl()` helper
- Do NOT hardcode emails — use `generateRandomEmail()`
- Do NOT skip assertions — every test must verify the outcome
- Do NOT put locator logic in specs — keep it in the page object only
