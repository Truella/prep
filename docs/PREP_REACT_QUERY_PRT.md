# PREP — React Query Migration PRT
**Branch:** `feat/react-query`

```bash
git checkout main && git pull
git checkout -b feat/react-query
```

> Pure data layer refactor. No UI changes. No logic changes.
> Each commit is one hook. Verify type-check and behaviour after each.

```bash
npm install @tanstack/react-query
```

---

## COMMIT RQ-1 — Install and configure QueryClient

**Commit:** `feat(rq): install React Query and wrap app in QueryClientProvider`

---PROMPT---
Install React Query and set up the provider.

```bash
npm install @tanstack/react-query
```

**Update `app/layout.tsx`** — read the full file first. Add a `QueryClientProvider` wrapper around the existing providers. Since `QueryClient` requires client-side instantiation, create a thin provider component first.

**Create `src/components/ReactQueryProvider.tsx`:**
```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,       // 30 seconds
            gcTime: 5 * 60 * 1000,      // 5 minutes
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

**Update `app/layout.tsx`** — import `ReactQueryProvider` and wrap it around `AuthProvider`:
```tsx
import ReactQueryProvider from "../src/components/ReactQueryProvider";

// In the JSX, wrap AuthProvider:
<ReactQueryProvider>
  <AuthProvider>
    ...
  </AuthProvider>
</ReactQueryProvider>
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. App loads without errors.

---

## COMMIT RQ-2 — Migrate useQuizzes

**Commit:** `feat(rq): migrate useQuizzes to React Query`

---PROMPT---
Rewrite `src/hooks/useQuizzes.ts`. Read the current file fully before writing. Preserve the exact same return shape so no call sites break.

```ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../lib/types";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  visibility?: QuizVisibility;
  category?: QuizCategory | null;
  difficulty?: QuizDifficulty | null;
  times_taken?: number;
  average_rating?: number | null;
}

async function fetchUserQuizzes(): Promise<Quiz[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useQuizzes() {
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchUserQuizzes,
  });

  const error = queryError ? (queryError as Error).message : null;

  const copyQuizLink = (quizId: string) => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link);
    toast.success("Quiz link copied!");
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
      // Optimistic update — remove from cache immediately
      queryClient.setQueryData<Quiz[]>(["quizzes"], (prev) =>
        prev ? prev.filter((q) => q.id !== quizId) : []
      );
      toast.success("Quiz deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to delete quiz: ${message}`);
      // Revert by invalidating
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    }
  };

  return {
    quizzes,
    loading,
    error,
    copyQuizLink,
    deleteQuiz,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
  };
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. My Quizzes page loads and shows quizzes. Deleting a quiz removes it immediately from the list.

---

## COMMIT RQ-3 — Migrate useStats

**Commit:** `feat(rq): migrate useStats to React Query with 30s polling`

---PROMPT---
Rewrite `src/hooks/useStats.ts`. Read the current file fully. This hook gets polling — stats update automatically every 30 seconds so attempt counts stay fresh without manual refresh.

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
}

async function fetchStats(): Promise<Stats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 };

  const { count: quizCount } = await supabase
    .from("quizzes")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.id);

  const { data: userQuizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("created_by", user.id);

  const quizIds = userQuizzes?.map((q) => q.id) ?? [];

  let questionCount = 0;
  let attemptCount = 0;

  if (quizIds.length > 0) {
    const [{ count: qCount }, { count: aCount }] = await Promise.all([
      supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .in("quiz_id", quizIds),
      supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .in("quiz_id", quizIds),
    ]);
    questionCount = qCount ?? 0;
    attemptCount = aCount ?? 0;
  }

  return {
    totalQuizzes: quizCount ?? 0,
    totalQuestions: questionCount,
    totalAttempts: attemptCount,
  };
}

export function useAnalyticsStats() {
  const { data: stats = { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 }, isLoading: loading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    staleTime: 20 * 1000,       // Consider stale after 20 seconds
  });

  return { stats, loading };
}
```

Note: `Promise.all` runs the question and attempt counts in parallel instead of sequentially — faster than the current implementation.
---PROMPT---

**Verify:** Dashboard stats load correctly. After completing a quiz (in another tab), the stats counter updates within 30 seconds without any page interaction.

---

## COMMIT RQ-4 — Migrate useQuizBank

**Commit:** `feat(rq): migrate useQuizBank to React Query`

---PROMPT---
Rewrite `src/hooks/useQuizBank.ts`. Read the current file fully. The filter state stays local — only the Supabase fetch moves to React Query. Query key includes the filter values so changing filters triggers a new fetch automatically.

```ts
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { PublicQuiz, QuizCategory, QuizDifficulty } from "../lib/types";

