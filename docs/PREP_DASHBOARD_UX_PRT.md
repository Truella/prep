# PREP — Dashboard UX PRT
**Branch:** `feat/dashboard-ux`

```bash
git checkout main && git pull
git checkout -b feat/dashboard-ux
```

---

## COMMIT DUX-1 — Remove duplicate sidebar analytics
**Commit:** `refactor(dashboard): remove duplicate sidebar analytics widget`

---PROMPT---
Read `src/components/SideBar.tsx` and `src/components/Analytics.tsx` in full first.

Remove the "Analytics" section from `SideBar.tsx`: the `<div className="border-t pt-4">` block containing the `AnalyticsWidget` heading and component, and its import. The sidebar should render only the `nav` block with `NAV_ITEMS`.

Delete `src/components/Analytics.tsx` — it has no other usages, confirm with a repo-wide search for `Analytics` and `AnalyticsWidget` before deleting.

Do not touch `useAnalyticsStats` in `src/hooks/useStats.ts`, it's still used by `Dashboard.tsx`.
---PROMPT---

**Verify:** `npm run lint` passes. Sidebar shows only Dashboard / Create Quiz / My Quizzes, no stat cards.

---

## COMMIT DUX-2 — Collapsible sidebar with icon rail and tooltips
**Commit:** `feat(dashboard): collapsible sidebar with tooltips`

---PROMPT---
Read `src/components/SideBar.tsx`, `src/components/SideBarLink.tsx`, and `src/components/DashboardLayout.tsx` in full first. Follow the existing persistence pattern in `src/lib/theme.tsx` (localStorage + a custom event for cross-component sync) for how state should persist.

Add a collapsed/expanded state for the sidebar, separate from the existing mobile `isSidebarOpen` open/close state. Persist it to localStorage under a `sidebar-collapsed` key so it survives reload. Add a toggle control at the top or bottom of the sidebar (an icon button, pick a sensible existing icon from `@hugeicons/core-free-icons` already imported elsewhere in the repo) that flips the state.

When collapsed:
- Sidebar width shrinks to an icon rail (roughly 64-72px, match existing spacing scale in `tailwind` config / `globals.css`)
- `SidebarLink` renders icon only, label is visually hidden but still in the DOM for accessibility (`sr-only` pattern, check if one exists in `globals.css`, otherwise use standard Tailwind `sr-only`)
- On hover, show the label as a tooltip. No tooltip library exists in this repo and none should be added for this. Build a minimal tooltip: absolutely positioned span next to the icon, shown on `:hover`/`:focus-within`, styled with the existing `--color-surface-raised` and `--color-border` tokens. Keep it small and reusable so DUX-3's theme toggle can use the same pattern.

When expanded, current behavior is unchanged (icon + label, no tooltip needed).

Desktop only for the collapse behavior — the existing mobile drawer (`isSidebarOpen`/overlay) logic stays as is, don't conflate the two states.
---PROMPT---

**Verify:** `npm run typecheck` passes. Manual: collapse sidebar, reload page, stays collapsed. Hover over an icon in collapsed state shows its label.

---

## COMMIT DUX-3 — Theme toggle in sidebar
**Commit:** `feat(dashboard): theme toggle in sidebar`

---PROMPT---
Read `src/components/ExternalNav.tsx` for the existing theme toggle pattern (`useTheme` from `src/lib/theme.tsx`, `resolvedTheme`, `setTheme`, `Sun01Icon`/`Moon01Icon` from `@hugeicons/core-free-icons`) before writing.

Add a theme toggle button to `src/components/SideBar.tsx`, placed at the bottom of the sidebar, below the nav links. Same icon-swap behavior as `ExternalNav.tsx` (sun/moon depending on `resolvedTheme`). When the sidebar is collapsed (DUX-2), this button follows the same icon-only-plus-tooltip treatment as the nav links, reusing the tooltip pattern built in DUX-2 rather than a new one.
---PROMPT---

**Verify:** Manual: toggling in the sidebar switches the theme app-wide, matches the toggle already on external pages. Works in both collapsed and expanded states.

---

## COMMIT DUX-4 — QuizRow component
**Commit:** `feat(dashboard): QuizRow replacing QuizCard and DraftQuizCard`

