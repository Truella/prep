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

## Files touched

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

No other files changed. Data hooks (`useQuizzes`, `useCreateQuiz`, etc.) still
call Supabase and will return errors/empty lists while paused — routes render,
but nothing persists.

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
4. Delete this file (`docs/TEMP_AUTH_BYPASS.md`).
5. Verify: `npm run typecheck`, `npm run lint`, then `git diff` should be empty.

Equivalent one-liner revert (from repo root, discards ONLY these two files):
```powershell
git checkout -- src/features/auth/context/AuthContext.tsx src/features/auth/components/RequireAuth.tsx
```
Then remove the `.env.local` line.
