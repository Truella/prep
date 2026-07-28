# PREP — Internal Pages PRT (PR-INTERNAL-1 + PR-INTERNAL-2)

> Covers: system theme support, dashboard token pass, quiz_attempts table,
> CSV preview, quiz detail page, and full CRUD.
> Paste one ---PROMPT--- block at a time. Verify each before moving on.

---

# PR-INTERNAL-1 — Theme system + dashboard token pass + quiz_attempts
**Branch:** `feat/internal-theme-crud`

```bash
git checkout main && git pull
git checkout -b feat/internal-theme-crud
```

> After commit INT-1A, run the quiz_attempts migration in Supabase dashboard
> before continuing to INT-1C and INT-1D.

---

### COMMIT INT-1A
**Commit:** `fix(theme): system-aware theme, update ThemeProvider`

---PROMPT---
Two changes only.

**1. Update `app/layout.tsx`** — find the `ThemeProvider` and change:
```tsx
// FROM:
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
// TO:
<ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
```

**2. Update `app/globals.css`** — the `.light` selector currently handles light theme overrides. Confirm it exists and is correct. Also add a `@media (prefers-color-scheme: light)` block that mirrors the `.light` selector values for the case where no class is set yet on first load:

```css
@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    --color-bg: #F7F5F0;
    --color-surface: #FFFFFF;
    --color-surface-raised: #F0EDE6;
    --color-border: #E2DDD4;
    --color-text-primary: #0A0A0F;
    --color-text-secondary: #6B6870;
    --color-accent: #B8960A;
    --color-accent-dim: #FBF3D0;
  }
}
```

No other changes in this commit.
---PROMPT---

**Verify:** Open app in a browser with system set to light — background should be `#F7F5F0`. Toggle system to dark — background `#0A0A0F`. Theme toggle in `ExternalNav` still works for manual override.

---

### COMMIT INT-1B
**Commit:** `feat(db): quiz_attempts table migration and type`

---PROMPT---
**Supabase migration** — run this SQL in the Supabase dashboard before any code changes:

```sql
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  score integer not null,
  total_points integer not null,
  elapsed_seconds integer,
  answers jsonb not null,
  completed_at timestamptz default now()
);

alter table quiz_attempts enable row level security;

create policy "Anyone can insert attempts"
  on quiz_attempts for insert
  with check (true);

create policy "Quiz owner can read attempts"
  on quiz_attempts for select
  using (
    exists (
      select 1 from quizzes
      where id = quiz_id and created_by = auth.uid()
    )
  );
```

**Update `src/lib/types.ts`** — add the attempt type:

```ts
export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_points: number;
  elapsed_seconds: number | null;
  answers: Record<string, number>;
  completed_at: string;
}
```

No other code changes in this commit.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. Table exists in Supabase dashboard.

---

### COMMIT INT-1C
**Commit:** `feat(attempts): save attempt on quiz completion`

---PROMPT---
Update `src/hooks/useTakeQuiz.ts`. Read the full file before editing.

Import `QuizAttempt` from types. After `confirmSubmit` and `handleTimerExpire` set `showResults: true`, both should also insert a row into `quiz_attempts`.

Add a `saveAttempt` helper inside the hook:
```ts
const saveAttempt = async (elapsed: number) => {
  if (!quiz?.id) return;
  const { earned } = calculateScore();
  const totalPts = questions.reduce((sum, q) => sum + q.points, 0);

  await supabase.from("quiz_attempts").insert({
    quiz_id: quiz.id,
    score: earned,
    total_points: totalPts,
    elapsed_seconds: elapsed,
    answers: selectedAnswers,
  });
};
```

Update `confirmSubmit`:
```ts
const confirmSubmit = () => {
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  setElapsedSeconds(elapsed);
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
  saveAttempt(elapsed);
};
```

Update `handleTimerExpire`:
```ts
const handleTimerExpire = () => {
  const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
  setIsAutoSubmit(true);
  setElapsedSeconds(elapsed);
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
  saveAttempt(elapsed);
};
```

`saveAttempt` is fire-and-forget — do not await it in the submit handlers, do not block UI on it. If it fails silently the results still show.
---PROMPT---

**Verify:** Complete a quiz. Row appears in `quiz_attempts` table in Supabase dashboard with correct score, elapsed_seconds, and answers JSON.

---

