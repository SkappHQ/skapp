# Frontend

Code lives in `src/community/<module>/` (`api`, `components/{atoms,molecules,organisms}`, `hooks`, `store`, `types`, ...).

## Enterprise fallback

- `~enterprise/*` resolves to `src/enterprise` (private submodule), else `src/fallback`. When community code imports from `~enterprise`, add a stub in `src/fallback/`.
- Route access is gated in `proxy.ts`. Check it before adding page-level role guards.

## Conventions

- Every user-facing string goes through `useTranslator`, with text in `common/assets/languages/english/<module>.json`. One `t()` per sentence, with interpolation.
- React Query hooks live in `<module>/api/<Feature>Api.ts`. Query keys are plain string constants, no `select`, request building in a named typed method.
- Handle HTTP statuses the same way in every mutation for a resource.
- Reuse shared components and `@rootcodelabs/skapp-ui` before building new ones.
- Named `interface`s at the top of the file; JSX handlers as named `handleX` functions.
- No `useEffect` for derived state, no defensive `?? []` on typed values, no `sx` or inline `style` (use Tailwind or `variant`).
- Don't add single-feature entries to shared common files.

## Tests

- Jest + Testing Library, co-located. CI runs only `*.test.ts`, so run `.test.tsx` files locally with `npx jest <path>`.
