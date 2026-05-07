# Test Automation Playbook — Skapp

> Automated test generation for Skapp frontend and backend using GitHub Copilot CLI with Claude Opus 4.6.
> FE unit tests are committed to the feature PR. E2E tests are pushed to: https://github.com/thusala/skapp-automation

---

## Architecture

| Type | Tool | Output Location | Suffix |
|------|------|-----------------|--------|
| FE Unit tests | Jest + jsdom | `frontend/src/community/<module>/**/*.test.ts` | `.test.ts` / `.test.tsx` |
| BE Unit tests | JUnit 5 + Mockito | `backend/src/test/java/**/*UnitTest.java` | `UnitTest.java` |
| BE Integration tests | Spring Boot Test + MockMvc | `backend/src/test/java/**/*IntegrationTest.java` | `IntegrationTest.java` |
| E2E UI tests | Playwright | `skapp-automation/src/modules/<module>/**/*.spec.ts` | `.spec.ts` |

---

## Repositories

| Repository | Purpose | Local Path |
|-----------|---------|------------|
| `SkappHQ/skapp` | Main monorepo (parent + community code) | `C:\Users\thusala.piyarisi_roo\Desktop\NewCloneSkap\skapp` |
| `thusala/skapp-automation` | Playwright E2E UI tests | `C:\Users\thusala.piyarisi_roo\Desktop\NewCloneSkap\skapp-automation` |

### Submodules (enterprise code)

| Submodule | Repository | Path in Monorepo | Layer |
|-----------|-----------|-----------------|-------|
| `backend-src` | `rootcodelabs/skapp-ep-be-src` | `backend/src/main/java/com/skapp/enterprise` | Backend |
| `backend-resources` | `rootcodelabs/skapp-ep-be-resources` | `backend/src/main/resources/enterprise` | Backend |
| `backend-config` | `rootcodelabs/skapp-ep-be-resources-config` | `backend/src/main/resources/config` | Backend |
| `backend-test` | `rootcodelabs/skapp-ep-be-tests` | `backend/src/test/java/com/skapp/enterprise` | Backend |
| `frontend-src` | `rootcodelabs/skapp-ep-fe-src` | `frontend/src/enterprise` | Frontend |
| `frontend-pages` | `rootcodelabs/skapp-ep-fe-pages` | `frontend/pages/enterprise` | Frontend |
| `frontend-api` | `rootcodelabs/skapp-ep-fe-routes` | `frontend/pages/api/enterprise` | Frontend |

---

## Multi-Repo Features

Features often span multiple submodules. The automation scripts handle this automatically:

### How it works

1. **Detection**: `Get-AffectedSubmodules` checks which submodules are on a feature branch
2. **Aggregation**: `Get-CrossRepoContext` collects changed files across all affected repos
3. **Generation**: `Generate-E2eTests.ps1` reads controllers from both community code AND enterprise submodule
4. **PR Linking**: `Push-E2ePr.ps1` includes an "Affected Repositories" table in the PR description

### Example: `feat/1979-work-location-add`

```
Main repo (SkappHQ/skapp) ─── community code changes
├── backend-src submodule ──── enterprise controller/service
├── backend-resources ──────── enterprise SQL/config
├── frontend-src ───────────── enterprise UI components
└── frontend-pages ─────────── enterprise page routes
```

### Working with submodules

```powershell
# Check which submodules are on a feature branch
git submodule foreach "echo $sm_path && git branch --show-current"

# Switch all submodules to a feature branch
git submodule foreach "git checkout feat/my-feature 2>$null || true"

# The automation scripts detect this automatically:
.\scripts\Generate-E2eTests.ps1  # Finds controllers in ALL affected repos
```

---

## Quick Start

```powershell
# === ONE COMMAND — runs the entire pipeline (unit tests + E2E) ===
.\scripts\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "work-location"

# === Only FE unit tests (committed to feature PR) ===
.\scripts\Generate-FeUnitTests.ps1 -Module people -Feature "add"

# === Only E2E tests (pushed to automation repo) ===
.\scripts\Run-TestPipeline.ps1 -PrNumber 1979 -Module people -Feature "add" -SkipUnitTests

# === Step by step ===
# 1. Generate FE unit tests for changed files
.\scripts\Generate-FeUnitTests.ps1 -Module people -Feature "add"

# 2. Generate E2E UI tests
.\scripts\Generate-UiTests.ps1 -Module people -Feature "full-add" -SkipRun

# 3. Push E2E tests to automation repo and open PR
.\scripts\Push-E2ePr.ps1 -PrNumber <PR_NUMBER> -FeatureName "my-feature"
```

---

## Scripts Reference

| Script | Purpose | Output |
|--------|---------|--------|
| **`Run-TestPipeline.ps1`** | **Full pipeline — unit tests + E2E in one command** | Both |
| `Generate-FeUnitTests.ps1` | Generate Jest unit tests for changed FE files | Feature PR |
| `Generate-UiTests.ps1` | Generate Playwright E2E UI tests | Automation repo |
| `Generate-BeTests.ps1` | Generate JUnit unit + integration tests | Backend test dir |
| `Push-E2ePr.ps1` | Push E2E tests, open PR with test report | Automation repo |
| `TestAutomationConfig.psm1` | Shared configuration and utilities | N/A |

### Pipeline Flow