### COMMIT INT-1D
**Commit:** `fix(stats): wire totalAttempts from quiz_attempts table`

---PROMPT---
Update `src/hooks/useStats.ts`. Read the full file. `totalAttempts` is currently hardcoded to 0.

After fetching `quizIds`, add a real count query:
```ts
let attemptCount = 0;

if (quizIds.length > 0) {
  const { count } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .in("quiz_id", quizIds);

  attemptCount = count || 0;
}

setStats({
  totalQuizzes: quizCount || 0,
  totalQuestions: questionCount,
  totalAttempts: attemptCount,
});
```
---PROMPT---

**Verify:** Take a quiz. Dashboard sidebar "Total Attempts" increments.

---

### COMMIT INT-1E
**Commit:** `feat(ui): apply token system to all dashboard components`

---PROMPT---
Apply the CSS variable token system to every internal component. The goal is that light mode works correctly inside the dashboard. Read each file fully before editing — only change color values, never logic or structure.

Replace hardcoded color classes with inline `style` props using CSS variables, following the same pattern used in the external pages. Key mappings:

- `bg-black` / `bg-[#0A0A0F]` → `backgroundColor: "var(--color-bg)"`
- `bg-white/5`, `bg-white/10` → `backgroundColor: "var(--color-surface)"` or `"var(--color-surface-raised)"`
- `border-white/10`, `border-white/20` → `borderColor: "var(--color-border)"`
- `text-white` → `color: "var(--color-text-primary)"`
- `text-gray-400`, `text-gray-500` → `color: "var(--color-text-secondary)"`
- `bg-white text-black` (primary buttons) → `backgroundColor: "var(--color-accent)"`, `color: "#0A0A0F"` — wait, these are action buttons, keep them as accent-colored. Actually for dashboard primary buttons use `backgroundColor: "var(--color-text-primary)"`, `color: "var(--color-bg)"` so they invert correctly in both themes.
- `text-green-400`, `text-red-400`, `text-blue-400` — keep as-is, these are semantic colors

Files to update (read each one before touching it):
- `src/components/DashboardLayout.tsx`
- `src/components/TopBar.tsx`
- `src/components/SideBar.tsx`
- `src/components/SideBarLink.tsx` (if it exists, check)
- `src/components/StatCard.tsx`
- `src/components/Analytics.tsx`
- `src/components/QuizCard.tsx`
- `src/components/QuizListEmpty.tsx` (if it exists)
- `src/components/QuizListLoading.tsx` (if it exists)
- `src/components/ShareableLink.tsx`
- `src/views/Dashboard.tsx`
- `src/views/Quizzes.tsx`
- `src/views/CreateQuiz.tsx`
- `src/components/quiz-builder/BuilderQuestionCard.tsx`
- `src/components/quiz-builder/QuizBuilder.tsx`
- `src/components/UploadQuestionsForm.tsx`

Do not change `src/components/quiz/` files (TakeQuizClient, QuizResults, etc.) in this commit — those are not dashboard-internal.
---PROMPT---

**Verify:** Toggle to light mode. Dashboard, My Quizzes, and Create Quiz pages are all readable. No pure black backgrounds or pure white text remaining. Primary buttons are legible in both themes.

---

### COMMIT INT-1F
**Commit:** `feat(dashboard): replace placeholder with recent quizzes and quick actions`

---PROMPT---
Rewrite `src/views/Dashboard.tsx`. Read `src/hooks/useQuizzes.ts` and `src/components/QuizCard.tsx` before writing — reuse both.

