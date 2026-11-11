# Frontend (Next.js)

Next.js 16 pages router, React 19, TypeScript, React Query, Zustand, Formik + Yup, Tailwind 4, MUI 6, and the in-house `@rootcodelabs/skapp-ui` library.

## Layout

- `pages/` — routes (`pages/community`, `pages/enterprise` submodule, `pages/api`).
- `src/community/<module>/` — modules: `attendance`, `auth`, `common`, `configurations`, `crm`, `leave`, `people`, `settings`. Each has `api`, `components/{atoms,molecules,organisms}`, `constants`, `enums`, `hooks`, `store`, `types`, `utils`.
- `src/enterprise/` is a private submodule. `src/fallback/` holds community stand-ins for it.
- Path aliases: `~community/*`, `~enterprise/*` (resolves to `src/enterprise`, else `src/fallback`), `~styles/*`, `~public/*`, `~i18n`, `~proxy`.
- When community code imports from `~enterprise/...`, add a matching stub under `src/fallback/` so the app builds without the submodule.
- `NEXT_PUBLIC_MODE=enterprise` switches enterprise behaviour (e.g. translations in `i18n.ts`).
- Route access is gated in `proxy.ts` (role allowlists by route prefix). Check it before adding page-level role guards. The backend `@PreAuthorize` is the real security boundary.

## i18n

- Every user-facing string goes through `useTranslator` (`~community/common/hooks/useTranslator`), including dropdown labels, toasts and modal copy.
- Strings live in `src/community/common/assets/languages/english/<module>.json` (e.g. `leaveModule.json`). Constants files hold enum values only, never display labels.
- One `t()` call per sentence, using interpolation, not several fragments concatenated.

## API layer (React Query)

- API hooks live in `src/community/<module>/api/<Feature>Api.ts`.
- Query keys are plain string constants, one per resource. No key factories.
- No `select` option. Shape data in the API method or at the call site.
- Request building goes in a named, typed method, not an inline `queryFn` arrow. Keep endpoint constants with the feature unless they're shared.
- Branch on HTTP status the same way in every mutation for a resource (409/403 vs generic error).

## Components and TypeScript

- Atomic structure: atoms → molecules → organisms. Reuse existing shared components (`RadioGroup`, button variants, skapp-ui) before building new ones.
- Extract inline object types into named `interface`s. Type declarations go at the top of the file.
- JSX props with function bodies become named `handleX` functions above the `return`.
- Don't use `useEffect` for derived state; compute it.
- No defensive fallbacks (`?? []`, `|| default`) on values the types already guarantee. Fix the type instead.
- Style with Tailwind classes or the component's `variant` prop, not `sx` or inline `style`.
- Logic repeated in two places (e.g. role checks) gets extracted into a hook like `useCanManage<Feature>()`.
- Don't add entries to shared common files (e.g. `httpStatusCodes.ts`) for a single feature.

## Tests

- Jest + Testing Library, co-located as `<Component>.test.tsx` / `<util>.test.ts`.
- CI's test job only runs `*.test.ts` files; run `.test.tsx` files locally with `npx jest <path>`.