type SortOption = "popular" | "rated" | "newest" | "alphabetical";

interface Filters {
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  sort: SortOption;
}

async function fetchPublicQuizzes(filters: Filters): Promise<PublicQuiz[]> {
  let query = supabase
    .from("quizzes")
    .select(
      "id, title, description, category, difficulty, times_taken, average_rating, created_at"
    )
    .eq("visibility", "public");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

  switch (filters.sort) {
    case "popular":
      query = query.order("times_taken", { ascending: false });
      break;
    case "rated":
      query = query.order("average_rating", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export function useQuizBank() {
  const [filters, setFiltersState] = useState<Filters>({
    category: null,
    difficulty: null,
    sort: "newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allQuizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizBank", filters.category, filters.difficulty, filters.sort],
    queryFn: () => fetchPublicQuizzes(filters),
    staleTime: 60 * 1000, // Quiz bank data is fine stale for 1 minute
  });

  const error = queryError ? (queryError as Error).message : null;

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFiltersState((prev) => ({ ...prev, [key]: value }));

  const quizzes = searchQuery
    ? allQuizzes.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuizzes;

  return {
    quizzes,
    loading,
    error,
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
  };
}
```
---PROMPT---

**Verify:** Quiz Bank page loads. Changing category/difficulty/sort triggers a new fetch. Search still filters client-side. Navigating away and back uses cached data — no loading flash.

---

## COMMIT RQ-5 — Migrate useQuizDetail

**Commit:** `feat(rq): migrate useQuizDetail to React Query`

---PROMPT---
Rewrite `src/hooks/useQuizDetail.ts`. Read the current file fully before writing. The quiz, questions, and attempts are three separate queries so they can be invalidated independently. Mutations call `invalidateQueries` after success instead of manually updating local state — simpler and more reliable.

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { dbToAppQuestion, appToDBQuestion } from "../utils/transforms";
import type {
  AppQuestion,
  QuizVisibility,
  QuizCategory,
  QuizDifficulty,
  QuizAttempt,
  QuizDraft,
} from "../lib/types";

type QuizMeta = QuizDraft & {
  id: string;
  created_at: string;
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  times_taken: number;
  average_rating: number | null;
};

type AttemptRow = Pick<
  QuizAttempt,
  "id" | "score" | "total_points" | "elapsed_seconds" | "completed_at"
>;

async function fetchQuiz(quizId: string): Promise<QuizMeta> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  if (error || !data) throw new Error("Quiz not found");
  return data;
}

async function fetchQuestions(quizId: string): Promise<AppQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((q, i) => dbToAppQuestion(q, i));
}

async function fetchAttempts(quizId: string): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, score, total_points, elapsed_seconds, completed_at")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useQuizDetail(quizId: string) {
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuiz(quizId),
  });

  const questionsQuery = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: () => fetchQuestions(quizId),
    enabled: !!quizId,
  });

  const attemptsQuery = useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: () => fetchAttempts(quizId),
    enabled: !!quizId,
    refetchInterval: 30 * 1000, // Poll attempts every 30 seconds
    staleTime: 20 * 1000,
  });

  const updateMetaMutation = useMutation({
    mutationFn: async (
      updates: Partial<
        Pick<
          QuizMeta,
          "title" | "description" | "time_limit" | "visibility" | "category" | "difficulty"
        >
      >
    ) => {
      const { error } = await supabase
        .from("quizzes")
        .update(updates)
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (question: AppQuestion) => {
      const payload = appToDBQuestion(question);
      const { error } = await supabase
        .from("questions")
        .update(payload)
        .eq("id", question.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast.success("Question updated");
    },
    onError: () => toast.error("Failed to update question"),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast.success("Question deleted");
    },
    onError: () => toast.error("Failed to delete question"),
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Quiz deleted");
    },
    onError: () => toast.error("Failed to delete quiz"),
  });

  const copyLink = () => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Link copied!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const loading =
    quizQuery.isLoading || questionsQuery.isLoading || attemptsQuery.isLoading;
  const error = quizQuery.error
    ? (quizQuery.error as Error).message
    : null;

  return {
    quiz: quizQuery.data ?? null,
    questions: questionsQuery.data ?? [],
    attempts: attemptsQuery.data ?? [],
    loading,
    error,
    saving:
      updateMetaMutation.isPending ||
      updateQuestionMutation.isPending ||
      deleteQuestionMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
    },
    updateQuizMeta: async (updates: Parameters<typeof updateMetaMutation.mutateAsync>[0]) => {
      try {
        await updateMetaMutation.mutateAsync(updates);
        return true;
      } catch {
        return false;
      }
    },
    updateQuestion: async (question: AppQuestion) => {
      try {
        await updateQuestionMutation.mutateAsync(question);
        return true;
      } catch {
        return false;
      }
    },
    deleteQuestion: async (questionId: string) => {
      try {
        await deleteQuestionMutation.mutateAsync(questionId);
        return true;
      } catch {
        return false;
      }
    },
    deleteQuiz: async () => {
      try {
        await deleteQuizMutation.mutateAsync();
        return true;
      } catch {
        return false;
      }
    },
    copyLink,
  };
}
```
---PROMPT---

**Verify:** Quiz detail page loads all three tabs. Editing a question saves and the list refreshes. Deleting a question removes it. Deleting the quiz navigates away and My Quizzes no longer shows it. Attempt count polls every 30 seconds.

---

## COMMIT RQ-6 — Migrate useRating

**Commit:** `feat(rq): migrate useRating to React Query`

---PROMPT---
Rewrite `src/hooks/useRating.ts`. Read the current file fully. The current rating fetch is a plain `useEffect` with a mounted flag — replace with `useQuery`. The upsert becomes a `useMutation`.

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

async function fetchRating(quizId: string, userId: string): Promise<number | null> {
  const { data } = await supabase
    .from("quiz_ratings")
    .select("rating")
    .eq("quiz_id", quizId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? data.rating : null;
}

async function upsertRating(
  quizId: string,
  userId: string,
  rating: number
): Promise<void> {
  const { error } = await supabase
    .from("quiz_ratings")
    .upsert(
      { quiz_id: quizId, user_id: userId, rating },
      { onConflict: "quiz_id,user_id" }
    );
  if (error) throw error;

  // Recalculate average_rating
  const { data: ratings } = await supabase
    .from("quiz_ratings")
    .select("rating")
    .eq("quiz_id", quizId);

  if (ratings && ratings.length > 0) {
    const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    await supabase
      .from("quizzes")
      .update({ average_rating: avg })
      .eq("id", quizId);
  }
}

export function useRating(quizId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currentRating = null, isLoading: loading } = useQuery({
    queryKey: ["rating", quizId, user?.id],
    queryFn: () => fetchRating(quizId, user!.id),
    enabled: !!user && !!quizId,
  });

  const mutation = useMutation({
    mutationFn: (rating: number) => upsertRating(quizId, user!.id, rating),
    onSuccess: (_, rating) => {
      queryClient.setQueryData(["rating", quizId, user?.id], rating);
      queryClient.invalidateQueries({ queryKey: ["quizBank"] });
      toast.success("Rating submitted!");
    },
    onError: () => toast.error("Failed to submit rating"),
  });

  return {
    currentRating,
    loading,
    error: mutation.error ? (mutation.error as Error).message : null,
    submitRating: async (rating: number) => {
      try {
        await mutation.mutateAsync(rating);
        return true;
      } catch {
        return false;
      }
    },
  };
}
```
---PROMPT---

**Verify:** Complete a public quiz while authenticated. Rating widget appears. Clicking a star submits and shows "Rating submitted!". Re-rendering the component shows the previously submitted rating from cache.

---

## COMMIT RQ-7 — Migrate useTakeQuiz fetch

**Commit:** `feat(rq): migrate useTakeQuiz quiz/questions fetch to React Query`

---PROMPT---
Update `src/hooks/useTakeQuiz.ts`. Read the full file carefully before writing — it is the most complex hook in the codebase. Only the two data-fetching calls (quiz metadata and questions) move to React Query. All local UI state (selectedAnswers, currentQuestionIndex, showResults, timer, etc.) stays as `useState` exactly as it is today. Do not touch any logic outside the fetch.

Add to imports:
```ts
import { useQuery } from "@tanstack/react-query";
```

The hook currently has a `fetchQuizData` function called in a `useEffect`. Replace that pattern with two `useQuery` calls:

```ts
const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
  queryKey: ["quiz-take", quizId],
  queryFn: async () => {
    if (!quizId) throw new Error("No quiz ID provided");
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    if (error || !data) throw new Error("Quiz not found");
    return data;
  },
  enabled: !!quizId,
  staleTime: 5 * 60 * 1000, // Quiz content rarely changes mid-session
  retry: 1,
});

