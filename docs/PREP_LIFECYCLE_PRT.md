# PREP — Quiz Lifecycle PRT
**Branch:** `feat/quiz-lifecycle`

```bash
git checkout main && git pull
git checkout -b feat/quiz-lifecycle
```

> Apply the migration `supabase/migrations/20260729000000_add_quiz_lifecycle.sql` in the Supabase dashboard first.

---

## COMMIT LC-1 — Schema migration
**Commit:** `feat(db): quiz lifecycle status column and updated RLS`

---PROMPT---
Run this SQL in the Supabase dashboard before any code changes.

```sql
-- 1. Add status column
alter table quizzes
  add column status text not null default 'draft'
  check (status in ('draft', 'published'));

-- 2. Mark existing quizzes as published
-- (all existing quizzes with a code are already live)
update quizzes set status = 'published' where code is not null;

-- 3. Drop unlisted from visibility constraint and data
update quizzes set visibility = 'private' where visibility = 'unlisted';

alter table quizzes drop constraint if exists quizzes_visibility_check;
alter table quizzes
  add constraint quizzes_visibility_check
  check (visibility in ('private', 'public'));

-- 4. Null out codes on draft quizzes
-- (drafts should not have an active code)
update quizzes set code = null where status = 'draft';

-- 5. Update RLS: draft quizzes are NOT publicly readable
drop policy if exists "Anyone can read quizzes" on quizzes;

create policy "Anyone can read published quizzes"
  on quizzes for select
  using (
    status = 'published'
    or auth.uid() = created_by
  );
```

After running, verify in the Supabase table editor:
- `quizzes` has a `status` column with values `draft` or `published`
- No rows have `visibility = 'unlisted'`
- Draft quizzes have `code = null`

No code changes in this commit — types only.

**Update `src/lib/types.ts`:**

Add `QuizStatus` type and update `QuizDraft` and `QuizVisibility`:

```ts
export type QuizStatus = "draft" | "published";

// Remove 'unlisted' from QuizVisibility
export type QuizVisibility = "private" | "public";
```

Update `QuizDraft` to include status:
```ts
export interface QuizDraft {
  id?: string;
  title: string;
  description: string;
  time_limit?: number | null;
  visibility?: QuizVisibility;
  category?: QuizCategory | null;
  difficulty?: QuizDifficulty | null;
  times_taken?: number;
  average_rating?: number | null;
  status?: QuizStatus;
  code?: string | null;
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime changes yet.

---

## COMMIT LC-2 — Update useCreateQuiz
**Commit:** `feat(lifecycle): useCreateQuiz draft/publish split`

---PROMPT---
Rewrite `src/hooks/useCreateQuiz.ts`. Read the current file in full before writing.

Key changes:
1. `createQuiz` no longer generates a code — draft quizzes have no code
2. New `saveAsDraft(questions)` — saves questions, keeps status as draft, no link or code generated
3. New `publishQuiz(questions, publishSettings)` — saves questions, sets status to published, generates code, generates link
4. Remove `loadSavedQuizMeta` — Create Quiz page always starts fresh (no localStorage restoration)
5. Keep `QUIZ_META_KEY` removal on publish/reset — clear any stale data

```ts
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { parseAndValidateCSV } from "../utils/csvParser";
import { appToDBQuestion } from "../utils/transforms";
import type {
  QuizDraft,
  MCQRow,
  AppQuestion,
  QuizVisibility,
  QuizCategory,
  QuizDifficulty,
} from "../lib/types";

const QUIZ_META_KEY = "quiz_meta_draft";
const BUILDER_DRAFT_KEY = "quiz_builder_draft";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function insertWithCodeRetry(payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("quizzes")
    .insert(payload)
    .select()
    .single();

  if (
    error?.message?.includes("duplicate key") ||
    error?.message?.includes("idx_quizzes_code")
  ) {
    const retry = await supabase
      .from("quizzes")
      .insert({ ...payload, code: generateCode() })
      .select()
      .single();
    return retry;
  }

  return { data, error };
}

interface PublishSettings {
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
}

interface CreateQuizState {
  quiz: QuizDraft;
  questions: AppQuestion[];
  shareableLink: string | null;
  quizCode: string | null;
  isCreatingQuiz: boolean;
  isUploadingQuestions: boolean;
  timeLimit: number | null;
}

