# skapp

## Common rules (all Skapp repos)

- Base branch is `develop`; `main` is the release branch. PRs target `develop` and fill in every section of the repo's PR template.
- Branches: `<type>/<ticket>-<kebab-summary>` (`feat`, `fix`, `chore`, `refactor`, `docs`, `test`), or `chore/<kebab-summary>` without a ticket.
- Commits follow Conventional Commits: `<type>(<scope>): <description>`.
- Never read, print or commit `.env`, `.npmrc`, service-account keys or other secrets.
- Keep changes scoped to the task. Don't fix, reformat or lint unrelated files.
- Run the repo's format, lint and test commands before finishing. CI fails on formatting.
- Don't bump shared package versions or submodule pointers unless asked.
- No magic values. Use constants, and reuse existing ones first.
- User-facing text goes through the repo's i18n or messages layer, never hard-coded.
- Frontend validation limits match the backend exactly, and the frontend handles every error status the backend can return.
- Schema changes: never edit an applied migration; add a new one. Use `text` not `varchar`, `boolean` not `bit`, no `DEFAULT`, no unique constraints (check uniqueness in code with `existsBy...`).

## skapp rules

HR platform monorepo: `backend/` is Spring Boot (Java 21), `frontend/` is Next.js pages router (Node 22). The README's stack table is wrong; the backend is not NestJS.

### Community vs enterprise

- Every `enterprise` folder is a private submodule (see `.gitmodules`) and may be empty. Community code must build without it.
- Don't put enterprise logic in community code.
- Leave policies: when `leavePolicyService.isLeavePoliciesEnabled()`, work only on policy data (`PolicyLeaveRequest` etc.). Branch on the flag and leave the legacy entitlement path untouched. Never mix the two.

### Commands

```bash
# backend/
mvn -B test                          # -Dtest=<Class> for one class
mvn spring-javaformat:apply
mvn -B checkstyle:check -Dcheckstyle.skip=false

# frontend/ (.npmrc needs a GitHub Packages token)
npm test                             # npx jest <path> for one file
npm run lint-fix && npm run format
```

### Backend

- Root package `com.skapp.community`. Modules follow `controller / service(impl) / repository / model / payload / mapper / constant`.
- Validate in a `<Feature>ValidationUtil` called from the service: no bean-validation annotations, no inline `if (...) throw`.
- Throw `ModuleException` with a message constant (`<module>-messages.properties`). Never throw it from a `catch`.
- Generic helpers go in util classes (`DateTimeUtils`), not private service methods.
- Every service method logs `log.info("methodName: execution started")` and `"... execution ended"`, with no dynamic values.
- Controllers: GETs first, no `@NonNull` on params, `@PreAuthorize` roles match sibling endpoints. State changes are `PATCH` and return a small status DTO.
- Bound pagination input in the service.
- Entities: no `columnDefinition`, no initialised collections, `Boolean.TRUE/FALSE` for defaults.
- Derived queries use literal suffixes (`...AndIsActiveTrue`). Criteria API uses the JPA metamodel, not strings.
- New Liquibase scripts go in `community/db/changelog/ddl-script/`. Enterprise migrates from a separate repo, which usually needs a matching script.
- Cover behaviour with `*ControllerIntegrationTest` (H2, `src/test/resources/data.sql`), including `@PreAuthorize` cases. Unit tests only for utils.

### Frontend

- Code lives in `src/community/<module>/` (`api`, `components/{atoms,molecules,organisms}`, `hooks`, `store`, `types`, ...).
- `~enterprise/*` resolves to `src/enterprise`, else `src/fallback`. When community code imports from `~enterprise`, add a stub in `src/fallback/`.
- Route access is gated in `proxy.ts`. Check it before adding page-level role guards.
- Strings go through `useTranslator`, with text in `common/assets/languages/english/<module>.json`. One `t()` per sentence, with interpolation.
- React Query hooks live in `<module>/api/<Feature>Api.ts`. Query keys are plain string constants, no `select`, request building in a named typed method.
- Every field the frontend sends must exist in the backend DTO.
- Reuse shared components and `@rootcodelabs/skapp-ui` before building new ones.
- Named `interface`s at the top of the file; JSX handlers as named `handleX` functions.
- No `useEffect` for derived state, no defensive `?? []` on typed values, no `sx` or inline `style` (use Tailwind or `variant`).
- Don't add single-feature entries to shared common files.
- Jest tests are co-located. CI runs only `*.test.ts`, so run `.test.tsx` files locally with `npx jest <path>`.
