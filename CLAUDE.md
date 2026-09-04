# Skapp — working notes for Claude

Monorepo: Spring Boot backend (`backend/`), Next.js + TypeScript frontend
(`frontend/`). The rules below are frontend rules unless stated otherwise, and
most were established while porting the CRM module to `crm/v2`.

## Verification before claiming anything

- After editing frontend files, run both:
  ```bash
  cd frontend && npx tsc --noEmit -p . && npx eslint <changed files>
  ```
- **The repo does not type-check clean.** There is a pre-existing baseline of
  roughly 626 tsc errors. Within `community/crm/v2` the baseline is exactly two:
  `AddDealSidePanelV2/DealPropertiesSection.tsx:48` and
  `useInitializeCrmData.test.ts:41`. Always diff against the baseline and state
  what remains — never report "clean" without qualification.
- Re-read a file from disk before editing it if you last saw it several turns
  ago, and before asserting that some pattern does not exist. Files change under
  you (editor edits, branch switches, reverts), and a stale read produces a
  confident wrong answer.

## The CRM v1 → v2 port

`crm/v2/**` is a rewrite of `crm/**` onto a normalized Zustand store
(`useCrmStoreV2`) plus a react-query data layer, keeping the same UI and
behaviour.

**Check the v1 predecessor first** — same path minus `/v2/` — and bucket any
issue before acting on it:

| Bucket | Meaning | Action |
|---|---|---|
| Regression | v1 was correct, v2 broke it | Fix |
| Inherited | v1 has the same issue | Leave it — parity is the goal |
| New to v2 | No v1 equivalent | Judge on merits |

Override v1 parity only for: a broken build, a user-visible wrong value, or
something genuinely new to v2. Two known cases where v1 is *not* a safe model:
avatar `src` handling (below), and using `<p>` as a flex layout container.

## Store access and props

- **Resolve entities at the container; pass the object down.** The component that
  owns the `useCrmStoreV2` subscription resolves the record and passes it whole.
  Children take `task: CrmTaskEntity`, not `taskId: number`, and must not
  re-read the same record from the store.
- Resolve related records (`owner`, `contact`, task type) in that same container
  and pass them alongside, rather than each child subscribing to its own slice.
- Mutations and UI-state setters (`setTasks`, `useUpdateTask`, `setSelectedTaskId`,
  `openCrmSidePanel`) belong in the container too; children receive callbacks.
- Use the slice's own setter actions from the `useShallow` selector. Do **not**
  introduce `const store = useCrmStoreV2.getState()` read-then-write into effects
  or callbacks, even though some organisms do it — this is a deliberate project
  decision. No functional `setState((s) => ...)` either; the slices don't expose
  that form.
- Subscribe with `useShallow` and select only the fields used.

## Types and optionality

- Entity types are **deliberately relaxed** — `CrmTaskEntity.id`, `ownerId`,
  `contactId` are optional because the same type covers loaded records and
  create-form payloads. Do not tighten shared entity types to satisfy a
  component; that optionality is load-bearing.
- **No `!` non-null assertions and no `as` casts.** Handle the case or design the
  type.
- **Optional props are `prop?: T`, never `prop: T | undefined`.** The union form
  is not used anywhere in `crm/v2`. (`exactOptionalPropertyTypes` is off, so a
  possibly-undefined value passes fine to a `?:` prop.)
- A prop is optional or required, never both — a required prop whose body still
  does `owner?.x` and `{owner && ...}` is a contradiction.
- The parent performs the existence check and passes the value; the child
  declares the prop optional and renders accordingly.
- Don't edit shared people types (e.g. `EmployeeTypes.tsx`) for CRM needs — fix
  at the CRM boundary instead.
- Don't add backend endpoints for v2; call the existing v1 endpoint from the v2
  API layer.

### Narrowing rules that actually bite

- Property narrowing does **not** narrow the object: `task.id && <Row task={task} />`
  narrows `task.id` only. A prop requiring `id: number` still fails; passing
  `taskId={task.id}` inside that guard works.
- Narrowing does **not** survive into closures. After `if (task.id == null) return null;`,
  `onClick={() => f(task.id)}` is still `number | undefined` — capture
  `const taskId = task.id;` after the guard and use the local.
- Narrowing array elements needs a type predicate:
  `.filter((task): task is CrmTaskEntity & { id: number } => task.id != null)`.
  Use `!= null`, not truthy `&&` — truthy also drops `0`. This matches
  `commonUtil.ts`, `boardUtil.ts`, `dealUtil.ts`.
- **`noUncheckedIndexedAccess` is off.** `Record<number, T>` index access is typed
  `T`, so a missing key yields `undefined` behind a non-optional type. A runtime
  guard the types call redundant may be the only thing preventing a crash.

## UI conventions

- **Avatars:** `AvatarProps.src` is `string | undefined`. Use
  `src={imageUrl ?? undefined}` — as in `DealCardV2` and `OwnerAvatarChip`. Not
  `?? ""` (a defined-but-empty image source) and not raw `imageUrl` (v1's
  `TaskRowMeta` does this and is a baseline type error). `useGetImageUrl(owner?.authPic ?? "")`
  is the call shape, and the hook stays unconditional.
- **Separators** render only when both neighbours render. Gate them on the
  resolved display value, not on the entity behind it — a contact that resolves
  to an empty name still trips an entity guard and leaves a dangling `2 days due •`.
  Prefer three flat siblings (value, separator, value) over nesting the separator
  in a fragment with one side.
- Mark decorative separators `aria-hidden="true"` (see `PropertyRow`).
- A flex row of labels is a `<div>`, not a `<p>`.
- No magic values — use constants, theme tokens, and `useTranslator` keys.
  i18next `_one` / `_other` suffixes resolve from a `count` interpolation value
  and are correct as-is.

## Testing

There are **no component tests** under `src/community/crm` — util tests only.
"This component has no test file" is not a valid review finding here.

## Tooling

- `gh` is installed but usually not on the shell PATH — use
  `"/c/Program Files/GitHub CLI/gh.exe"`.
- Branches are stacked (`crm/task-1-api-tables` → `task-2-tab-content-rows` →
  `task-3-side-panel` → `task-4-modal-form` → `task-5-modal-contents`). Editing
  an earlier branch does not propagate; the stack is rebuilt manually. Never
  restore, re-apply, or copy changes between branches or worktrees unprompted —
  surface the discrepancy and let the user decide.