export function useCreateQuiz() {
  const [state, setState] = useState<CreateQuizState>({
    // Always start fresh — no localStorage restoration
    quiz: { title: "", description: "" },
    questions: [],
    shareableLink: null,
    quizCode: null,
    isCreatingQuiz: false,
    isUploadingQuestions: false,
    timeLimit: null,
  });

  const setTitle = (title: string) =>
    setState((prev) => ({ ...prev, quiz: { ...prev.quiz, title } }));

  const setDescription = (description: string) =>
    setState((prev) => ({ ...prev, quiz: { ...prev.quiz, description } }));

  const setTimeLimit = (timeLimit: number | null) =>
    setState((prev) => ({ ...prev, timeLimit }));

  const updateQuizMeta = (updates: Partial<QuizDraft>) =>
    setState((prev) => ({ ...prev, quiz: { ...prev.quiz, ...updates } }));

  // Step 1: create the quiz row in draft state (no code, no link)
  const createQuiz = async () => {
    if (!state.quiz.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    setState((prev) => ({ ...prev, isCreatingQuiz: true }));

    const { data: userData, error: userError } =
      await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      toast.error("You must be logged in to create a quiz");
      setState((prev) => ({ ...prev, isCreatingQuiz: false }));
      return;
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert({
        title: state.quiz.title,
        description: state.quiz.description,
        created_by: userData.user.id,
        time_limit: state.timeLimit,
        status: "draft",
        code: null,
      })
      .select()
      .single();

    setState((prev) => ({ ...prev, isCreatingQuiz: false }));

    if (error || !data?.id) {
      toast.error("Failed to create quiz");
      return;
    }

    setState((prev) => ({
      ...prev,
      quiz: { ...prev.quiz, id: data.id, status: "draft" },
    }));
    toast.success("Quiz created! Add your questions.");
  };

  const setQuestionsFromCSV = async (file: File) => {
    const result = await parseAndValidateCSV(file);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    const parsed: AppQuestion[] = result.data.map(
      (row: MCQRow, i: number) => ({
        id: `temp-${i}`,
        quizId: state.quiz.id ?? "",
        questionText: row.Question.trim(),
        optionA: row.Option_A.trim(),
        optionB: row.Option_B.trim(),
        optionC: row.Option_C.trim(),
        optionD: row.Option_D.trim(),
        correctIndex: ["A", "B", "C", "D"].indexOf(
          row.Correct_Answer.trim().toUpperCase()
        ) as 0 | 1 | 2 | 3,
        points: parseInt(row.Points) || 1,
        order: i,
      })
    );
    setState((prev) => ({ ...prev, questions: parsed }));
    toast.success(`${parsed.length} questions loaded`);
  };

  // Shared helper: insert questions into Supabase
  async function insertQuestions(
    questions: AppQuestion[],
    quizId: string
  ): Promise<boolean> {
    const payload = questions.map((q) => ({
      ...appToDBQuestion(q),
      quiz_id: quizId,
    }));
    const { error } = await supabase.from("questions").insert(payload);
    if (error) {
      toast.error(`Failed to save questions: ${error.message}`);
      return false;
    }
    return true;
  }

  // Save questions without publishing — quiz stays as draft
  const saveAsDraft = async (
    questionsOverride?: AppQuestion[]
  ): Promise<boolean> => {
    const toSave = questionsOverride ?? state.questions;
    if (!state.quiz.id || toSave.length === 0) {
      toast.error("Quiz ID missing or no questions to save");
      return false;
    }
    setState((prev) => ({ ...prev, isUploadingQuestions: true }));
    const ok = await insertQuestions(toSave, state.quiz.id);
    setState((prev) => ({ ...prev, isUploadingQuestions: false }));
    if (ok) {
      toast.success("Saved as draft");
      try {
        localStorage.removeItem(BUILDER_DRAFT_KEY);
      } catch {}
    }
    return ok;
  };

  // Publish: save questions + set status=published + generate code + link
  const publishQuiz = async (
    questionsOverride?: AppQuestion[],
    settings?: PublishSettings
  ): Promise<boolean> => {
    const toPublish = questionsOverride ?? state.questions;
    if (!state.quiz.id || toPublish.length === 0) {
      toast.error("Quiz ID missing or no questions to publish");
      return false;
    }
    setState((prev) => ({ ...prev, isUploadingQuestions: true }));

    // Save questions first
    const questionsOk = await insertQuestions(toPublish, state.quiz.id);
    if (!questionsOk) {
      setState((prev) => ({ ...prev, isUploadingQuestions: false }));
      return false;
    }

    // Generate code and set status to published
    const code = generateCode();
    const { data: updated, error: publishError } = await supabase
      .from("quizzes")
      .update({
        status: "published",
        code,
        visibility: settings?.visibility ?? "private",
        category: settings?.category ?? null,
        difficulty: settings?.difficulty ?? null,
      })
      .eq("id", state.quiz.id)
      .select()
      .single();

    setState((prev) => ({ ...prev, isUploadingQuestions: false }));

    if (publishError || !updated) {
      toast.error("Failed to publish quiz");
      return false;
    }

    const quizLink = `${window.location.origin}/quiz/${state.quiz.id}`;
    try {
      localStorage.removeItem(QUIZ_META_KEY);
      localStorage.removeItem(BUILDER_DRAFT_KEY);
    } catch {}

    setState((prev) => ({
      ...prev,
      shareableLink: quizLink,
      quizCode: updated.code,
      quiz: { ...prev.quiz, status: "published", code: updated.code },
    }));

    try {
      await navigator.clipboard.writeText(quizLink);
      toast.success("Quiz published! Link copied to clipboard.");
    } catch {
      toast.success("Quiz published!");
    }

    return true;
  };

  // Legacy alias — used by QuizBuilder's onSubmit prop
  // Defaults to publishQuiz for backwards compatibility
  const uploadQuestions = publishQuiz;

  const reset = () => {
    try {
      localStorage.removeItem(QUIZ_META_KEY);
      localStorage.removeItem(BUILDER_DRAFT_KEY);
    } catch {}
    setState({
      quiz: { title: "", description: "" },
      questions: [],
      shareableLink: null,
      quizCode: null,
      isCreatingQuiz: false,
      isUploadingQuestions: false,
      timeLimit: null,
    });
  };

  return {
    ...state,
    setTitle,
    setDescription,
    setTimeLimit,
    updateQuizMeta,
    createQuiz,
    setQuestionsFromCSV,
    saveAsDraft,
    publishQuiz,
    uploadQuestions,
    reset,
  };
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime test needed yet — UI wiring comes next.

---

## COMMIT LC-3 — Update CreateQuiz view
**Commit:** `feat(lifecycle): create quiz view with save as draft and publish`

---PROMPT---
Rewrite `src/views/CreateQuiz.tsx`. Read the current file in full before writing. Key changes:

1. Always starts fresh — no quiz restored from localStorage on mount
2. After questions are loaded (builder or CSV), show two buttons: "Save as Draft" and "Publish"
3. "Publish" opens a publish settings modal (visibility, category, difficulty) then calls `publishQuiz`
4. "Save as Draft" calls `saveAsDraft` and shows success
5. Remove the standalone "Publish Settings" button at the bottom
6. Show `shareableLink` and `quizCode` after publishing
7. Accept optional `?resume=[quizId]` search param for resuming a draft (read from `useSearchParams`)

```tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";
import QuizMetadataForm from "../components/create-quiz/QuizMetadataForm";
import CreateQuizTabs from "../components/create-quiz/CreateQuizTabs";
import PublishSettingsModal from "../components/quiz-bank/PublishSettingsModal";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../lib/types";

type Tab = "build" | "csv";

interface PublishSettings {
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
}

export default function CreateQuizCSV() {
  const [tab, setTab] = useState<Tab>("build");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<
    Parameters<typeof publishQuiz>[0] | undefined
  >(undefined);

  const {
    quiz,
    questions,
    shareableLink,
    quizCode,
    isCreatingQuiz,
    isUploadingQuestions,
    setTitle,
    setDescription,
    timeLimit,
    setTimeLimit,
    createQuiz,
    setQuestionsFromCSV,
    saveAsDraft,
    publishQuiz,
    updateQuizMeta,
  } = useCreateQuiz();

  const handleTabSwitch = (next: Tab) => {
    if (next === "csv") {
      try { localStorage.removeItem("quiz_builder_draft"); } catch {}
    }
    setTab(next);
  };

  // Called when user clicks "Publish" from builder or CSV
  const handlePublishClick = (questionsOverride?: Parameters<typeof publishQuiz>[0]) => {
    setPendingQuestions(questionsOverride);
    setIsPublishModalOpen(true);
  };

  // Called after user confirms settings in the modal
  const handlePublishConfirm = async (settings: PublishSettings) => {
    setIsPublishModalOpen(false);
    await publishQuiz(pendingQuestions, settings);
    setPendingQuestions(undefined);
  };

  const statCardStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="backdrop-blur-sm border rounded-xl p-4 text-center" style={statCardStyle}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Quiz Status</p>
            <p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {quiz.status === "published"
                ? "Published"
                : quiz.id
                ? "Draft"
                : "Not Created"}
            </p>
          </div>
          <div className="backdrop-blur-sm border rounded-xl p-4 text-center" style={statCardStyle}>
            <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Total Questions</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {questions.length}
            </p>
          </div>
        </div>

        {/* Main card */}
        <div
          className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl space-y-6"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <QuizMetadataForm
            title={quiz.title}
            description={quiz.description}
            timeLimit={timeLimit}
            quizId={quiz.id}
            isCreatingQuiz={isCreatingQuiz}
            setTitle={setTitle}
            setDescription={setDescription}
            setTimeLimit={setTimeLimit}
            createQuiz={createQuiz}
          />

          {quiz.id && quiz.status !== "published" && (
            <>
              <CreateQuizTabs activeTab={tab} onTabSwitch={handleTabSwitch} />

              {tab === "build" && (
                <QuizBuilder
                  quizId={quiz.id}
                  onSaveAsDraft={saveAsDraft}
                  onPublish={(qs) => handlePublishClick(qs)}
                  isUploading={isUploadingQuestions}
                />
              )}

              {tab === "csv" && (
                <div className="space-y-4">
                  <UploadQuestionsForm
                    onFileChange={setQuestionsFromCSV}
                    disabled={!quiz.id}
                    isUploading={isUploadingQuestions}
                    questionCount={questions.length}
                  />

                  {questions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          Preview — {questions.length} question{questions.length !== 1 ? "s" : ""} parsed
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          Review before saving
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
                              <p className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
                                Q{i + 1} · {q.points}pt{q.points !== 1 ? "s" : ""}
                              </p>
                              <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>
                                {q.questionText}
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {options.map((opt, j) => (
                                  <div
                                    key={j}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                                    style={{
                                      backgroundColor: j === q.correctIndex ? "var(--color-accent-dim)" : "transparent",
                                      border: `1px solid ${j === q.correctIndex ? "var(--color-accent)" : "var(--color-border)"}`,
                                      color: j === q.correctIndex ? "var(--color-accent)" : "var(--color-text-secondary)",
                                    }}
                                  >
                                    <span className="font-mono font-bold shrink-0">{optionLabels[j]}</span>
                                    <span className="min-w-0 flex-1 truncate">{opt}</span>
                                    {j === q.correctIndex && <span className="shrink-0 font-semibold">✓</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Two action buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => saveAsDraft()}
                          disabled={isUploadingQuestions}
                          className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition"
                          style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {isUploadingQuestions ? "Saving..." : "Save as Draft"}
                        </button>
                        <button
                          onClick={() => handlePublishClick()}
                          disabled={isUploadingQuestions}
                          className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition"
                          style={{
                            backgroundColor: "var(--color-accent)",
                            color: "#0A0A0F",
                          }}
                        >
                          Publish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {shareableLink && quizCode && (
            <ShareableLink shareableLink={shareableLink} quizCode={quizCode} />
          )}
        </div>
      </div>

      <PublishSettingsModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        isLoading={isUploadingQuestions}
      />
    </div>
  );
}
```

**Update `src/components/quiz-builder/QuizBuilder.tsx`** — replace the single `onSubmit` prop with `onSaveAsDraft` and `onPublish`. Read the current file before editing. Change the button row at the bottom from one "Publish Quiz" button to two buttons:

```tsx
// Replace the onSubmit prop with:
interface QuizBuilderProps {
  quizId: string | undefined;
  onSaveAsDraft: (questions: AppQuestion[]) => Promise<boolean>;
  onPublish: (questions: AppQuestion[]) => void;
  isUploading: boolean;
}

// Replace the handleSubmit function:
const handleSaveAsDraft = async () => {
  const errs = validateQuizForSubmit(questions);
  setErrors(errs);
  if (errs.size > 0) return;
  const ok = await onSaveAsDraft(questions);
  if (ok) localStorage.removeItem(DRAFT_KEY);
};

const handlePublish = () => {
  const errs = validateQuizForSubmit(questions);
  setErrors(errs);
  if (errs.size > 0) return;
  onPublish(questions);
};

// Replace the button row:
<div className="flex gap-3">
  <button onClick={addQuestion} className="...">+ Add Question</button>
  <button
    onClick={handleSaveAsDraft}
    disabled={isUploading || !quizId}
    className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition"
    style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
  >
    {isUploading ? "Saving..." : "Save as Draft"}
  </button>
  <button
    onClick={handlePublish}
    disabled={isUploading || !quizId}
    className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition"
    style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
  >
    Publish
  </button>
</div>
```

**Create `src/components/quiz-bank/PublishSettingsModal.tsx`** — a new lightweight modal that only handles visibility/category/difficulty selection. It does NOT call `usePublishQuiz` — it just collects settings and calls `onConfirm`. This separates the UI from the DB call which now happens in `publishQuiz` inside `useCreateQuiz`.

```tsx
"use client";

import { useState } from "react";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../../lib/types";

interface PublishSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: {
    visibility: QuizVisibility;
    category: QuizCategory | null;
    difficulty: QuizDifficulty | null;
  }) => void;
  isLoading: boolean;
}

export default function PublishSettingsModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: PublishSettingsModalProps) {
  const [visibility, setVisibility] = useState<QuizVisibility>("private");
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 transition"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ✕
        </button>

        <div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
            Publish Quiz
          </h3>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Choose who can find your quiz.
          </p>
        </div>

        <div className="space-y-2">
          {[
            { value: "private" as QuizVisibility, label: "Private", desc: "Accessible via link only. Not in Quiz Bank." },
            { value: "public" as QuizVisibility, label: "Public", desc: "Listed in the Quiz Bank for anyone to discover." },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition"
              style={{
                backgroundColor: visibility === opt.value ? "var(--color-accent-dim)" : "var(--color-surface-raised)",
                border: `1px solid ${visibility === opt.value ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              <input
                type="radio"
                name="pub-visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium" style={{ color: visibility === opt.value ? "var(--color-accent)" : "var(--color-text-primary)" }}>
                  {opt.label}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {visibility === "public" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Category
              </label>
              <select
                value={category ?? ""}
                onChange={(e) => setCategory((e.target.value as QuizCategory) || null)}
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  width: "100%",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="">No category</option>
                {QUIZ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Difficulty
              </label>
              <select
                value={difficulty ?? ""}
                onChange={(e) => setDifficulty((e.target.value as QuizDifficulty) || null)}
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  width: "100%",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="">Not specified</option>
                {(["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border text-sm font-medium transition"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ visibility, category, difficulty })}
            disabled={isLoading}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F", opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Update `src/components/ShareableLink.tsx`** — add `quizCode` prop to show both the link and the short code after publishing. Read the current file before editing. Add a `quizCode?: string` prop. If `quizCode` is provided, show a second row below the link: "Share code:" with the code in a mono font and a copy button.
---PROMPT---

**Verify:** Create a new quiz — always starts with blank title/description. After creating, add questions via builder. "Save as Draft" saves without showing a link. "Publish" opens the settings modal then publishes. After publishing, shareable link and quiz code both show.

---

## COMMIT LC-4 — Update useQuizzes to separate drafts and published
**Commit:** `feat(lifecycle): useQuizzes returns drafts and published separately`

---PROMPT---
Update `src/hooks/useQuizzes.ts`. Read the current file in full before editing.

The `fetchUserQuizzes` function and return shape change. Split into two arrays:

```ts
interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: "draft" | "published";
  visibility?: QuizVisibility;
  category?: QuizCategory | null;
  difficulty?: QuizDifficulty | null;
  times_taken?: number;
  average_rating?: number | null;
  code?: string | null;
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

  const { data: allQuizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchUserQuizzes,
  });

  const drafts = allQuizzes.filter((q) => q.status === "draft");
  const published = allQuizzes.filter((q) => q.status === "published");

  // ... rest of hook unchanged, return both:
  return {
    quizzes: allQuizzes,      // keep for Dashboard (recent quizzes)
    drafts,
    published,
    loading,
    error,
    copyQuizLink,
    deleteQuiz,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
  };
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes.

---

## COMMIT LC-5 — Update Quizzes view with draft/published sections
**Commit:** `feat(lifecycle): my quizzes page with draft and published sections`

---PROMPT---
Rewrite `src/views/Quizzes.tsx`. Read the current file and `src/components/QuizCard.tsx` before writing.

```tsx
"use client";

import Link from "next/link";
import { useQuizzes } from "../hooks/useQuizzes";
import QuizCard from "../components/QuizCard";
import DraftQuizCard from "../components/DraftQuizCard";
import QuizListLoading from "../components/QuizListLoading";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default function Quizzes() {
  const { drafts, published, loading, copyQuizLink, refetch } = useQuizzes();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
            My Quizzes
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Manage and share your quizzes
          </p>
        </div>
        <Link
          href="/dashboard/create"
          className="flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold"
          style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
        >
          <HugeiconsIcon icon={PlusSignIcon} />
          Create New Quiz
        </Link>
      </div>

      {loading ? (
        <QuizListLoading />
      ) : (
        <>
          {/* Drafts section */}
          {drafts.length > 0 && (
            <div>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Drafts ({drafts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drafts.map((quiz) => (
                  <DraftQuizCard key={quiz.id} quiz={quiz} onRefetch={refetch} />
                ))}
              </div>
            </div>
          )}

          {/* Published section */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Published ({published.length})
            </h3>
            {published.length === 0 ? (
              <div
                className="rounded-2xl border border-dashed p-10 text-center"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  No published quizzes yet.{" "}
                  <Link href="/dashboard/create" style={{ color: "var(--color-accent)" }}>
                    Create one.
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {published.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} onCopyLink={copyQuizLink} onRefetch={refetch} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

**Create `src/components/DraftQuizCard.tsx`** — a simpler card for draft quizzes. No copy link, no visibility badge, no stats. Just title, description, date, question count (0 if none yet), and two actions: "Continue" and "Delete".

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface DraftQuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    created_at: string;
  };
  onRefetch?: () => void;
}

export default function DraftQuizCard({ quiz, onRefetch }: DraftQuizCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from("quizzes").delete().eq("id", quiz.id);
    setDeleting(false);
    if (error) {
      toast.error("Failed to delete draft");
      return;
    }
    toast.success("Draft deleted");
    onRefetch?.();
  };

  return (
    <div
      className="border rounded-2xl p-6 space-y-4"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
        borderStyle: "dashed",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="text-base font-semibold leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {quiz.title || "Untitled draft"}
        </h3>
        <span
          className="shrink-0 text-xs font-medium px-2 py-0.5 rounded border"
          style={{
            color: "var(--color-text-secondary)",
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-surface-raised)",
          }}
        >
          Draft
        </span>
      </div>

      {quiz.description && (
        <p className="text-sm line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
          {quiz.description}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
        <HugeiconsIcon icon={Calendar02Icon} size={14} />
        <span>{new Date(quiz.created_at).toLocaleDateString("en-CA")}</span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dashboard/create?resume=${quiz.id}`}
          className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-center transition"
          style={{
            backgroundColor: "var(--color-text-primary)",
            color: "var(--color-bg)",
          }}
        >
          Continue
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-lg text-sm font-medium transition border"
          style={{
            borderColor: confirmDelete ? "rgb(239 68 68 / 0.5)" : "var(--color-border)",
            color: confirmDelete ? "rgb(248 113 113)" : "var(--color-text-secondary)",
            backgroundColor: confirmDelete ? "rgb(239 68 68 / 0.1)" : "transparent",
          }}
        >
          {deleting ? "..." : confirmDelete ? "Confirm" : "Delete"}
        </button>
      </div>
    </div>
  );
}
```
---PROMPT---

**Verify:** My Quizzes shows two sections. Drafts appear with dashed border and "Continue"/"Delete" actions. Published quizzes appear with the full QuizCard. "Continue" links to `/dashboard/create?resume=[id]`.

---

## COMMIT LC-6 — Update QuizCard for published quizzes
**Commit:** `feat(lifecycle): QuizCard unpublish action and code display`

---PROMPT---
Update `src/components/QuizCard.tsx`. Read the current file in full before editing.

Changes:
1. Add `quiz.code` to the props interface and show it in the card
2. Replace the "Publish" button with "Unpublish"
3. "Unpublish" calls a new `unpublishQuiz` function — sets `status: 'draft'`, `code: null`, `visibility: 'private'`
4. Remove `unlisted` from `VISIBILITY_COLORS`
5. Add `quiz.status` to the props interface

```tsx
// Add to QuizCardProps:
quiz: {
  // ... existing fields
  status?: "draft" | "published";
  code?: string | null;
};

// Add unpublish handler:
const [unpublishing, setUnpublishing] = useState(false);
const [confirmUnpublish, setConfirmUnpublish] = useState(false);

const handleUnpublish = async () => {
  if (!confirmUnpublish) {
    setConfirmUnpublish(true);
    return;
  }
  setUnpublishing(true);
  const { error } = await supabase
    .from("quizzes")
    .update({ status: "draft", code: null, visibility: "private" })
    .eq("id", quiz.id);
  setUnpublishing(false);
  if (error) {
    toast.error("Failed to unpublish");
    setConfirmUnpublish(false);
    return;
  }
  toast.success("Quiz unpublished and moved to drafts");
  onRefetch?.();
};

// Add code display below the visibility badge:
{quiz.code && (
  <div className="flex items-center gap-2 mt-1">
    <span className="text-xs font-mono font-bold" style={{ color: "var(--color-accent)" }}>
      {quiz.code}
    </span>
    <button
      onClick={() => {
        navigator.clipboard.writeText(quiz.code!);
        toast.success("Code copied!");
      }}
      className="text-xs transition"
      style={{ color: "var(--color-text-secondary)" }}
    >
      Copy code
    </button>
  </div>
)}

// Replace "Publish" button with:
<button
  onClick={handleUnpublish}
  disabled={unpublishing}
  className="px-4 py-2 rounded-lg border text-sm font-medium transition"
  style={{
    borderColor: confirmUnpublish ? "rgb(239 68 68 / 0.5)" : "var(--color-border)",
    color: confirmUnpublish ? "rgb(248 113 113)" : "var(--color-text-secondary)",
    backgroundColor: confirmUnpublish ? "rgb(239 68 68 / 0.1)" : "transparent",
  }}
>
  {unpublishing ? "..." : confirmUnpublish ? "Confirm unpublish" : "Unpublish"}
</button>
```

Add `supabase` and `toast` imports at the top since the card now makes direct DB calls for unpublish. Import `useState`.

Remove `PublishModal` import and usage from this file — it is no longer needed here. The QuizCard for published quizzes no longer opens a publish modal.
---PROMPT---

**Verify:** Published quiz cards show the short code and "Copy code" button. "Unpublish" asks for confirmation then moves the quiz to drafts, removes the code, and the card disappears from the Published section and appears in Drafts.

---

## COMMIT LC-7 — Update useQuizDetail with unpublish and republish
**Commit:** `feat(lifecycle): quiz detail unpublish and republish actions`

---PROMPT---
Update `src/hooks/useQuizDetail.ts`. Read the current file in full before editing.

Add two new mutations after the existing `deleteQuizMutation`:

```ts
const unpublishMutation = useMutation({
  mutationFn: async () => {
    const { error } = await supabase
      .from("quizzes")
      .update({ status: "draft", code: null, visibility: "private" })
      .eq("id", quizId);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    toast.success("Quiz unpublished and moved to drafts");
  },
  onError: () => toast.error("Failed to unpublish quiz"),
});

const republishMutation = useMutation({
  mutationFn: async (settings: {
    visibility: "private" | "public";
    category: string | null;
    difficulty: string | null;
  }) => {
    function generateCode(): string {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    }
    const code = generateCode();
    const { error } = await supabase
      .from("quizzes")
      .update({ status: "published", code, ...settings })
      .eq("id", quizId);
    if (error) throw error;
    return code;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    toast.success("Quiz republished with a new link and code");
  },
  onError: () => toast.error("Failed to republish quiz"),
});
```

Add to the return object:
```ts
unpublish: async () => {
  try {
    await unpublishMutation.mutateAsync();
    return true;
  } catch {
    return false;
  }
},
republish: async (settings: Parameters<typeof republishMutation.mutateAsync>[0]) => {
  try {
    const code = await republishMutation.mutateAsync(settings);
    return code;
  } catch {
    return null;
  }
},
```

Also update `QuizDetailView.tsx` — in the Settings tab, add Publish/Unpublish/Republish actions based on `quiz.status`. Read `src/views/QuizDetailView.tsx` before editing.

When `quiz.status === "draft"`:
- Show a "Publish" button that opens `PublishSettingsModal` and calls `republish` on confirm

When `quiz.status === "published"`:
- Show an "Unpublish" button (with confirm) that calls `unpublish`
- Show the current code in a mono display with a copy button
---PROMPT---

**Verify:** On quiz detail settings tab: draft quizzes show a Publish button. Published quizzes show Unpublish and the current code. Unpublishing moves to draft and clears the code. Republishing from the detail page generates a new code and link.

---

## COMMIT LC-8 — Handle unpublished quiz on take quiz page
**Commit:** `feat(lifecycle): handle draft/unpublished quiz on take page`

---PROMPT---
Update `src/components/quiz/TakeQuizClient.tsx`. Read the current file in full before editing.

The `useTakeQuiz` hook now fetches quiz data. After the migration, RLS prevents reading draft quizzes unless you're the creator. There are two cases to handle:

**Case 1: Quiz not found (RLS blocked it — visitor trying to take a draft quiz)**
The `error` state will be "Quiz not found". Update the error display to show a more specific message:

```tsx
{error && (
  <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "var(--color-bg)" }}>
    <div className="text-center space-y-4 max-w-sm">
      <p className="text-4xl">◎</p>
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Quiz unavailable
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        This quiz may have been unpublished by its creator, or the link is no longer valid.
      </p>
      <a
        href="/quiz-bank"
        className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition"
        style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
      >
        Browse Quiz Bank
      </a>
    </div>
  </div>
)}
```

**Case 2: Quiz found but status is draft (creator viewing their own draft)**
After the `quiz` is loaded, check `quiz.status === 'draft'`. If so, show a preview banner at the top:

```tsx
{quiz && quiz.status === "draft" && (
  <div
    className="px-4 py-2 text-center text-xs font-medium"
    style={{
      backgroundColor: "var(--color-accent-dim)",
      color: "var(--color-accent)",
    }}
  >
    Preview mode — this quiz is a draft and not publicly accessible
  </div>
)}
```

Place the banner above the quiz progress bar so it's always visible.
---PROMPT---

**Verify:** Visit a published quiz URL — works normally. Visit a draft quiz URL while logged out — shows "Quiz unavailable" screen. Visit a draft quiz URL while logged in as the creator — shows the preview banner and the quiz is takeable.

---

## PR Description

**Summary**
Full quiz lifecycle implementation. Three states: Draft (no link, no code, not publicly accessible), Published (has link and short code, visibility private or public), Deleted (permanent). Unpublishing invalidates both the link and the short code by setting status back to draft and nulling the code — republishing generates a fresh code. Create Quiz always starts fresh; unfinished quizzes surface in My Quizzes under a Drafts section with a "Continue" link. After uploading questions (either path), two explicit actions: Save as Draft or Publish. Quiz Bank visibility simplified to Private/Public (unlisted removed). RLS updated so draft quizzes are not publicly readable.

**Supabase migrations required (run before any code)**
- `alter table quizzes add column status text not null default 'draft' check (status in ('draft', 'published'))`
- Update existing rows to published where code is not null
- Drop unlisted from visibility constraint
- Update RLS policy to require status = 'published' for public reads

**Changed files**
- `src/lib/types.ts`
- `src/hooks/useCreateQuiz.ts`
- `src/hooks/useQuizzes.ts`
- `src/hooks/useQuizDetail.ts`
- `src/views/CreateQuiz.tsx`
- `src/views/Quizzes.tsx`
- `src/views/QuizDetailView.tsx`
- `src/components/quiz-builder/QuizBuilder.tsx`
- `src/components/QuizCard.tsx`
- `src/components/DraftQuizCard.tsx` (new)
- `src/components/ShareableLink.tsx`
- `src/components/quiz-bank/PublishSettingsModal.tsx` (new)
- `src/components/quiz/TakeQuizClient.tsx`

**Checklist**
- [ ] Supabase migrations run successfully
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes
- [ ] Creating a quiz always starts fresh (no localStorage restoration)
- [ ] Builder and CSV upload show Save as Draft + Publish buttons
- [ ] Published quiz shows link and short code
- [ ] My Quizzes shows Drafts and Published in separate sections
- [ ] Draft cards show Continue (resume) and Delete
- [ ] Unpublish nulls code, sets status to draft, card moves to Drafts
- [ ] Republish generates a new code
- [ ] Draft quiz URL shows "Quiz unavailable" to non-creators
- [ ] Creator visiting their own draft sees preview banner
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`
