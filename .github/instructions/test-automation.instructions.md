---
applyTo: "**/*.test.{ts,tsx},**/*Test.java,**/*IntegrationTest.java,**/*.spec.ts"
description: "Test automation conventions for Skapp. Applies when working with Jest unit tests, JUnit tests, or Playwright E2E specs."
---

# Test Automation Conventions — Skapp

## Architecture

| Type | Framework | Location | Suffix |
|------|-----------|----------|--------|
| FE Unit tests | Jest + jsdom | `frontend/src/community/<module>/**/*.test.ts` | `.test.ts` / `.test.tsx` |
| BE Unit tests | JUnit 5 + Mockito | `backend/src/test/java/**/*UnitTest.java` | `UnitTest.java` |
| BE Integration tests | Spring Boot Test + MockMvc | `backend/src/test/java/**/*IntegrationTest.java` | `IntegrationTest.java` |
| E2E UI tests | Playwright | `skapp-automation/src/modules/<module>/**/*.spec.ts` | `.spec.ts` |

## Repositories

| Repository | Purpose |
|-----------|---------|
| `SkappHQ/skapp` | Main monorepo (parent + community code) |
| Automation repo | Playwright E2E UI tests (separate repo) |

### Submodules (enterprise code)

| Submodule | Path in Monorepo | Layer |
|-----------|-----------------|-------|
| `backend-src` | `backend/src/main/java/com/skapp/enterprise` | Backend |
| `backend-resources` | `backend/src/main/resources/enterprise` | Backend |
| `backend-config` | `backend/src/main/resources/config` | Backend |
| `backend-test` | `backend/src/test/java/com/skapp/enterprise` | Backend |
| `frontend-src` | `frontend/src/enterprise` | Frontend |
| `frontend-pages` | `frontend/pages/enterprise` | Frontend |
| `frontend-api` | `frontend/pages/api/enterprise` | Frontend |

## FE Stack

- Next.js 14 + React 18 + TypeScript
- State management: Zustand
- Forms: Formik + Yup validation
- Module aliases: `~community` → `src/community`, `~enterprise` → `src/fallback`
- Test co-location: tests live next to source files

## BE Stack

- Spring Boot 3 + Java 17
- Test support package: `backend/src/test/java/com/skapp/support/`
- TestConstants, SecurityTestUtils, MockUserFactory available

## File Patterns

- **Testable FE dirs**: `utils`, `hooks`, `actions`, `store`, `helpers`
- **Skip FE patterns**: `types`, `enums`, `constants`, `index.ts`, `.css`, `.json`, `QueryKeys`, `configs`
- **Testable BE packages**: `controller`, `service`, `util`, `component`, `repository`
- **Skip BE dirs**: `model`, `payload`, `type`, `constant`, `config`, `mapper`

## Change Detection

Use `git diff --name-only origin/<base-branch>` to detect changed files. Check both main repo community code AND enterprise submodule paths. Submodules may be on feature branches — check with `git branch --show-current` inside each submodule path.

## Modules

Valid modules: `people`, `leave`, `attendance`, `settings`, `configurations`, `project-management`, `authentication`
