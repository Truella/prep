# TEMP Auth Bypass — Supabase Paused

> Temporary local-only workaround while the Supabase project is paused.
> Allows working in authenticated `/dashboard/*` routes without a live backend.
> Delete this file + revert below when Supabase is resumed.

## Why
`AuthProvider` calls `supabase.auth.getUser()` on mount and `RequireAuth`
redirects to `/auth` when there is no user. With Supabase paused those calls
fail/hang, locking out `/dashboard`, `/dashboard/create`, `/dashboard/my-quizzes`,
`/dashboard/quiz/[quizId]`.

## How it works
Single flag: `NEXT_PUBLIC_BYPASS_AUTH === "true"`.

When `true`:
- `AuthProvider` never touches Supabase, immediately sets a mock user and
  `initializing = false`.
- `signIn` / `signUp` become no-ops: set mock user + `router.push("/dashboard")`.
- `signOut` becomes a no-op: `router.push("/auth")` (stays logged in).
- `RequireAuth` skips the `/auth` redirect and skeletons, renders `children`
  directly.

When `false` / unset: original Supabase behavior, zero changes.

## Local quiz creation (no DB writes)

When `BYPASS_AUTH=true`, quiz creation/listing/detail/take also run against
`localStorage` instead of Supabase, so work survives reloads until you unpause
and revert.

- Storage keys: `prep.local.quizzes.v1`, `prep.local.questions.v1` (plus the
  existing `quiz_builder_draft`, `quiz_meta_draft`, `quiz_results_*` keys).
- Mock owner id: `dev-user-id`. Attempt history is stubbed as empty; take-flow
  attempts skip the DB insert and still show results via `quiz_results_*`.
- IDs are generated locally (`quiz-<uuid>`, `q-<uuid>`), so share links look like
  `/quiz/quiz-...` and work for local preview only. They will NOT exist in
  Supabase after unpausing — export/recreate anything worth keeping.

## Files touched (local-data mode)

1. `.env.local` (new, gitignored — NOT committed)
   ```ini
   NEXT_PUBLIC_BYPASS_AUTH=true
   ```
   Restart `npm run dev` after adding/changing (NEXT_PUBLIC_ vars are inlined at build).

2. `src/features/auth/context/AuthContext.tsx`
   - Added export:
     ```ts
     export const BYPASS_AUTH =
       process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

     const MOCK_DEV_USER = {
       id: "dev-user-id",
       email: "dev@localhost.test",
       app_metadata: { provider: "email", providers: ["email"] },
       user_metadata: { email: "dev@localhost.test" },
       aud: "authenticated",
       created_at: new Date().toISOString(),
     } as unknown as User;
     ```
   - Early return at top of the session `useEffect` (sets mock user, no Supabase).
   - Early returns at top of `signUp`, `signIn`, `signOut`.

3. `src/features/auth/components/RequireAuth.tsx`
   - Added `import { BYPASS_AUTH } from "@/features/auth/context/AuthContext"`.
   - Guard inside redirect `useEffect`: `if (BYPASS_AUTH) return;`
   - Early render after all hooks: `if (BYPASS_AUTH) return <>{children}</>;`

4. `src/features/quiz-management/utils/localQuizStore.ts` (new — delete on revert)
   - `localStorage`-backed `LocalQuiz` + `AppQuestion` store: create/read/update/delete
     for quizzes and questions. All functions are `BYPASS_AUTH`-only callers.

5. Bypass branches (all gated on `if (BYPASS_AUTH)`, search `TEMP (Supabase paused)`):
   - `src/features/quiz-management/hooks/useCreateQuiz.ts` — load draft, create quiz,
     `persistQuizMeta`, `insertQuestions`, `publishQuiz` use the local store.
   - `src/features/quiz-management/hooks/useQuizzes.ts` — list/unpublish/delete use
     the local store (with `question_count` from local questions).
   - `src/features/quiz-management/hooks/useQuizDetail.ts` — fetch quiz/questions
     (attempts → `[]`) and update/delete/unpublish/republish mutations use the local store.
   - `src/features/quiz-management/hooks/usePublishQuiz.ts` — visibility update uses
     the local store.
   - `src/features/quiz-taking/hooks/useTakeQuiz.ts` — quiz/questions read from the
     local store; `saveAttempt` returns `true` without a DB write.
   - `src/features/dashboard/hooks/useStats.ts` — counts computed from the local store
     (`totalAttempts: 0`).

Quiz Bank / public discovery, ratings, and `/quiz/[quizId]` server reads still hit
Supabase and will error while paused — local mode covers the dashboard
creation loop (`/dashboard`, `/dashboard/create`, `/dashboard/my-quizzes`,
`/dashboard/quiz/[quizId]`, take-flow for local quizzes).

## Disable without reverting (recommended first step)
```ini
# .env.local
NEXT_PUBLIC_BYPASS_AUTH=false
```
Then restart dev server. Code stays but is inert.

## Full revert (when Supabase is live again)
1. Delete `.env.local` entry (or the file if it holds nothing else).
2. In `src/features/auth/context/AuthContext.tsx`, delete:
   - `BYPASS_AUTH` + `MOCK_DEV_USER` block,
   - the `if (BYPASS_AUTH) {...}` block in `useEffect`,
   - the three `if (BYPASS_AUTH) {...}` blocks in `signUp`/`signIn`/`signOut`.
3. In `src/features/auth/components/RequireAuth.tsx`, delete:
   - the `BYPASS_AUTH` import,
   - `if (BYPASS_AUTH) return;` in `useEffect`,
   - the `if (BYPASS_AUTH) return <>{children}</>;` block.
4. Delete `src/features/quiz-management/utils/localQuizStore.ts`.
5. Remove every `// TEMP (Supabase paused)` branch in: `useCreateQuiz.ts`,
   `useQuizzes.ts`, `useQuizDetail.ts`, `usePublishQuiz.ts`, `useTakeQuiz.ts`,
   `useStats.ts` (plus their `BYPASS_AUTH` / `localQuizStore` imports).
6. Optional: clear dev data in browser DevTools → Application → Local Storage:
   `prep.local.quizzes.v1`, `prep.local.questions.v1`.
7. Delete this file (`docs/TEMP_AUTH_BYPASS.md`).
8. Verify: `npm run typecheck`, `npm run lint`, then `git diff` should be empty.

Equivalent one-liner revert (from repo root, discards all TEMP changes):
```powershell
git checkout -- src/features/auth/context/AuthContext.tsx src/features/auth/components/RequireAuth.tsx src/features/quiz-management/hooks/useCreateQuiz.ts src/features/quiz-management/hooks/useQuizzes.ts src/features/quiz-management/hooks/useQuizDetail.ts src/features/quiz-management/hooks/usePublishQuiz.ts src/features/quiz-taking/hooks/useTakeQuiz.ts src/features/dashboard/hooks/useStats.ts
```
Then delete `src/features/quiz-management/utils/localQuizStore.ts`,
remove the `.env.local` line, and delete this doc.
