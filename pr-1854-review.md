# PR #1854 Review — feat(crm): add the shared task modal form

**Link:** https://github.com/SkappHQ/skapp/pull/1854 · **Author:** YasinduRC · **State:** OPEN · **`crm/task-4-modal-form` → `crm/task-3-side-panel`**

## What this PR was supposed to do

Add the shared task form used by both the add-task and edit-task modals in the CRM
v2 tree: a Formik-driven layout with name, type, priority, due date, owner,
contact, deal and notes fields, plus a forked `SelectedOwnerField` for the
selected-owner chip. The modal parents that mount it land separately on
`crm/task-5-modal-contents`.

## Bottom line

24 unresolved bot threads, none marked outdated — the code they point at is still
exactly as reviewed. **12 were real and are now fixed.** 4 are not valid. The
remaining 8 are fair but are either parent-branch concerns, deliberate project
decisions, or refactors bigger than this PR.

| | Count |
|---|---|
| ✅ Valid — fixed | 12 |
| ⚠️ Partly valid — not applied | 8 |
| ❌ Not valid | 4 |

Port breakdown: 7 regressions against v1, 3 genuinely new, the rest inherited or
out of scope.

---

## ✅ Fixed

### 1. Clear handlers wrote `""` into numeric fields — `TaskModalForm.tsx:223`
**Regression.** v1 wrote `null` (`setFieldValue("contactId", null)`). Writing `""`
into `ownerId`/`contactId`/`dealId` means Yup casts to `NaN`, so
`ownerId: Yup.number().required()` passes and the raw untranslated `typeError`
shows instead of "Please select a task owner." For `contactId`/`dealId` — absent
from the schema — `""` reaches `getChangedTaskFields` and is PATCHed to a Long
field.
**Fix:** all three now write `null`, matching v1.

### 2. Truthiness guards on numeric ids — `TaskModalForm.tsx:186-190`
`values.ownerId ? ...` treats id `0` as unset. v2 convention is an explicit null
check.
**Fix:** `values.ownerId != null ? owners[values.ownerId] : undefined`, same for
contact and deal.

### 3. Lookups fired unfiltered on mount — `TaskModalForm.tsx:118, 129`
**Regression.** `useGetContactLookupV2`/`useGetDealLookupV2` were hardcoded
`enabled: true`, and the owner lookup dropped v1's `debouncedOwnerSearch.length > 0`,
so mounting fired three `size=50` requests whose results can't even be displayed.
**Fix:** named flags `isOwnerSearchEnabled` / `isContactSearchEnabled` /
`isDealSearchEnabled`, each gated on the debounced term (owner also keeps the
`isCrmSalesManager` gate).

### 4. Dropdown item arrays rebuilt every render — `TaskModalForm.tsx:144`
**Regression.** v1 wrapped all three arrays in `useMemo`. Without it every
keystroke in any field recreated the JSX `content` nodes, remounting each
`OwnerAvatarChip` and re-running `useGetImageUrl`.
**Fix:** all four derived arrays (`owner`/`contact`/`deal` dropdown items and
`taskTypeOptions`) are memoised, and the three `*LookupItems` memos now key on
`data?.items` rather than the whole response, matching `AddDealSidePanelV2.tsx:99`.

### 5. Uncontrolled → controlled inputs — `TaskModalForm.tsx:258, 388`
**Regression.** The form model is `FormikProps<CrmTaskEntity>` and every field on
that API entity is optional, so `value={values.name}` starts `undefined`. With
`enableReinitialize` on the edit form, a task with no notes silently loses its
controlled binding.
**Fix:** `values.name ?? ""` and `values.notes ?? ""`. Left `CrmTaskEntity` alone —
the relaxed entity type is load-bearing, so coercing at the call site is the
correct half of the bot's suggestion.

### 6. Notes had no `maxLength` — `TaskModalForm.tsx:386`
The name field caps at `TASK_NAME_LENGTH` and the schema caps notes at
`TASK_NOTES_LENGTH`, but the textarea let you type past it and only complained on
submit.
**Fix:** `maxLength={characterLengths.TASK_NOTES_LENGTH}`.

### 7. `isOpenOnFocus` dropped — `TaskModalForm.tsx:356`
**Regression.** v1 passed `isOpenOnFocus={isContactSearchEnabled}`;
`SelectableSearchField` defaults it to `true`, so merely tabbing into the field
popped open an unfiltered list.
**Fix:** passed explicitly on both fields, gated on the debounced term.

### 8. Cleared due date wasn't transmitted — `TaskModalForm.tsx:245`
**Regression.** v1 wrote `date?.toISOString() ?? null`. `undefined` is dropped by
`JSON.stringify`, so clearing a due date omitted the field from the PATCH instead
of clearing it.
**Fix:** `?? null` restored.

### 9. Avatar chip label and image source — `SelectedOwnerField.tsx:39, 44, 50`
Three real defects in one component: `concatStrings` doesn't trim, so a missing
last name yields `"John "`; `src: imageUrl ?? ""` gives Avatar a defined-but-empty
image source (`AvatarProps.src` is `string | undefined`, and `OwnerAvatarChip`
uses `?? undefined`); and `aria-label` isn't an `AvatarChipProps` field at all —
the API exposes **`actionButtonAriaLabel`**, so the label was landing nowhere.
**Fix:** all three are now inherited automatically — see #10.

