# skapp

## Common rules (all Skapp repos)

This file only holds what the other docs don't cover. Read those first:

- `README.md`: what this repo is.
- `CODEOWNERS`: who reviews what.
- Handbook `reference/repositories/common/contributing.md`: branches, commits and PRs.
- Handbook `engineering/generic-coding-guidlines.md`: coding rules per stack and service.
- Handbook `reference/repositories/common/pr-checklist.md`, plus this repo's checklist under `reference/repositories/<repo>/`: what to run and check before a PR.

On top of those:

- Never read or print `.env`, `.npmrc`, service-account keys or other secrets.
- Don't reformat, lint or fix files outside the task.
- Don't bump shared package versions or submodule pointers unless asked.
- Frontend validation limits match the backend constants exactly, and the frontend handles every error status the backend can return.

## skapp rules

- Leave policies: when `leavePolicyService.isLeavePoliciesEnabled()`, work only on policy data (`PolicyLeaveRequest` etc.). Branch on the flag, put the logic in policy-side classes, and leave the legacy entitlement path untouched. Never mix the two.

### Backend

- Validate in a `<Feature>ValidationUtil` called from the service: no bean-validation annotations on DTOs, no inline `if (...) throw`.
- Never throw `ModuleException` from inside a `catch`; return a boolean from a util and branch.
- Generic helpers go in util classes (`DateTimeUtils`), not private service methods.
- Controllers: GETs first, no `@NonNull` on params. A state change is `PATCH` and returns a small status DTO.
- Bound pagination input in the service (`page >= 0`, `size >= 1`, capped max).
- Entities: no `columnDefinition`, no initialised collections, `Boolean.TRUE` / `Boolean.FALSE` for defaults, no defaults repeated in DTOs.
- Derived queries use literal suffixes (`...AndIsActiveTrue`); Criteria API uses the JPA metamodel, not strings.
- Community DDL: `text` not `varchar`, `boolean` not `bit`, no `DEFAULT`, no unique constraints (use `existsBy...` checks).
- Cover behaviour with `*ControllerIntegrationTest` (H2), including `@PreAuthorize` cases. Unit tests only for utils.

### Frontend

- Check `proxy.ts` route gating before adding page-level role guards.
- One `t()` call per sentence, with interpolation.
- React Query: query keys are plain string constants (no factories), no `select`, request building in a named typed method. Handle HTTP statuses the same way in every mutation for a resource.
- Every field the frontend sends must exist in the backend DTO.
- Interfaces at the top of the file; JSX handlers as named `handleX` functions.
- No `useEffect` for derived state, no defensive `?? []` on typed values, no `sx` or inline `style`.
- Don't add single-feature entries to shared common files.
- CI runs only `*.test.ts`; run `.test.tsx` files locally with `npx jest <path>`.