---PROMPT---
Read `src/components/QuizCard.tsx`, `src/components/DraftQuizCard.tsx`, and `src/components/skeletons/QuizSkeleton.tsx` in full first. Preserve all existing logic (unpublish confirm-then-commit pattern, delete confirm-then-commit pattern, copy link, copy code) — this is a layout change, not a behavior change.

Create `src/components/QuizRow.tsx`. Single component handling both draft and published quizzes (replaces both `QuizCard` and `DraftQuizCard`), row layout instead of card:

- Left: small status indicator (draft vs published), not a colored pill taking equal visual weight to the title
- Middle: title, truncated to one line, with question count and taken count as compact secondary text beneath or inline
- Right: one primary action, state-aware:
  - Draft → "Continue editing" (links to `/dashboard/create?resume={id}`, same as current `DraftQuizCard`)
  - Published, no attempts → "Manage" (links to `/dashboard/quiz/{id}`, same as current `QuizCard`)
  - Published, has attempts (`times_taken > 0`) → "View results" (same destination as Manage unless a separate results route already exists, check `app/dashboard/quiz/[quizId]` before assuming)
- Far right: a secondary actions trigger (kebab or similar icon button) opening the remaining actions — copy link, copy code (published only), unpublish (published only), delete (draft only). Reuse the existing confirm-then-commit pattern from the two components being replaced rather than inventing a new one.

Target row height roughly 56-64px, not the current ~150-180px card.

Props interface should cover both draft and published shapes (union of what `QuizCardProps` and `DraftQuizCardProps` currently take: `onCopyLink`, `onRefetch`, `onUnpublish`, `onDelete`, all optional except what's actually required per status).

Delete `QuizCard.tsx` and `DraftQuizCard.tsx` after confirming no other imports reference them.

Create `src/components/skeletons/QuizRowSkeleton.tsx` matching the new row height, replacing `QuizCardSkeleton` (`src/components/skeletons/QuizSkeleton.tsx`) — delete that file once unused.
---PROMPT---

**Verify:** `npm run typecheck` passes. `npm run test` passes (no existing tests reference the deleted components directly — confirm with a search first, adjust any that do).

---

## COMMIT DUX-5 — Fix Dashboard drafts visibility and stats
**Commit:** `fix(dashboard): surface drafts, replace Questions stat with Drafts`

---PROMPT---
Read `src/views/Dashboard.tsx` in full first, and `src/views/Quizzes.tsx` for the drafts-section pattern already in use there (heading + count, mapped list).

In `src/views/Dashboard.tsx`:
- Destructure `drafts` from `useQuizzes()` alongside `published`
- Add a "Continue where you left off" or "Drafts" section above "Recent quizzes" when `drafts.length > 0`, showing the most recently edited draft(s) via `QuizRow` (cap at 1-2, this is a dashboard summary not the full list)
- Replace the "Questions" stat card in the top stat row with a "Drafts" count, sourced from `drafts.length` (no change needed to `useAnalyticsStats`)
- Replace `QuizCard` usage in "Recent quizzes" with `QuizRow`
---PROMPT---

**Verify:** Manual: create a draft quiz, confirm it's visible on the dashboard before publishing. Stat row shows Quizzes / Drafts / Attempts.

---

## COMMIT DUX-6 — My Quizzes uses QuizRow
**Commit:** `refactor(dashboard): My Quizzes uses QuizRow`

---PROMPT---
Read `src/views/Quizzes.tsx` and `src/components/QuizListLoading.tsx` in full first.

Replace `QuizCard`/`DraftQuizCard` usage in `src/views/Quizzes.tsx` with `QuizRow` in both the Drafts and Published sections. Existing grid layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) should become a single-column row list (`space-y-2` or similar) since rows don't need a multi-column grid.

Update `QuizListLoading.tsx` to render `QuizRowSkeleton` (from DUX-4) instead of `QuizCardSkeleton`, adjust `SkeletonGrid` usage if a row list no longer needs grid columns — check `src/components/skeletons/SkeletonGrid.tsx` before deciding whether to keep using it or render a simple stacked list of skeletons.
---PROMPT---

**Verify:** `npm run test` passes. Manual: My Quizzes page shows drafts and published as compact rows, matches Dashboard's row styling.