### 10. `SelectedOwnerField` duplicated `OwnerAvatarChip` — `SelectedOwnerField.tsx:1, 38`
The component re-implemented exactly what the v2 atom `OwnerAvatarChip` already
does — `useGetImageUrl(owner.authPic ?? "")`, `concatStrings`, and the `AvatarChip`
wiring — which is *why* the three defects in #9 existed: the atom had already
fixed them and the fork drifted. `TaskModalForm` imports both components, so the
selected-owner chip and the dropdown rows were rendering the same thing from two
different code paths.
**Fix:** `OwnerAvatarChip` gained optional pass-through props (`actionIcon`,
`onActionClick`, `showActionButton`, `actionButtonAriaLabel`) — additive, and none
of its three existing consumers pass them. `SelectedOwnerField` is now a label +
container wrapper around it, down from 57 lines to 46, with no avatar or image-URL
logic of its own. The trim, the `src ?? undefined` and the correct aria prop all
come from the atom now, so the two can't drift again.

### 11. Deal/contact cross-scoping and autofill dropped — `TaskModalForm.tsx:212`
**Regression.** v1 narrowed each lookup by the other selection and by the company
side-panel scope, and auto-filled the contact from the chosen deal. v2 dropped all
of it, so a user could pick a deal and an unrelated contact with neither list
narrowed.
**Fix:** restored to match v1.
- `CrmDealFilterRequest` already carried `contactId`/`companyId`, so the deal
  lookup just passes `values.contactId` and the company scope.
- `useGetContactLookupV2` gained optional trailing `dealId`/`companyId` params
  (the same shape v1's `useGetDealLookup` used) — additive, so
  `AddDealSidePanelV2` and `DealPropertiesSidebar` are untouched. `CrmContactFilterRequest`
  already had both fields; the hook simply wasn't forwarding them.
  `crmLookupQueryKeys.CONTACT_LOOKUP` now includes them so the cache splits per scope.
- `companyScopeId` is derived from the store exactly as v1 did — the company id
  only applies while the company side panel is the open panel.
- Each lookup drops its own company scope once the *other* relation is chosen
  (`contactLookupCompanyId = hasSelectedDeal ? undefined : companyScopeId`),
  matching v1's precedence.
- `enabled` follows v1: a term typed, **or** the opposite relation selected, **or**
  a company scope — so choosing a deal now populates the contact list with that
  deal's contacts without typing.
- `handleDealSelect` auto-fills `contactId` from `deal.contactId`. v1 also carried
  `contactName` on the deal for display; v2 resolves the name from the `contacts`
  record, which `useInitializeCrmData` seeds.

Not carried over: `CrmTaskEntity.companyId` is still never set from the company
scope. That needs the parent to pass the scope into the submitted payload, so it
belongs with the modal contents.

---

## ⚠️ Valid but not applied

- **Store writes merge a stale snapshot** (`:196`) — the setters replace the whole
  slice from the render-closure record. The bot's fix is
  `useCrmStoreV2.getState()` read-then-write, which does have precedent
  (`DealsSectionV2.tsx:73` and four others), but spreading that pattern is a
  project decision made against. Left as-is deliberately.
- **Non-sales-managers and the required owner** (`:329`) — largely handled by the
  parent: `AddTaskModalContent` on task-5 seeds `ownerId` from
  `useGetUserPersonalDetails`. Still fragile if that owner isn't in the `owners`
  record.
- **`selectedDeal` has no hydration fallback** (`:190`) — `deals` is never seeded
  by `useInitializeCrmData`. A parent-side concern like the one above.
- **`taskTypes` source-of-truth unguarded** (`:73`) — the parent should gate on
  `isCrmDataInitialized`.
- **Reuse `OwnerPopupSearch`/`ContactPopupSearch`** (`:22`) — **not swapped, the UI
  has diverged.** Both render `DropdownWithSearchablePopup` (click a trigger, type
  inside a popup) and expose no `label`, no `errorMessage` and no required marker —
  only `placeholder` / `ariaInvalid` / `ariaRequired`. They are built for
  `PropertyRow` in the side panel, which supplies the label. This form stacks
  label-above-field with inline errors and an asterisk on owner, so the swap would
  drop three visible labels and the owner's validation message. There is also no
  `DealPopupSearch`, so the deal field would stay on the v1 component regardless,
  leaving two interaction models in adjacent fields.
  **Done instead:** `SelectableSearchField` was ported into
  `crm/v2/components/molecules/` verbatim (70 lines, presentational, no store or
  API coupling) and the form imports the v2 copy. That removes the v2 → v1
  component dependency — the real risk when the v1 tree is deleted — with no UI
  change. `OwnerPopupSearch`'s `isSelectedMissing` fallback stays a good answer to
  the owner-hydration gap if that field is reworked later.
- **427-line file** (`:1`) — fair, and the seams identified are the right ones, but
  larger than a comment fix.
- **Deal lookup shares `crmDealQueryKeys.GET_DEALS`** (`:129`) and
  **`getTaskTypeOptions` ignores `orderIndex`** (`:179`) — both live in files this
  PR doesn't touch.

## ❌ Not valid

- **`.find()` should early-return** (`:198`) — the bot itself notes v1 has the
  same shape. Inherited; parity is the goal.
- **Restore `clearError` calls** (`:237`) — conditional on the parent using
  validate-on-submit. The task-5 parents set `validateOnChange: false,
  validateOnBlur: true`, so Formik already clears the error on blur. v1 needed the
  manual calls because it set both to `false`.
- **Lookups expose no loading/error state** (`:131`) — v1's `TaskModalForm` has no
  `isFetching`/`isError` handling either. Inherited.
- **Dead code and no tests** (`:427`) — the consumers land in the next stacked PR,
  and `src/community/crm` has zero component tests by convention.

## Verification

`npx tsc --noEmit -p .` — only the two known `crm/v2` baseline errors
(`AddDealSidePanelV2/DealPropertiesSection.tsx:48`,
`useInitializeCrmData.test.ts:41`). `npx eslint` on both changed files — clean.