```tsx
"use client";

import Link from "next/link";
import { useQuizzes } from "../hooks/useQuizzes";
import { useAnalyticsStats } from "../hooks/useStats";
import QuizCard from "../components/QuizCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, TaskEdit01Icon } from "@hugeicons/core-free-icons";

export default function Dashboard() {
  const { quizzes, loading, copyQuizLink, refetch } = useQuizzes();
  const { stats } = useAnalyticsStats();

  const recentQuizzes = quizzes.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--color-text-primary)" }}
          >
            Overview
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Manage your quizzes and track performance.
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
          style={{
            backgroundColor: "var(--color-text-primary)",
            color: "var(--color-bg)",
          }}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          New Quiz
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Quizzes", value: stats.totalQuizzes },
          { label: "Questions", value: stats.totalQuestions },
          { label: "Attempts", value: stats.totalAttempts },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-2xl border space-y-1"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {s.label}
            </p>
            <p
              className="text-3xl font-bold font-mono"
              style={{ color: "var(--color-text-primary)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent quizzes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent quizzes
          </h3>
          <Link
            href="/dashboard/my-quizzes"
            className="text-xs font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            View all →
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl animate-pulse"
                style={{ backgroundColor: "var(--color-surface)" }}
              />
            ))}
          </div>
        )}

        {!loading && recentQuizzes.length === 0 && (
          <div
            className="rounded-2xl border border-dashed p-10 text-center space-y-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <HugeiconsIcon
              icon={TaskEdit01Icon}
              size={28}
              className="mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            />
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No quizzes yet.{" "}
              <Link
                href="/dashboard/create"
                style={{ color: "var(--color-accent)" }}
              >
                Create your first one.
              </Link>
            </p>
          </div>
        )}

        {!loading && recentQuizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onCopyLink={copyQuizLink}
                onRefetch={refetch}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```
---PROMPT---

**Verify:** Dashboard shows stats row and up to 3 recent quizzes. Empty state renders when no quizzes exist. "New Quiz" button navigates to create page.

---

## PR-INTERNAL-1 Description

**Summary**
System-aware theme support (`defaultTheme="system"`, `enableSystem={true}`); `quiz_attempts` table migration and RLS; attempt insertion on quiz completion in `useTakeQuiz`; real `totalAttempts` count in the stats hook; full token system pass on all dashboard components so light mode works correctly throughout; and a real dashboard home replacing the placeholder.

**Changed files**
- `app/layout.tsx`
- `app/globals.css`
- `src/lib/types.ts`
- `src/hooks/useStats.ts`
- `src/hooks/useTakeQuiz.ts`
- `src/components/DashboardLayout.tsx`
- `src/components/TopBar.tsx`
- `src/components/SideBar.tsx`
- `src/components/SideBarLink.tsx`
- `src/components/StatCard.tsx`
- `src/components/Analytics.tsx`
- `src/components/QuizCard.tsx`
- `src/components/QuizListEmpty.tsx`
- `src/components/QuizListLoading.tsx`
- `src/components/ShareableLink.tsx`
- `src/views/Dashboard.tsx`
- `src/views/Quizzes.tsx`
- `src/views/CreateQuiz.tsx`
- `src/components/quiz-builder/BuilderQuestionCard.tsx`
- `src/components/quiz-builder/QuizBuilder.tsx`
- `src/components/UploadQuestionsForm.tsx`

**Checklist**
- [ ] Supabase migration run: `quiz_attempts` table created
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes
- [ ] System light mode renders correctly on all dashboard pages
- [ ] Completing a quiz inserts a row in `quiz_attempts`
- [ ] Dashboard home shows real stats and recent quizzes
- [ ] No `console.log` statements (except existing ones in useStats/useQuizzes)
- [ ] Branch up to date with `main`

---

# PR-INTERNAL-2 — Quiz detail page + CRUD + CSV preview
**Branch:** `feat/quiz-detail-crud`

```bash
git checkout main && git pull
git checkout -b feat/quiz-detail-crud
```

---

### COMMIT INT-2A
**Commit:** `feat(hooks): useQuizDetail hook`

---PROMPT---
Create `src/hooks/useQuizDetail.ts`. This hook is the data layer for the quiz detail page — fetches a single quiz with its questions, exposes edit and delete operations.

```ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { dbToAppQuestion, appToDBQuestion } from "../utils/transforms";
import type {
  QuizDraft,
  AppQuestion,
  QuizVisibility,
  QuizCategory,
  QuizDifficulty,
  QuizAttempt,
} from "../lib/types";

interface QuizDetailState {
  quiz: (QuizDraft & {
    id: string;
    created_at: string;
    visibility: QuizVisibility;
    category: QuizCategory | null;
    difficulty: QuizDifficulty | null;
    times_taken: number;
    average_rating: number | null;
  }) | null;
  questions: AppQuestion[];
  attempts: Pick<QuizAttempt, "score" | "total_points" | "elapsed_seconds" | "completed_at">[];
  loading: boolean;
  error: string | null;
}

export function useQuizDetail(quizId: string) {
  const [state, setState] = useState<QuizDetailState>({
    quiz: null,
    questions: [],
    attempts: [],
    loading: true,
    error: null,
  });
  const [saving, setSaving] = useState(false);

  const fetchQuizDetail = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { data: quizData, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (quizError || !quizData) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Quiz not found",
      }));
      return;
    }

    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    const { data: attemptsData } = await supabase
      .from("quiz_attempts")
      .select("score, total_points, elapsed_seconds, completed_at")
      .eq("quiz_id", quizId)
      .order("completed_at", { ascending: false });

    setState({
      quiz: quizData,
      questions: (questionsData ?? []).map((q, i) => dbToAppQuestion(q, i)),
      attempts: attemptsData ?? [],
      loading: false,
      error: null,
    });
  }, [quizId]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

  // Update quiz metadata
  const updateQuizMeta = async (updates: Partial<Pick<
    QuizDetailState["quiz"] & object,
    "title" | "description" | "time_limit" | "visibility" | "category" | "difficulty"
  >>) => {
    setSaving(true);
    const { error } = await supabase
      .from("quizzes")
      .update(updates)
      .eq("id", quizId);
    setSaving(false);

    if (error) {
      toast.error("Failed to save changes");
      return false;
    }

    setState((prev) => ({
      ...prev,
      quiz: prev.quiz ? { ...prev.quiz, ...updates } : prev.quiz,
    }));
    toast.success("Saved");
    return true;
  };

  // Update a single question
  const updateQuestion = async (question: AppQuestion) => {
    setSaving(true);
    const payload = appToDBQuestion(question);
    const { error } = await supabase
      .from("questions")
      .update(payload)
      .eq("id", question.id);
    setSaving(false);

    if (error) {
      toast.error("Failed to update question");
      return false;
    }

    setState((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === question.id ? question : q
      ),
    }));
    toast.success("Question updated");
    return true;
  };

  // Delete a single question
  const deleteQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      toast.error("Failed to delete question");
      return false;
    }

    setState((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    toast.success("Question deleted");
    return true;
  };

  // Delete the entire quiz
  const deleteQuiz = async () => {
    const { error } = await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId);

    if (error) {
      toast.error("Failed to delete quiz");
      return false;
    }

    toast.success("Quiz deleted");
    return true;
  };

  // Copy shareable link
  const copyLink = () => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  return {
    ...state,
    saving,
    refetch: fetchQuizDetail,
    updateQuizMeta,
    updateQuestion,
    deleteQuestion,
    deleteQuiz,
    copyLink,
  };
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime changes yet.

---

### COMMIT INT-2B
**Commit:** `feat(detail): quiz detail page components`

---PROMPT---
Create the quiz detail page components. All need `"use client"`. Read `src/lib/types.ts`, `src/hooks/useQuizDetail.ts`, and `src/components/quiz-builder/BuilderQuestionCard.tsx` before writing.

**Create `src/components/quiz-detail/MetaEditor.tsx`** — inline edit for quiz metadata. Fields: title, description, time limit (checkbox + number), visibility, category, difficulty. Auto-saves on blur for text fields, immediately on select/checkbox change.

```tsx
"use client";

import { useState } from "react";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type {
  QuizVisibility,
  QuizCategory,
  QuizDifficulty,
} from "../../lib/types";

interface MetaEditorProps {
  title: string;
  description: string;
  timeLimit: number | null;
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  saving: boolean;
  onSave: (updates: Record<string, unknown>) => Promise<boolean>;
}

const VISIBILITY_OPTIONS: { value: QuizVisibility; label: string; desc: string }[] = [
  { value: "private", label: "Private", desc: "Direct link only" },
  { value: "unlisted", label: "Unlisted", desc: "Shareable, not in Quiz Bank" },
  { value: "public", label: "Public", desc: "Listed in Quiz Bank" },
];