const { data: questions = [], isLoading: questionsLoading } = useQuery({
  queryKey: ["quiz-take-questions", quizId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId!)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((q, i) => dbToAppQuestion(q, i));
  },
  enabled: !!quizId && !!quiz,
  staleTime: 5 * 60 * 1000,
});
```

Remove the `fetchQuizData` function, the `useCallback` wrapping it, and the `useEffect` that called it. Remove the `quiz` and `questions` `useState` declarations — they are now returned from `useQuery`.

Update `loading` and `error` derivation:
```ts
const loading = quizLoading || questionsLoading;
const error = quizError ? (quizError as Error).message : null;
```

The `startTimeRef` that was set inside `fetchQuizData` on load now needs to be set when `questions` first becomes non-empty. Add:
```ts
const questionsLoadedRef = useRef(false);
useEffect(() => {
  if (questions.length > 0 && !questionsLoadedRef.current) {
    questionsLoadedRef.current = true;
    startTimeRef.current = Date.now();
  }
}, [questions.length]);
```

The progress restore `useEffect` that depended on `quiz?.id` and `questions.length` stays exactly as-is — it already reacts to these values changing.

Remove `fetchQuizData` from anywhere it appears in the return object if it was exported.
---PROMPT---

**Verify:** Navigate to a quiz URL. Quiz loads correctly. Progress restores if previously saved. Timer starts. Submission works. All existing behaviour identical.

---

## COMMIT RQ-8 — Clean up unused imports and lint

**Commit:** `chore(rq): remove stale imports after React Query migration`

---PROMPT---
After the migration, several hooks no longer use `useState`, `useEffect`, `useCallback`, or `useRef` for data fetching. Run `npx next lint` and fix any unused import warnings across the migrated hook files:

- `src/hooks/useQuizzes.ts`
- `src/hooks/useStats.ts`
- `src/hooks/useQuizBank.ts`
- `src/hooks/useQuizDetail.ts`
- `src/hooks/useRating.ts`
- `src/hooks/useTakeQuiz.ts`

For each file: read it, identify which react imports are no longer used, remove them. Do not touch anything else.

Also check that `useRef` was removed from `useQuizBank.ts` (the `requestGenRef` cancellation pattern is replaced by React Query's built-in request deduplication).

Run `npx tsc --noEmit` and `npx next lint` after all changes. Fix any remaining issues.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes with zero errors. `npx next lint` passes with zero errors and zero warnings.

---

## PR Description

**Summary**
Migrates all data-fetching hooks to React Query (`@tanstack/react-query`). Benefits: automatic caching (navigating back to My Quizzes is instant), request deduplication, background refetching on window focus, and 30-second polling on stats and quiz attempt counts so creators see updated numbers without refreshing. Mutations in `useQuizDetail` now invalidate related queries automatically instead of manually patching local state. No UI changes — purely the data layer.

**New dependency:** `@tanstack/react-query`

**Changed files**
- `package.json`
- `src/components/ReactQueryProvider.tsx` (new)
- `app/layout.tsx`
- `src/hooks/useQuizzes.ts`
- `src/hooks/useStats.ts`
- `src/hooks/useQuizBank.ts`
- `src/hooks/useQuizDetail.ts`
- `src/hooks/useRating.ts`
- `src/hooks/useTakeQuiz.ts`

**Checklist**
- [ ] `npm install @tanstack/react-query` completed
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes with zero warnings
- [ ] My Quizzes loads — navigating away and back is instant (cached)
- [ ] Dashboard stats poll every 30 seconds
- [ ] Quiz detail attempt count updates without refresh
- [ ] Quiz Bank filter changes trigger new fetch
- [ ] Taking a quiz still works end-to-end
- [ ] Rating submission still works
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`