```
┌──────────────────────────────────────────────────────┐
│  Run-TestPipeline.ps1 -Module people -Feature "add"  │
└──────────────────┬───────────────────────────────────┘
                   │
     Phase 1: Prerequisites & Change Detection
                   │
     Phase 2: FE Unit Tests ──────────────────────┐
       │ Detect changed files in module            │
       │ Generate .test.ts for files without tests │
       │ Run Jest to validate                      │
       │ Commit to feature branch ─────────────────┼──→ Feature PR
                   │                               │    (same repo)
     Phase 3: E2E Test Generation                  │
       │ Generate Page Objects + Specs             │
                   │                               │
     Phase 4: E2E Test Execution                   │
       │ Run Playwright tests                      │
                   │                               │
     Phase 5: Push & PR ───────────────────────────┼──→ Automation Repo PR
       │ Push to thusala/skapp-automation          │    (separate repo)
       │ Open PR with test coverage report         │
       └───────────────────────────────────────────┘
```

---

## FE Unit Test Standards (Jest)

### Setup
- Framework: Jest + jest-environment-jsdom (via `next/jest`)
- Module aliases: `~community` -> `src/community`, `~enterprise` -> `src/fallback`
- Run: `npm run test:people` (or `npx jest --testPathPattern=src/community/<module>`)

### Co-located Tests
Tests live next to their source files:
```
src/community/people/utils/
  ├── peopleValidations.ts
  ├── peopleValidations.test.ts     ← co-located
  └── PeopleDirectoryUtils.ts
  └── PeopleDirectoryUtils.test.ts  ← co-located
```

### Patterns
- `describe` blocks grouped by function or feature
- Test naming: `should <behavior> when <condition>`
- AAA pattern: Arrange → Act → Assert
- For Yup schemas: `await expect(schema.validate(data)).rejects.toThrow()`
- For utility functions: test each exported function
- For hooks: use `renderHook` from `@testing-library/react`

### Critical Mocking Rules
```typescript
// MUST mock commonUtil if imported (avoids 'Request is not defined')
jest.mock('~community/common/utils/commonUtil', () => ({
  formatDate: jest.fn((d) => d),
  formatEmptyString: jest.fn((s) => s || null),
  formatPhoneNumber: jest.fn((code, phone) => code && phone ? `${code}${phone}` : '')
}));

// Mock Zustand stores
jest.mock('~community/people/store/store', () => ({
  usePeopleStore: jest.fn(() => ({ ... }))
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));
```

### What to Test
| File Type | Test Focus |
|-----------|-----------|
| `utils/*.ts` | Pure function inputs/outputs, edge cases |
| `hooks/*.tsx` | Hook state changes, side effects |
| `actions/*.ts` | Data transformations, API payload building |
| `store/slices/*.ts` | Zustand state mutations |
| `validations*.ts` | Yup schema validation rules |

### What NOT to Test
- Types, enums, constants (no logic)
- Component rendering (use E2E instead)
- Third-party library internals

---

## Backend Test Standards

### Unit Tests (`@ExtendWith(MockitoExtension.class)`)
- AAA Pattern: Arrange → Act → Assert
- Naming: `methodName_expectedBehavior_whenCondition()`
- Mock ALL dependencies with `@Mock`
- Use `TestConstants` for reusable values
- Use `MockUserFactory` for test user creation
- Cover: happy path, errors, boundaries, null inputs, validation
- Verify mock interactions with `verify()`

### Integration Tests (`@SpringBootTest + @AutoConfigureMockMvc`)
- Use `TestSkappApplication.class` as test configuration
- `@Transactional` for automatic rollback
- `SecurityTestUtils.bearerToken()` for auth
- `@Nested` + `@DisplayName` for grouping
- Test per endpoint: 200, 401, 403, 400, 404

---

## E2E Test Standards (Playwright)

### Patterns
- Import `createTestToken` from `../helpers/auth`
- Import `graphql`/`graphqlOk` from `../helpers/graphql` (for GraphQL endpoints)
- Use `request.post/get/patch/delete` for REST endpoints
- Constants at file top: ENDPOINTS, TEST_DATA
- `test.describe` blocks per endpoint/feature
- CRUD lifecycle: Create → Read → Update → Delete

### Auth Matrix
```typescript
// Admin token (default)
const token = createTestToken();

// Employee token
const employeeToken = createTestToken({ userId: 2, email: 'emp@test.com' });

// No token → expect 401
// Wrong role → expect 403
```

### Naming
```typescript
test('should create employee when valid data provided', ...)
test('should return 401 when no auth token', ...)
test('should return 400 when email is invalid', ...)
```

---

## Configuration

All configuration is centralized in `scripts/TestAutomationConfig.psm1`:

```powershell
$Script:CONFIG = @{
    SourceRepo       = "SkappHQ/skapp"
    E2eRepo          = "thusala/skapp-pm-e2e"
    E2eLocalPath     = "C:\...\skapp-pm-e2e"
    CopilotModel     = "claude-opus-4.6"
    # ... etc
}
```

Update this file to change repo URLs, paths, or model settings.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `copilot` not found | Open VS Code, ensure Copilot extension is active, restart terminal |
| `gh` not found | `winget install --id GitHub.cli` then restart terminal |
| `gh` not authenticated | `gh auth login` or `$env:GH_TOKEN = "<token>"` |
| E2E repo not found | Run `.\scripts\Link-E2eRepo.ps1 -Clone` |
| Tests fail with auth errors | Check JWT secret matches between backend and test helpers |
| Push rejected | `git pull origin <branch> --rebase` in E2E repo |
| Copilot model unavailable | Verify premium access with `copilot -s -p "test" --model claude-opus-4.6` |
| No `gh` → PR not created | Script auto-opens browser with compare URL + saves PR_BODY.md |
| Tests fail with ECONNREFUSED | Start backend: `cd backend && ./mvnw spring-boot:run` |
