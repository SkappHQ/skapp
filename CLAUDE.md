# Skapp

HR platform monorepo. `backend/` is Spring Boot (see `backend/CLAUDE.md`), `frontend/` is Next.js pages router (see `frontend/CLAUDE.md`). The README's stack table is wrong; the backend is not NestJS.

## Community vs enterprise

- Every `enterprise` folder is a private submodule (see `.gitmodules`) and may be empty. Community code must build without it.
- Don't put enterprise logic in community code, and don't stage submodule pointer changes unless asked.

## Commands

```bash
# backend/ (Java 21)
mvn -B test                          # -Dtest=<Class> for one class
mvn spring-javaformat:apply          # CI fails on formatting
mvn -B checkstyle:check -Dcheckstyle.skip=false

# frontend/ (Node 22; .npmrc needs a GitHub Packages token)
npm test                             # npx jest <path> for one file
npm run lint-fix && npm run format
```

## Conventions

- Base branch `develop`. Branches `<type>/<issue>-<kebab-desc>` (`-be` / `-fe` suffix when split). Commits use Conventional Commits.
- Leave policies: when `leavePolicyService.isLeavePoliciesEnabled()`, work only on policy data (`PolicyLeaveRequest` etc.). Branch on the flag and leave the legacy entitlement path untouched. Never mix the two.
- Frontend validation limits must match backend constants, every field sent must exist in the backend DTO, and every backend error status (e.g. 409 on edit) must be handled.