export default function MetaEditor({
  title,
  description,
  timeLimit,
  visibility,
  category,
  difficulty,
  saving,
  onSave,
}: MetaEditorProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDesc, setLocalDesc] = useState(description);

  const inputStyle = {
    backgroundColor: "var(--color-surface-raised)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Title
        </label>
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={() => {
            if (localTitle !== title) onSave({ title: localTitle });
          }}
          style={inputStyle}
        />
      </div>

      {/* Description */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Description
        </label>
        <textarea
          value={localDesc}
          onChange={(e) => setLocalDesc(e.target.value)}
          onBlur={() => {
            if (localDesc !== description) onSave({ description: localDesc });
          }}
          rows={3}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      {/* Time limit */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={timeLimit !== null}
            onChange={(e) =>
              onSave({ time_limit: e.target.checked ? 30 : null })
            }
            className="w-4 h-4 rounded"
          />
          <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
            Time limit
          </span>
        </label>
        {timeLimit !== null && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={180}
              value={timeLimit}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 1 && v <= 180)
                  onSave({ time_limit: v });
              }}
              style={{
                ...inputStyle,
                width: "72px",
                padding: "6px 10px",
              }}
            />
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              minutes
            </span>
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label
          className="block text-xs font-medium mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Visibility
        </label>
        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
              style={{
                backgroundColor:
                  visibility === opt.value
                    ? "var(--color-accent-dim)"
                    : "var(--color-surface-raised)",
                border: `1px solid ${
                  visibility === opt.value
                    ? "var(--color-accent)"
                    : "var(--color-border)"
                }`,
              }}
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => onSave({ visibility: opt.value })}
                className="mt-0.5"
              />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color:
                      visibility === opt.value
                        ? "var(--color-accent)"
                        : "var(--color-text-primary)",
                  }}
                >
                  {opt.label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {opt.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Category + Difficulty — only when public */}
      {visibility === "public" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Category
            </label>
            <select
              value={category ?? ""}
              onChange={(e) =>
                onSave({ category: (e.target.value as QuizCategory) || null })
              }
              style={inputStyle}
            >
              <option value="">No category</option>
              {QUIZ_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Difficulty
            </label>
            <select
              value={difficulty ?? ""}
              onChange={(e) =>
                onSave({
                  difficulty: (e.target.value as QuizDifficulty) || null,
                })
              }
              style={inputStyle}
            >
              <option value="">Not specified</option>
              {(["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]).map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      )}

      {saving && (
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Saving...
        </p>
      )}
    </div>
  );
}
```

**Create `src/components/quiz-detail/QuestionEditor.tsx`** — editable question card for the detail page. Shows question in a collapsed read-only state with an expand-to-edit toggle. On expand, shows full edit form. Save and cancel buttons. Delete button with inline confirm.

```tsx
"use client";

import { useState } from "react";
import type { AppQuestion } from "../../lib/types";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

interface QuestionEditorProps {
  question: AppQuestion;
  index: number;
  onSave: (updated: AppQuestion) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function QuestionEditor({
  question,
  index,
  onSave,
  onDelete,
}: QuestionEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<AppQuestion>(question);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(draft);
    setSaving(false);
    if (ok) setExpanded(false);
  };

  const handleCancel = () => {
    setDraft(question);
    setExpanded(false);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete(question.id);
  };

  const cardStyle = {
    backgroundColor: "var(--color-surface)",
    border: `1px solid var(--color-border)`,
    borderRadius: "12px",
    padding: "16px",
  };

  const inputStyle = {
    backgroundColor: "var(--color-surface-raised)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text-primary)",
    borderRadius: "8px",
    padding: "8px 12px",
    width: "100%",
    fontSize: "13px",
    outline: "none",
  };

  return (
    <div style={cardStyle} className="space-y-3">
      {/* Header — always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className="text-xs font-mono mb-1 block"
            style={{ color: "var(--color-accent)" }}
          >
            Q{index + 1}
          </span>
          <p
            className="text-sm font-medium leading-snug line-clamp-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            {question.questionText || (
              <span style={{ color: "var(--color-text-secondary)" }}>
                Untitled question
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => { setExpanded(!expanded); setConfirmDelete(false); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            {expanded ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="text-xs px-3 py-1.5 rounded-lg border transition"
            style={{
              borderColor: confirmDelete ? "rgb(239 68 68 / 0.5)" : "var(--color-border)",
              color: confirmDelete ? "rgb(248 113 113)" : "var(--color-text-secondary)",
              backgroundColor: confirmDelete ? "rgb(239 68 68 / 0.1)" : "transparent",
            }}
          >
            {confirmDelete ? "Confirm delete" : "Delete"}
          </button>
        </div>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
          <textarea
            value={draft.questionText}
            onChange={(e) =>
              setDraft((d) => ({ ...d, questionText: e.target.value }))
            }
            rows={2}
            placeholder="Question text"
            style={{ ...inputStyle, resize: "none" }}
          />

          <div className="grid grid-cols-2 gap-2">
            {OPTION_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-2">
                <button
                  onClick={() => setDraft((d) => ({ ...d, correctIndex: i }))}
                  className="shrink-0 w-6 h-6 rounded-full text-xs font-bold transition flex items-center justify-center"
                  style={{
                    backgroundColor:
                      draft.correctIndex === i
                        ? "var(--color-accent)"
                        : "var(--color-border)",
                    color:
                      draft.correctIndex === i
                        ? "#0A0A0F"
                        : "var(--color-text-secondary)",
                  }}
                >
                  {OPTION_LABELS[i]}
                </button>
                <input
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [key]: e.target.value }))
                  }
                  placeholder={`Option ${OPTION_LABELS[i]}`}
                  style={{ ...inputStyle, flex: 1, padding: "6px 10px" }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Points
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={draft.points}
              onChange={(e) =>
                setDraft((d) => ({ ...d, points: parseInt(e.target.value) || 1 }))
              }
              style={{ ...inputStyle, width: "64px", padding: "4px 8px" }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                backgroundColor: "var(--color-text-primary)",
                color: "var(--color-bg)",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save question"}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-xs border transition"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Create `src/components/quiz-detail/AttemptStats.tsx`** — displays attempt analytics for the quiz owner.

```tsx
"use client";

import type { QuizAttempt } from "../../lib/types";

type AttemptRow = Pick<
  QuizAttempt,
  "score" | "total_points" | "elapsed_seconds" | "completed_at"
>;

interface AttemptStatsProps {
  attempts: AttemptRow[];
}

export default function AttemptStats({ attempts }: AttemptStatsProps) {
  if (attempts.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        No attempts yet.
      </p>
    );
  }

  const avgScore =
    attempts.reduce((sum, a) => sum + (a.score / a.total_points) * 100, 0) /
    attempts.length;

  const avgElapsed =
    attempts
      .filter((a) => a.elapsed_seconds != null)
      .reduce((sum, a) => sum + (a.elapsed_seconds ?? 0), 0) /
    (attempts.filter((a) => a.elapsed_seconds != null).length || 1);

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Attempts", value: attempts.length.toString() },
          { label: "Avg score", value: `${Math.round(avgScore)}%` },
          { label: "Avg time", value: formatTime(avgElapsed) },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl border text-center space-y-1"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              borderColor: "var(--color-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {s.label}
            </p>
            <p
              className="text-xl font-bold font-mono"
              style={{ color: "var(--color-text-primary)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent attempts list */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Recent attempts
        </p>
        {attempts.slice(0, 10).map((a, i) => {
          const pct = Math.round((a.score / a.total_points) * 100);
          return (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-raised)" }}
            >
              <span
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {new Date(a.completed_at).toLocaleDateString()}
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{
                  color:
                    pct >= 70
                      ? "rgb(74 222 128)"
                      : pct >= 50
                      ? "var(--color-accent)"
                      : "rgb(248 113 113)",
                }}
              >
                {pct}% ({a.score}/{a.total_points})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime changes yet — components aren't wired into a page.

---

### COMMIT INT-2C
**Commit:** `feat(detail): quiz detail page and route`

---PROMPT---
Create the quiz detail page. Read `src/hooks/useQuizDetail.ts` and all three components from INT-2B before writing.

**Create `src/views/QuizDetailView.tsx`:**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizDetail } from "../hooks/useQuizDetail";
import MetaEditor from "../components/quiz-detail/MetaEditor";
import QuestionEditor from "../components/quiz-detail/QuestionEditor";
import AttemptStats from "../components/quiz-detail/AttemptStats";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

type Tab = "questions" | "settings" | "stats";

export default function QuizDetailView({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("questions");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    quiz,
    questions,
    attempts,
    loading,
    error,
    saving,
    updateQuizMeta,
    updateQuestion,
    deleteQuestion,
    deleteQuiz,
    copyLink,
  } = useQuizDetail(quizId);

  const handleDeleteQuiz = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const ok = await deleteQuiz();
    if (ok) router.push("/dashboard/my-quizzes");
  };

  if (loading) {
    return (
      <div
        className="min-h-64 flex items-center justify-center text-sm"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Loading...
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {error ?? "Quiz not found"}
        </p>
        <Link
          href="/dashboard/my-quizzes"
          className="text-sm"
          style={{ color: "var(--color-accent)" }}
        >
          ← Back to My Quizzes
        </Link>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "questions", label: `Questions (${questions.length})` },
    { id: "settings", label: "Settings" },
    { id: "stats", label: `Stats (${attempts.length})` },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/my-quizzes"
          className="mt-1 p-1.5 rounded-lg border transition"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
          }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl font-bold leading-tight truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {quiz.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            {quiz.visibility} · Created{" "}
            {new Date(quiz.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <HugeiconsIcon icon={Copy01Icon} size={14} />
            Copy link
          </button>
          <Link
            href={`/quiz/${quizId}`}
            target="_blank"
            className="px-3 py-2 rounded-lg text-xs font-semibold transition"
            style={{
              backgroundColor: "var(--color-text-primary)",
              color: "var(--color-bg)",
            }}
          >
            Preview →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 text-sm font-medium transition border-b-2 -mb-px"
            style={{
              borderColor: tab === t.id ? "var(--color-accent)" : "transparent",
              color:
                tab === t.id
                  ? "var(--color-text-primary)"
                  : "var(--color-text-secondary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "questions" && (
        <div className="space-y-3">
          {questions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No questions yet. Add them from the create page.
            </p>
          )}
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id}
              question={q}
              index={i}
              onSave={updateQuestion}
              onDelete={deleteQuestion}
            />
          ))}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-8">
          <MetaEditor
            title={quiz.title}
            description={quiz.description ?? ""}
            timeLimit={quiz.time_limit ?? null}
            visibility={quiz.visibility}
            category={quiz.category}
            difficulty={quiz.difficulty}
            saving={saving}
            onSave={updateQuizMeta}
          />

          {/* Danger zone */}
          <div
            className="p-5 rounded-xl border space-y-3"
            style={{
              borderColor: "rgb(239 68 68 / 0.3)",
              backgroundColor: "rgb(239 68 68 / 0.05)",
            }}
          >
            <p className="text-sm font-semibold text-red-500">Danger zone</p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Deleting this quiz is permanent. All questions and attempt data
              will be removed.
            </p>
            <button
              onClick={handleDeleteQuiz}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition"
              style={{
                backgroundColor: confirmDelete
                  ? "rgb(239 68 68)"
                  : "rgb(239 68 68 / 0.15)",
                color: confirmDelete ? "#fff" : "rgb(248 113 113)",
              }}
            >
              {confirmDelete ? "Yes, delete forever" : "Delete quiz"}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="ml-2 text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "stats" && <AttemptStats attempts={attempts} />}
    </div>
  );
}
```

**Create `app/dashboard/quiz/[quizId]/page.tsx`:**

```tsx
import QuizDetailView from "../../../../src/views/QuizDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiz Details",
};

export default function QuizDetailPage({
  params,
}: {
  params: { quizId: string };
}) {
  return <QuizDetailView quizId={params.quizId} />;
}
```
---PROMPT---

**Verify:** Navigate to `/dashboard/quiz/[any-valid-quiz-id]`. Three tabs render. Questions tab shows all questions with edit/delete. Settings tab shows editable metadata. Stats tab shows attempt summary. Back button navigates to My Quizzes.

---

### COMMIT INT-2D
**Commit:** `feat(quizcard): add manage link to QuizCard`

---PROMPT---
Update `src/components/QuizCard.tsx`. Read the full file before editing.

Replace the "View" button (which currently links to `/quiz/${quiz.id}` — the public quiz URL) with a "Manage" button that links to `/dashboard/quiz/${quiz.id}`. The public preview link is already available on the detail page.

Change:
```tsx
<Link
  href={`/quiz/${quiz.id}`}
  className="flex-1 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm font-medium"
>
  <HugeiconsIcon icon={EyeIcon} />
  View
</Link>
```

To:
```tsx
<Link
  href={`/dashboard/quiz/${quiz.id}`}
  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
  style={{
    backgroundColor: "var(--color-text-primary)",
    color: "var(--color-bg)",
  }}
>
  Manage
</Link>
```

Also remove the `EyeIcon` import if it is no longer used after this change — check what else imports from `@hugeicons/core-free-icons` in the file before removing.
---PROMPT---

**Verify:** My Quizzes page shows "Manage" button. Clicking it navigates to `/dashboard/quiz/[id]`. Copy Link and Publish buttons still work.

---

### COMMIT INT-2E
**Commit:** `feat(create): CSV question preview before publish`

---PROMPT---
Update `src/components/UploadQuestionsForm.tsx` and `src/views/CreateQuiz.tsx`. Read both files in full before editing.

The goal: after a CSV is parsed successfully via `setQuestionsFromCSV`, show the questions in a scrollable preview list before the publish button. The user can see what was parsed and confirm before committing.

**Update `src/views/CreateQuiz.tsx`** — in the CSV tab section, after `<UploadQuestionsForm>`, add a question preview when `questions.length > 0`:

```tsx
{tab === "csv" && (
  <div className="space-y-4">
    <UploadQuestionsForm
      onFileChange={setQuestionsFromCSV}
      onSubmit={() => uploadQuestions()}
      disabled={!quiz.id}
      isUploading={isUploadingQuestions}
      questionCount={questions.length}
    />

    {/* CSV preview — shown after successful parse */}
    {questions.length > 0 && (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            Preview — {questions.length} question{questions.length !== 1 ? "s" : ""} parsed
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Review before publishing
          </p>
        </div>

        <div
          className="max-h-96 overflow-y-auto space-y-2 rounded-xl border p-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          {questions.map((q, i) => {
            const optionLabels = ["A", "B", "C", "D"] as const;
            const options = [q.optionA, q.optionB, q.optionC, q.optionD];
            return (
              <div
                key={q.id}
                className="p-3 rounded-lg space-y-2"
                style={{ backgroundColor: "var(--color-surface-raised)" }}
              >
                <p
                  className="text-xs font-mono"
                  style={{ color: "var(--color-accent)" }}
                >
                  Q{i + 1} · {q.points}pt{q.points !== 1 ? "s" : ""}
                </p>
                <p
                  className="text-sm font-medium leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {q.questionText}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {options.map((opt, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                      style={{
                        backgroundColor:
                          j === q.correctIndex
                            ? "var(--color-accent-dim)"
                            : "transparent",
                        border: `1px solid ${
                          j === q.correctIndex
                            ? "var(--color-accent)"
                            : "var(--color-border)"
                        }`,
                        color:
                          j === q.correctIndex
                            ? "var(--color-accent)"
                            : "var(--color-text-secondary)",
                      }}
                    >
                      <span className="font-mono font-bold shrink-0">
                        {optionLabels[j]}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
)}
```

No changes to `UploadQuestionsForm.tsx` itself — the preview is in the parent view.
---PROMPT---

**Verify:** On the Create Quiz page, switch to "Upload CSV" tab. Upload a valid CSV. After parsing, a scrollable preview shows all questions with their options, correct answer highlighted in amber. The Publish Quiz button in `UploadQuestionsForm` remains the action to actually save.

---

## PR-INTERNAL-2 Description

**Summary**
Quiz detail page at `/dashboard/quiz/[quizId]` with three tabs: Questions (edit/delete each question inline), Settings (edit metadata, visibility, time limit, category/difficulty, delete quiz with confirm), and Stats (attempt count, avg score, avg time, recent attempts list). `useQuizDetail` hook handling all data fetching and mutations. CSV question preview before publish on the create page. "View" button on QuizCard replaced with "Manage" linking to the detail page.

**New files**
- `src/hooks/useQuizDetail.ts`
- `src/components/quiz-detail/MetaEditor.tsx`
- `src/components/quiz-detail/QuestionEditor.tsx`
- `src/components/quiz-detail/AttemptStats.tsx`
- `src/views/QuizDetailView.tsx`
- `app/dashboard/quiz/[quizId]/page.tsx`

**Changed files**
- `src/components/QuizCard.tsx`
- `src/views/CreateQuiz.tsx`

**Checklist**
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes
- [ ] Quiz detail page loads with all three tabs working
- [ ] Editing question title/options saves to Supabase on "Save question"
- [ ] Deleting a question requires confirm then removes from list
- [ ] Editing metadata saves on blur/change
- [ ] Delete quiz navigates back to My Quizzes
- [ ] CSV preview shows parsed questions with amber correct answer highlight
- [ ] Manage button on QuizCard navigates to detail page
- [ ] Light mode works correctly on detail page
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`
