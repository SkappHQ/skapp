# Skapp

Open-source people management / HR platform (people, leave, attendance). Monorepo:

- `backend/` — Spring Boot 4 / Java 21 / JPA / Liquibase. See `backend/CLAUDE.md`.
- `frontend/` — Next.js 16 (pages router) / React 19 / TypeScript / React Query / Tailwind. See `frontend/CLAUDE.md`.

Note: the README's tech-stack table is out of date (it says NestJS). The backend is Spring Boot.

## Community vs enterprise

- Community code lives under `community` packages/folders and is what this repo ships.
- Every `enterprise` folder (`backend/src/main/java/com/skapp/enterprise`, `backend/src/main/resources/{enterprise,config}`, `backend/src/test/java/com/skapp/enterprise`, `frontend/src/enterprise`, `frontend/pages/enterprise`, `frontend/pages/api/enterprise`) is a private git submodule (see `.gitmodules`). It may be empty in a fresh clone.
- Don't put enterprise logic in community code. Community code must build and run without the submodules.
- Changes inside a submodule are committed in that submodule's own repo. Don't stage submodule pointer changes in this repo unless the task is explicitly to bump them.

## Commands (what CI runs)

Backend (run in `backend/`, Java 21):

```bash
mvn clean install -DskipTests          # build
mvn -B test                            # all tests
mvn -B test -Dtest=LeaveControllerIntegrationTest   # one test class
mvn -B spring-javaformat:validate      # format check (CI)
mvn spring-javaformat:apply            # fix formatting
mvn -B checkstyle:check -Dcheckstyle.skip=false     # checkstyle (CI)
```

Frontend (run in `frontend/`, Node 22):

```bash
npm install                 # needs a GitHub Packages token in .npmrc for @rootcodelabs/skapp-ui
npm run dev
npm run build
npm test                    # jest; one file: npx jest path/to/File.test.tsx
npm run check-lint          # eslint; npm run lint-fix to fix
npm run check-format        # prettier; npm run format to fix
```

Run the formatter for the side you touched before finishing. CI fails on formatting.

## Git conventions

- Base branch is `develop`.
- Branches: `<type>/<issue-number>-<short-kebab-desc>`, e.g. `feat/123-signup-page`. Types: `feat`, `fix`, `hotfix`, `chore`, `experiment`. Backend and frontend work for one ticket often go on separate branches suffixed `-be` / `-fe`.
- Commits follow Conventional Commits: `<type>(<scope>): <description>`, e.g. `feat(leave): add policy history endpoint`.
- PRs use `.github/pull_request_template.md`.

## Cross-cutting rules

- Leave policies vs legacy leave: entitlement-based leave (`LeaveRequest`, entitlement mappers) is the legacy flow and will be removed. When leave policies are enabled (`leavePolicyService.isLeavePoliciesEnabled()`), features work only on policy data (`PolicyLeaveRequest` etc.). Branch on the flag, put the policy logic in policy-side classes, and leave the legacy path unchanged. Never merge or display legacy and policy leave together.
- Client-side validation thresholds must match the backend constants exactly.
- Every field the frontend sends must exist in the backend DTO, and the frontend must handle every error status the backend can return (e.g. 409 on edit as well as create).
