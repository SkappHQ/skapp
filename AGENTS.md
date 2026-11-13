# skapp

## Common rules (all Skapp repos)

- Branch from `develop`: `<type>/<ticket>-<kebab-summary>` (`feat`, `fix`, `chore`, `refactor`, `docs`). PRs target `develop`.
- Commits follow Conventional Commits: `<type>(<scope>): <summary>`.
- Run this repo's commands (below) before finishing. CI fails on formatting.
- Never read or print `.env`, `.npmrc`, service-account keys or other secrets.
- Don't reformat, lint or fix files outside the task.
- Don't bump shared package versions or submodule pointers unless asked.

More detail, in the handbook: `reference/repositories/common/contributing.md`, `engineering/generic-coding-guidlines.md`, and the PR checklists under `reference/repositories/`.

## skapp rules

### Commands

```bash
# backend/ (Java 21)
mvn spring-javaformat:apply
mvn -B checkstyle:check -Dcheckstyle.skip=false
mvn -B test                          # -Dtest=<Class> for one class

# frontend/ (Node 22)
npm run format && npm run lint-fix
npx tsc --noEmit                     # the build skips type errors
npm test                             # npx jest <path> for one file
```

### Across backend and frontend

- Every `enterprise` folder is a private submodule and may be empty. Community code must build without it; never put enterprise logic in community code.
- Leave policies: when `leavePolicyService.isLeavePoliciesEnabled()`, work only on policy data (`PolicyLeaveRequest` etc.). Branch on the flag, put the logic in policy-side classes, and leave the legacy entitlement path untouched. Never mix the two.
- Frontend validation limits match the backend constants exactly. Every field the frontend sends exists in the backend DTO, and the frontend handles every error status the backend returns.

### Backend

- Validate in a `<Feature>ValidationUtil` called from the service: no bean-validation annotations on DTOs, no inline `if (...) throw`.
- Throw `ModuleException` with a message constant, never from inside a `catch`; return a boolean from a util and branch.
- Generic helpers go in util classes (`DateTimeUtils`), not private service methods.
- Controllers: GETs first, no `@NonNull` on params. A state change is `PATCH` and returns a small status DTO.
- Bound pagination input in the service: `page >= 0`, `size >= 1`, and a maximum `size`.
- Entities: no `columnDefinition`, no initialised collections, `Boolean.TRUE` / `Boolean.FALSE` for defaults, no defaults repeated in DTOs.
- Derived queries use literal suffixes (`...AndIsActiveTrue`); Criteria API uses the JPA metamodel, not strings.
- Schema changes: add a new script in `community/db/changelog/ddl-script/`; never edit an applied one. Use `text` not `varchar`, `boolean` not `bit`, no `DEFAULT`, no unique constraints (use `existsBy...` checks).
- Cover behaviour with `*ControllerIntegrationTest` (H2), including `@PreAuthorize` cases. Unit tests only for utils.

### Frontend

- When community code imports from `~enterprise`, add a matching stub in `src/fallback/`.
- Check `proxy.ts` route gating before adding page-level role guards.
- All user-facing text goes through `useTranslator`. One `t()` call per sentence, with interpolation.
- React Query: query keys are plain string constants (no factories), no `select`, request building in a named typed method. Handle HTTP statuses the same way in every mutation for a resource.
- Interfaces at the top of the file; JSX handlers as named `handleX` functions.
- No `useEffect` for derived state, no defensive `?? []` on typed values, no `sx` or inline `style`.
- Don't add single-feature entries to shared common files.
- CI runs only `*.test.ts`; run `.test.tsx` files locally with `npx jest <path>`.
