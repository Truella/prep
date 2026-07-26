# PREP — Enhancement Agent Prompts (PR-1 to PR-4)

> Next.js App Router project. `app/` holds route files. `src/` holds components, hooks, utils, lib, context.
> All interactive components need `"use client"` at the top. Navigation uses `next/link` and `next/navigation`.
> Paste one `---PROMPT---` block at a time. Verify each step before moving on.
> CodeRabbit reviews each PR — address all flagged issues before merging.

---

# PR-1 — Code Health
**Branch:** `fix/code-health`

```bash
git checkout main && git pull
git checkout -b fix/code-health
```

---

### COMMIT 1-A
**Commit:** `fix(csvParser): case-insensitive whitespace-tolerant Correct_Answer validation`

---PROMPT---
Fix `src/utils/csvParser.ts`. The current `Correct_Answer` check does not trim or uppercase before comparing, so `"a"` or `" B "` fail with a misleading error. The PRD says validation is case-insensitive and whitespace-tolerant — make the code match.

In the row loop, change the emptiness check from:
```ts
if (
  !row.Question ||
  !row.Option_A ||
  !row.Option_B ||
  !row.Option_C ||
  !row.Option_D ||
  !row.Correct_Answer
) {
```
to:
```ts
if (
  !row.Question?.trim() ||
  !row.Option_A?.trim() ||
  !row.Option_B?.trim() ||
  !row.Option_C?.trim() ||
  !row.Option_D?.trim() ||
  !row.Correct_Answer?.trim()
) {
```

Change the `Correct_Answer` validation from:
```ts
if (!["A", "B", "C", "D"].includes(row.Correct_Answer)) {
```
to:
```ts
const answer = row.Correct_Answer?.trim().toUpperCase();
if (!["A", "B", "C", "D"].includes(answer)) {
```

Do not change the function signature, return type, error messages, or overall structure.
---PROMPT---

**Verify:** A CSV with `Correct_Answer` of `"a"`, `" B "`, or `" c "` parses with `success: true`. A CSV with `Correct_Answer: "E"` still returns `success: false`.

---

### COMMIT 1-B
**Commit:** `fix(auth): export AuthContext, split useAuth into own file`

---PROMPT---
`src/context/AuthContext.tsx` already has `"use client"` at the top and already uses `useRouter` from `next/navigation` — this is correct Next.js pattern, do not change it. The issue is that `useAuth` is exported from the same file as `AuthProvider`, which causes a fast-refresh lint warning in Next.js.

Read `src/context/AuthContext.tsx` in full before making any changes. The file currently exports both `AuthProvider` and `useAuth`.

**Change 1:** Make `AuthContext` itself a named export so `useAuth.ts` can import it:
```ts
// Change:
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// To:
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

**Change 2:** Remove `useAuth` from `src/context/AuthContext.tsx` entirely.

**Create `src/hooks/useAuth.ts`:**
```ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = (): import("../context/AuthContext").AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

Wait — `AuthContextType` is not currently exported from `AuthContext.tsx`. Export it:
```ts
// In AuthContext.tsx, change:
interface AuthContextType {
// To:
export interface AuthContextType {
```

**Update all import sites.** Grep for `useAuth` imports across `src/` and update from `"../context/AuthContext"` to `"../hooks/useAuth"`. Adjust the relative path per file depth.
---PROMPT---

**Verify:** `npx next lint` reports zero errors. App boots, sign in and sign out still work.

---

### COMMIT 1-C
**Commit:** `fix(useQuizProgress): wrap saveProgress and clearProgress in useCallback`

---PROMPT---
`src/hooks/useQuizProgress.ts` has stale-closure risk: `saveProgress` and `clearProgress` are recreated on every render and used inside `useEffect` bodies without being in the dependency arrays.

Read the full file before editing. Add `useCallback` to the react import.

**Wrap `saveProgress`** — it closes over `quizId`, `isSubmitted`, `selectedAnswers`, `currentQuestionIndex`. `isHydratedRef` is a ref, do not add it to the dep array:
```ts
const saveProgress = useCallback(() => {
  if (!quizId || isSubmitted) return;
  if (!isHydratedRef.current) return;

  const progress: QuizProgress = {
    answers: selectedAnswers,
    currentIndex: currentQuestionIndex,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save quiz progress:", err);
  }
}, [quizId, isSubmitted, selectedAnswers, currentQuestionIndex]);
```

**Wrap `clearProgress`:**
```ts
const clearProgress = useCallback(() => {
  if (!quizId) return;
  localStorage.removeItem(STORAGE_KEY);
}, [quizId]);
```

**Update the two `useEffect` calls** to include the wrapped functions in their dep arrays:
```ts
useEffect(() => {
  saveProgress();
}, [selectedAnswers, currentQuestionIndex, saveProgress]);

useEffect(() => {
  if (isSubmitted) {
    clearProgress();
  }
}, [isSubmitted, clearProgress]);
```

`markHydrated` mutates a ref only — leave it as a plain function.

Note: `STORAGE_KEY` is derived from `quizId` inside the hook body. Since `quizId` is already in the dep arrays, this is fine.
---PROMPT---

**Verify:** `npx next lint` reports zero warnings for this file. Progress save and restore work end-to-end in the browser.

---

### COMMIT 1-D
**Commit:** `fix(useTakeQuiz): wrap fetchQuizData in useCallback, fix useEffect deps`

---PROMPT---
`src/hooks/useTakeQuiz.ts` has two lint warnings. `fetchQuizData` is defined inside the hook and called in a `useEffect` without being in the dep array. The second `useEffect` (progress restore) omits `loadProgress` and `markHydrated` from its deps.

Read the full file before editing. Add `useCallback` to the react import.

**Wrap `fetchQuizData`** — it closes over `quizId` only:
```ts
const fetchQuizData = useCallback(async () => {
  if (!quizId) return;
  // body is identical to what exists today
}, [quizId]);
```

**Update the first `useEffect`:**
```ts
useEffect(() => {
  if (!quizId) {
    setError("No quiz ID provided");
    setLoading(false);
    return;
  }
  fetchQuizData();
}, [quizId, fetchQuizData]);
```

**Update the second `useEffect`** — after PR-1C lands, `loadProgress` and `markHydrated` are stable refs or `useCallback`-wrapped. Include them:
```ts
useEffect(() => {
  if (!quiz || questions.length === 0) return;

  const saved = loadProgress();

  if (saved && saved.answers) {
    setSelectedAnswers(saved.answers);
    if (saved.currentIndex !== undefined) {
      setCurrentQuestionIndex(saved.currentIndex);
    }
    toast.success("Progress restored!");
  }
  markHydrated();
}, [quiz?.id, questions.length, loadProgress, markHydrated]);
```
---PROMPT---

**Verify:** `npx next lint` reports zero warnings for this file. Quiz loading, progress restore, and scoring all work end-to-end.

---

### COMMIT 1-E
**Commit:** `refactor(types): introduce DBQuestion/AppQuestion and transforms layer`

---PROMPT---
The codebase uses `QuizQuestion` with raw DB column names (`Question`, `Option_A`, `Correct_Answer`) throughout the component layer. Establish an explicit mapping between the DB type and the app-internal type.

**Update `src/lib/types.ts`** — add after the existing exports:

```ts
// Rename QuizQuestion to DBQuestion to make its DB origin explicit.
// Find all usages of QuizQuestion across src/ and update them to DBQuestion.
export interface DBQuestion {
  id: string;
  quiz_id: string;
  Question: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D: string;
  created_at: string;
  Correct_Answer: "A" | "B" | "C" | "D";
  Points: number;
}

// App-internal type — camelCase, correctIndex as number
export interface AppQuestion {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number; // 0–3
  points: number;
  order: number;
}

export interface AIReviewPayload {
  questions: AppQuestion[];
  selectedAnswers: Record<number, number>;
  score: number;
  totalPoints: number;
}
```

Remove the old `QuizQuestion` interface — it is replaced by `DBQuestion`. Grep for `QuizQuestion` across `src/` before deleting and update every import site.

**Create `src/utils/transforms.ts`:**
```ts
import type { DBQuestion, AppQuestion } from "../lib/types";

export function letterToIndex(letter: string): number {
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[letter?.trim().toUpperCase()] ?? -1;
}

export function indexToLetter(index: number): "A" | "B" | "C" | "D" {
  const map: Record<number, "A" | "B" | "C" | "D"> = {
    0: "A",
    1: "B",
    2: "C",
    3: "D",
  };
  return map[index];
}

export function dbToAppQuestion(q: DBQuestion, order: number): AppQuestion {
  return {
    id: q.id,
    quizId: q.quiz_id,
    questionText: q.Question,
    optionA: q.Option_A,
    optionB: q.Option_B,
    optionC: q.Option_C,
    optionD: q.Option_D,
    correctIndex: letterToIndex(q.Correct_Answer),
    points: q.Points,
    order,
  };
}

export function appToDBQuestion(
  q: AppQuestion
): Omit<DBQuestion, "id" | "quiz_id" | "created_at"> & { quiz_id: string } {
  return {
    quiz_id: q.quizId,
    Question: q.questionText,
    Option_A: q.optionA,
    Option_B: q.optionB,
    Option_C: q.optionC,
    Option_D: q.optionD,
    Correct_Answer: indexToLetter(q.correctIndex),
    Points: q.points,
  };
}
```

**Update `src/utils/helpers.ts`** — `letterToIndex` now lives in `transforms.ts`. Re-export it to avoid breaking anything:
```ts
export { letterToIndex } from "./transforms";
```

**Update `src/hooks/useTakeQuiz.ts`:**
- Change `questions` state type from `DBQuestion[]` to `AppQuestion[]`.
- After fetching from Supabase, map: `setQuestions(questionsData.map((q, i) => dbToAppQuestion(q, i)))`.
- In `calculateScore`, change `letterToIndex(q.Correct_Answer)` to `q.correctIndex` — no conversion needed anymore.
- Update the import: remove `letterToIndex` from helpers, import `dbToAppQuestion` from transforms.

**Update `src/components/quiz/QuizResults.tsx`** — update `questions` prop type from `QuizQuestion[]` to `AppQuestion[]`. Update `QuizReview` prop type if it also receives questions (read the file first).

**Update `src/utils/handlers.ts`** — `handleUploadQuestions` builds an insert payload. Currently it maps from `PreviewQuestion[]`. Leave this for PR-1F where the whole file gets replaced.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes with zero errors. `letterToIndex` is called in exactly one place in the codebase (`transforms.ts`). Quiz taking and scoring work end-to-end.

---

### COMMIT 1-F
**Commit:** `refactor(handlers): replace handlers.ts with useCreateQuiz hook`

---PROMPT---
`src/utils/handlers.ts` exports three functions that take `setState` dispatchers as arguments and mix auth checks, DB writes, state mutation, and toasts in one place. Replace with a proper hook.

Read `src/utils/handlers.ts`, `src/views/CreateQuiz.tsx`, `src/components/CreateQuizForm.tsx`, and `src/components/UploadQuestionsForm.tsx` in full before writing anything.

**Create `src/hooks/useCreateQuiz.ts`:**
```ts
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { parseAndValidateCSV } from "../utils/csvParser";
import { appToDBQuestion } from "../utils/transforms";
import type { QuizDraft, MCQRow, AppQuestion } from "../lib/types";

interface CreateQuizState {
  quiz: QuizDraft;
  questions: AppQuestion[];
  shareableLink: string | null;
  isCreatingQuiz: boolean;
  isUploadingQuestions: boolean;
  timeLimit: number | null;
}

export function useCreateQuiz() {
  const [state, setState] = useState<CreateQuizState>({
    quiz: { title: "", description: "" },
    questions: [],
    shareableLink: null,
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

  const createQuiz = async () => {
    if (!state.quiz.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    setState((prev) => ({ ...prev, isCreatingQuiz: true }));

    const { data: userData, error: userError } = await supabase.auth.getUser();
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
      })
      .select()
      .single();

    setState((prev) => ({ ...prev, isCreatingQuiz: false }));

    if (error || !data?.id) {
      toast.error("Failed to create quiz");
      return;
    }

    setState((prev) => ({ ...prev, quiz: { ...prev.quiz, id: data.id } }));
    toast.success("Quiz created! Now upload questions.");
  };

  const setQuestionsFromCSV = async (file: File) => {
    if (file.type !== "text/csv") {
      toast.error("Please upload a valid CSV file");
      return;
    }
    const result = await parseAndValidateCSV(file);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    const parsed: AppQuestion[] = result.data.map((row: MCQRow, i: number) => ({
      id: `temp-${i}`,
      quizId: state.quiz.id ?? "",
      questionText: row.Question.trim(),
      optionA: row.Option_A.trim(),
      optionB: row.Option_B.trim(),
      optionC: row.Option_C.trim(),
      optionD: row.Option_D.trim(),
      correctIndex: ["A", "B", "C", "D"].indexOf(
        row.Correct_Answer.trim().toUpperCase()
      ),
      points: parseInt(row.Points) || 1,
      order: i,
    }));
    setState((prev) => ({ ...prev, questions: parsed }));
    toast.success(`${parsed.length} questions loaded`);
  };

  const uploadQuestions = async (questionsOverride?: AppQuestion[]) => {
    const toUpload = questionsOverride ?? state.questions;
    if (!state.quiz.id || toUpload.length === 0) {
      toast.error("Quiz ID missing or no questions to upload");
      return;
    }
    setState((prev) => ({ ...prev, isUploadingQuestions: true }));

    const payload = toUpload.map((q) => ({
      ...appToDBQuestion(q),
      quiz_id: state.quiz.id,
    }));

    const { error } = await supabase.from("questions").insert(payload);
    setState((prev) => ({ ...prev, isUploadingQuestions: false }));

    if (error) {
      toast.error(`Failed to save questions: ${error.message}`);
      return;
    }

    const quizLink = `${window.location.origin}/quiz/${state.quiz.id}`;
    navigator.clipboard.writeText(quizLink);
    setState((prev) => ({ ...prev, shareableLink: quizLink }));
    toast.success("Quiz published! Link copied to clipboard.");
  };

  const reset = () => {
    setState({
      quiz: { title: "", description: "" },
      questions: [],
      shareableLink: null,
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
    createQuiz,
    setQuestionsFromCSV,
    uploadQuestions,
    reset,
  };
}
```

**Update `src/views/CreateQuiz.tsx`** to use `useCreateQuiz`. Remove all local state and handler imports. The file already has `"use client"` — keep it. Call `useCreateQuiz()` at the top and thread values down to child components.

**Simplify `src/components/CreateQuizForm.tsx`** props to:
```ts
interface CreateQuizFormProps {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isLoading: boolean;
}
```
Remove handler imports. The component only renders inputs and calls the callbacks.

**Simplify `src/components/UploadQuestionsForm.tsx`** props to:
```ts
interface UploadQuestionsFormProps {
  onFileChange: (file: File) => void;
  onSubmit: () => void;
  disabled: boolean;
  isUploading: boolean;
  questionCount: number;
}
```

**Delete `src/utils/handlers.ts`** after confirming no remaining imports.
---PROMPT---

**Verify:** `handlers.ts` does not exist. `npx tsc --noEmit` passes. `npx next lint` passes with zero errors and warnings. CSV quiz creation works end-to-end including the shareable link.

---

## PR-1 Description

**Summary**
Six code health fixes found during grounded gap analysis: CSV parser correctly handles lowercase and whitespace-padded correct answers; `useAuth` split into its own file; `saveProgress` and `clearProgress` wrapped in `useCallback`; `fetchQuizData` wrapped in `useCallback`; `DBQuestion`/`AppQuestion` type layer introduced with `transforms.ts`; and `handlers.ts` replaced by `useCreateQuiz` hook.

**Changed files**
- `src/utils/csvParser.ts`
- `src/context/AuthContext.tsx`
- `src/hooks/useAuth.ts` (new)
- `src/hooks/useQuizProgress.ts`
- `src/hooks/useTakeQuiz.ts`
- `src/lib/types.ts`
- `src/utils/transforms.ts` (new)
- `src/utils/helpers.ts`
- `src/hooks/useCreateQuiz.ts` (new)
- `src/utils/handlers.ts` (deleted)
- `src/views/CreateQuiz.tsx`
- `src/components/CreateQuizForm.tsx`
- `src/components/UploadQuestionsForm.tsx`
- `src/components/quiz/QuizResults.tsx`

**Checklist**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx next lint` passes with zero errors and warnings
- [ ] `handlers.ts` is deleted
- [ ] CSV quiz creation works end-to-end
- [ ] Quiz taking and scoring work end-to-end
- [ ] No `console.log` statements left in code
- [ ] Branch up to date with `main`

---

# PR-2 — Test Baseline
**Branch:** `feat/test-baseline`

```bash
git checkout main && git pull
git checkout -b feat/test-baseline
```

---

### COMMIT 2-A
**Commit:** `chore(test): install Vitest and configure test environment`

---PROMPT---
Install Vitest and configure the test environment. Do not touch any source files.

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

**Create `vitest.config.ts`** at the repo root (Next.js projects keep Vitest config separate from `next.config.ts`):
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

You will also need `@vitejs/plugin-react`:
```bash
npm install -D @vitejs/plugin-react
```

**Add to `package.json` scripts:**
```json
"test": "vitest run",
"test:watch": "vitest",
"coverage": "vitest run --coverage"
```
---PROMPT---

**Verify:** `npm test` runs and exits with code 0 (no test files yet). `npm run coverage` also exits cleanly.

---

### COMMIT 2-B
**Commit:** `test(csvParser): full coverage including PR-1 case/whitespace fixes`

---PROMPT---
Create `src/utils/csvParser.test.ts`. Read `src/utils/csvParser.ts` in full before writing.

PapaParse needs real `File` objects — construct them from strings:
```ts
const makeFile = (content: string) =>
  new File([content], "test.csv", { type: "text/csv" });
```

Valid CSV fixture:
```ts
const VALID_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?,1,2,3,4,D,1
Capital of France?,Berlin,Paris,Rome,Madrid,B,2`;
```

Write these test cases inside `describe("parseAndValidateCSV")`:
```ts
it("parses a valid CSV successfully")
// result.success === true, result.data.length === 2

it("accepts lowercase correct answer")
// Correct_Answer "a" → success: true

it("accepts whitespace-padded correct answer")
// Correct_Answer " B " → success: true

it("rejects an invalid correct answer")
// Correct_Answer "E" → success: false, message contains "Row 1"

it("rejects a CSV missing required columns")
// CSV without Correct_Answer column → success: false, message === "CSV is missing required columns."

it("rejects an empty file")
// Empty string → success: false, message === "No data found in CSV."

it("rejects a row with missing question text")
// Row where Question is empty → success: false, message contains "Row"

it("accepts options with leading/trailing whitespace without failing")
// Options with spaces → success: true
```
---PROMPT---

**Verify:** `npm test` passes all cases. `npm run coverage` shows `csvParser.ts` at 100%.

---

### COMMIT 2-C
**Commit:** `test(transforms): round-trip and mapping coverage`

---PROMPT---
Create `src/utils/transforms.test.ts`. Read `src/utils/transforms.ts` in full before writing.

Use these fixtures:
```ts
import type { DBQuestion, AppQuestion } from "../lib/types";

const DB_Q: DBQuestion = {
  id: "q1",
  quiz_id: "quiz1",
  Question: "What is 2+2?",
  Option_A: "1",
  Option_B: "2",
  Option_C: "3",
  Option_D: "4",
  Correct_Answer: "D",
  Points: 1,
  created_at: "2024-01-01T00:00:00Z",
};

const APP_Q: AppQuestion = {
  id: "q1",
  quizId: "quiz1",
  questionText: "What is 2+2?",
  optionA: "1",
  optionB: "2",
  optionC: "3",
  optionD: "4",
  correctIndex: 3,
  points: 1,
  order: 0,
};
```

Tests:
```ts
describe("letterToIndex", () => {
  it("maps A→0, B→1, C→2, D→3")
  it("returns -1 for unrecognised letter")
  it("handles lowercase input")
})

describe("dbToAppQuestion", () => {
  it("maps all fields correctly including correctIndex 3 for Correct_Answer D")
})

describe("appToDBQuestion", () => {
  it("maps all fields back correctly including Correct_Answer D for correctIndex 3")
})

describe("round-trip", () => {
  it("appToDBQuestion(dbToAppQuestion(q)) matches original DB field values")
  // Compare Question, Option_A-D, Correct_Answer, Points
  // Exclude id, quiz_id, created_at
})
```
---PROMPT---

**Verify:** `npm test` passes. `transforms.ts` at 100% coverage.

---

### COMMIT 2-D
**Commit:** `test(useQuizProgress): save, load, expiry, and hydration guard`

---PROMPT---
Create `src/hooks/useQuizProgress.test.ts`. Read the full hook file before writing.

```ts
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import useQuizProgress from "./useQuizProgress";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
```

The hook signature: `useQuizProgress(quizId, selectedAnswers, currentQuestionIndex, isSubmitted)`.

Tests:
```ts
it("saveProgress writes answers, currentIndex, and timestamp to localStorage after markHydrated")

it("loadProgress returns null when nothing is saved")

it("loadProgress returns null when saved data is older than 24 hours")
// Set Date.now() to past via vi.setSystemTime, save manually, advance time, then call loadProgress

it("loadProgress returns saved answers and currentIndex when fresh")

it("clearProgress removes the storage key")

it("saveProgress does nothing before markHydrated is called")
// Do NOT call markHydrated — trigger a selectedAnswers change — localStorage should stay empty

it("saveProgress does nothing when isSubmitted is true")
// Render with isSubmitted=true, call markHydrated, trigger change — localStorage should stay empty
```

Note: `saveProgress` is triggered by the `useEffect` that watches `selectedAnswers` and `currentQuestionIndex`. To trigger it in tests, rerender the hook with new values via `renderHook`'s `rerender` function.
---PROMPT---

**Verify:** `npm test` passes. `useQuizProgress.ts` above 90% coverage.

---

### COMMIT 2-E
**Commit:** `test(useTakeQuiz): scoring logic and submission state machine`

---PROMPT---
Create `src/hooks/useTakeQuiz.test.ts`. Read the full hook file before writing.

Mock Supabase and toast:
```ts
import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "quiz1", title: "Test Quiz", description: "" },
        error: null,
      }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
```

For scoring tests, the hook fetches and maps `AppQuestion[]` after PR-1E. Mock the questions fetch to return a fixed `AppQuestion[]` array (you'll need to mock both the quiz fetch and the questions fetch separately — read the hook to understand the two Supabase calls).

Tests:
```ts
it("calculateScore returns full points when all answers match correctIndex")
it("calculateScore returns zero when all answers are wrong")
it("calculateScore returns partial score for mixed answers")
it("answeredCount reflects number of selected answers")
it("unansweredCount equals total questions minus answeredCount")
it("initiateSubmit with zero answers calls toast.error and does not set showSubmitModal to true")
it("confirmSubmit sets showResults true and isSubmitted true")
it("cancelSubmit sets showSubmitModal false")
it("resetQuiz clears selectedAnswers, resets currentQuestionIndex to 0, sets showResults false")
```
---PROMPT---

**Verify:** `npm test` passes. `useTakeQuiz.ts` above 85% coverage.

---

## PR-2 Description

**Summary**
Installs Vitest with jsdom and Testing Library, then adds baseline test coverage for `csvParser` (including the PR-1 case/whitespace fixes), `transforms` (full round-trip), `useQuizProgress` (save/load/expiry/guard), and `useTakeQuiz` (scoring and submission state machine).

**Changed files**
- `package.json`
- `vitest.config.ts` (new)
- `src/utils/csvParser.test.ts` (new)
- `src/utils/transforms.test.ts` (new)
- `src/hooks/useQuizProgress.test.ts` (new)
- `src/hooks/useTakeQuiz.test.ts` (new)

**Checklist**
- [ ] `npm test` passes with zero failures
- [ ] `npm run coverage` — `csvParser.ts` and `transforms.ts` at 100%, hooks above 85%
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`

---

# PR-3 — Visual Quiz Builder
**Branch:** `feat/visual-builder`

```bash
git checkout main && git pull
git checkout -b feat/visual-builder
```

---

### COMMIT 3-A
**Commit:** `feat(validation): questionValidation utility`

---PROMPT---
Create `src/utils/questionValidation.ts`. Pure functions only — no side effects, no imports outside `types.ts`.

```ts
import type { AppQuestion } from "../lib/types";

export function validateQuestion(q: AppQuestion): string[] {
  const errors: string[] = [];

  if (!q.questionText.trim()) {
    errors.push("Question text is required");
  }

  const options = [q.optionA, q.optionB, q.optionC, q.optionD];
  const labels = ["Option A", "Option B", "Option C", "Option D"];

  options.forEach((opt, i) => {
    if (!opt.trim()) errors.push(`${labels[i]} is required`);
  });

  const filled = options.filter((o) => o.trim());
  const unique = new Set(filled.map((o) => o.trim()));
  if (filled.length > 1 && unique.size < filled.length) {
    errors.push("Options must be unique");
  }

  if (q.correctIndex < 0 || q.correctIndex > 3) {
    errors.push("Correct answer must be A, B, C, or D");
  }

  return errors;
}

export function validateQuizForSubmit(
  questions: AppQuestion[]
): Map<number, string[]> {
  const errors = new Map<number, string[]>();
  questions.forEach((q, i) => {
    const errs = validateQuestion(q);
    if (errs.length > 0) errors.set(i, errs);
  });
  return errors;
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. (Tests land in 3-E.)

---

### COMMIT 3-B
**Commit:** `feat(builder): BuilderQuestionCard and QuizBuilder components`

---PROMPT---
Create two components. Both need `"use client"` at the top. Read `src/lib/types.ts` and `src/utils/questionValidation.ts` before writing.

**Create `src/components/quiz-builder/BuilderQuestionCard.tsx`:**
```tsx
"use client";

import type { AppQuestion } from "../../lib/types";

interface BuilderQuestionCardProps {
  question: AppQuestion;
  index: number;
  total: number;
  onChange: (updated: AppQuestion) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  errors: string[];
}

export default function BuilderQuestionCard({
  question, index, total, onChange, onDelete, onMoveUp, onMoveDown, errors,
}: BuilderQuestionCardProps) {
  const hasErrors = errors.length > 0;
  const optionLabels = ["A", "B", "C", "D"] as const;
  const options = [question.optionA, question.optionB, question.optionC, question.optionD];

  const handleOptionChange = (i: number, value: string) => {
    const keys = ["optionA", "optionB", "optionC", "optionD"] as const;
    onChange({ ...question, [keys[i]]: value });
  };

  return (
    <div
      className={`backdrop-blur-sm bg-white/5 border rounded-xl p-6 space-y-4 ${
        hasErrors ? "border-red-500/50" : "border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">
          Question {index + 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300 transition text-xs px-2 py-1 rounded border border-red-500/20"
          >
            Delete
          </button>
        </div>
      </div>

      <textarea
        value={question.questionText}
        onChange={(e) => onChange({ ...question, questionText: e.target.value })}
        placeholder="Enter question text"
        rows={2}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none"
      />

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => onChange({ ...question, correctIndex: i })}
              className={`shrink-0 w-7 h-7 rounded-full border text-xs font-bold transition ${
                question.correctIndex === i
                  ? "bg-white text-black border-white"
                  : "border-white/30 text-gray-400 hover:border-white/60"
              }`}
            >
              {optionLabels[i]}
            </button>
            <input
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${optionLabels[i]}`}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400">Points:</label>
        <input
          type="number"
          min={1}
          max={100}
          value={question.points}
          onChange={(e) =>
            onChange({ ...question, points: parseInt(e.target.value) || 1 })
          }
          className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition"
        />
        <span className="text-xs text-gray-500">
          Click a letter to mark the correct answer
        </span>
      </div>

      {hasErrors && (
        <ul className="space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-400">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Create `src/components/quiz-builder/QuizBuilder.tsx`:**
```tsx
"use client";

import { useState, useEffect } from "react";
import { validateQuizForSubmit } from "../../utils/questionValidation";
import BuilderQuestionCard from "./BuilderQuestionCard";
import type { AppQuestion } from "../../lib/types";

const DRAFT_KEY = "quiz_builder_draft";

function blankQuestion(order: number): AppQuestion {
  return {
    id: `draft-${Date.now()}-${order}`,
    quizId: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctIndex: 0,
    points: 1,
    order,
  };
}

interface QuizBuilderProps {
  quizId: string | undefined;
  onSubmit: (questions: AppQuestion[]) => Promise<void>;
  isUploading: boolean;
}

export default function QuizBuilder({
  quizId,
  onSubmit,
  isUploading,
}: QuizBuilderProps) {
  const [questions, setQuestions] = useState<AppQuestion[]>([
    blankQuestion(0),
  ]);
  const [errors, setErrors] = useState<Map<number, string[]>>(new Map());

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setQuestions(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist draft on every change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  const updateQuestion = (index: number, updated: AppQuestion) => {
    const next = [...questions];
    next[index] = updated;
    setQuestions(next);
    setErrors(validateQuizForSubmit(next));
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, blankQuestion(prev.length)]);

  const deleteQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...questions];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setQuestions(next);
  };

  const moveDown = (index: number) => {
    if (index === questions.length - 1) return;
    const next = [...questions];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setQuestions(next);
  };

  const handleSubmit = async () => {
    const errs = validateQuizForSubmit(questions);
    setErrors(errs);
    if (errs.size > 0) return;
    await onSubmit(questions);
    localStorage.removeItem(DRAFT_KEY);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <BuilderQuestionCard
          key={q.id}
          question={q}
          index={i}
          total={questions.length}
          onChange={(updated) => updateQuestion(i, updated)}
          onDelete={() => deleteQuestion(i)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
          errors={errors.get(i) ?? []}
        />
      ))}

      <div className="flex gap-3">
        <button
          onClick={addQuestion}
          className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium text-sm"
        >
          + Add Question
        </button>
        <button
          onClick={handleSubmit}
          disabled={isUploading || !quizId}
          className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isUploading ? "Publishing..." : "Publish Quiz"}
        </button>
      </div>
    </div>
  );
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. Can add, delete, reorder questions. Validation errors appear inline. Refreshing mid-build restores the draft.

---

### COMMIT 3-C
**Commit:** `feat(builder): csvGenerator utility`

---PROMPT---
Create `src/utils/csvGenerator.ts`. Pure function, no side effects, no DOM access.

```ts
import type { AppQuestion } from "../lib/types";
import { indexToLetter } from "./transforms";

function escapeCSVField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCSV(questions: AppQuestion[]): string {
  const header =
    "Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points";
  const rows = questions.map((q) =>
    [
      q.questionText,
      q.optionA,
      q.optionB,
      q.optionC,
      q.optionD,
      indexToLetter(q.correctIndex),
      String(q.points),
    ]
      .map(escapeCSVField)
      .join(",")
  );
  return [header, ...rows].join("\n");
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. (Round-trip test lands in 3-E.)

---

### COMMIT 3-D
**Commit:** `feat(create): tabbed create page with manual builder and CSV upload`

---PROMPT---
Rewrite `src/views/CreateQuiz.tsx` as a tabbed layout. Read the current file in full before writing — preserve the stat cards and `ShareableLink` component. Keep `"use client"` at the top.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";

type Tab = "build" | "csv";

export default function CreateQuizCSV() {
  const [tab, setTab] = useState<Tab>("build");
  const {
    quiz,
    questions,
    shareableLink,
    isCreatingQuiz,
    isUploadingQuestions,
    setTitle,
    setDescription,
    createQuiz,
    setQuestionsFromCSV,
    uploadQuestions,
  } = useCreateQuiz();

  const handleTabSwitch = (next: Tab) => {
    if (next === "csv") localStorage.removeItem("quiz_builder_draft");
    setTab(next);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Quiz Status</p>
            <p className="text-xl font-bold text-white">
              {quiz.id ? "Draft Created" : "Not Created"}
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-white">{questions.length}</p>
          </div>
        </div>

        {/* Main card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Metadata — disabled after quiz created */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                placeholder="Enter quiz title"
                value={quiz.title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!!quiz.id}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter quiz description"
                value={quiz.description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!!quiz.id}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
            {/* TimeLimitInput goes here in PR-4 */}
            {!quiz.id && (
              <button
                onClick={createQuiz}
                disabled={isCreatingQuiz}
                className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isCreatingQuiz ? "Creating..." : "Create Quiz"}
              </button>
            )}
          </div>

          {/* Tabs — only shown after quiz is created */}
          {quiz.id && (
            <>
              <div className="flex gap-2 border-b border-white/10">
                {(["build", "csv"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTabSwitch(t)}
                    className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
                      tab === t
                        ? "text-white border-white"
                        : "text-gray-400 border-transparent hover:text-white"
                    }`}
                  >
                    {t === "build" ? "Build manually" : "Upload CSV"}
                  </button>
                ))}
              </div>

              {tab === "build" && (
                <QuizBuilder
                  quizId={quiz.id}
                  onSubmit={uploadQuestions}
                  isUploading={isUploadingQuestions}
                />
              )}

              {tab === "csv" && (
                <UploadQuestionsForm
                  onFileChange={setQuestionsFromCSV}
                  onSubmit={() => uploadQuestions()}
                  disabled={!quiz.id}
                  isUploading={isUploadingQuestions}
                  questionCount={questions.length}
                />
              )}
            </>
          )}

          {shareableLink && <ShareableLink shareableLink={shareableLink} />}
        </div>
      </div>
    </div>
  );
}
```

**Update `src/components/UploadQuestionsForm.tsx`** to match its new simplified props. Keep `"use client"` if present. Add the "Need help?" link:
```tsx
<p className="mt-2 text-xs text-gray-400">
  Format: Question, Option_A, Option_B, Option_C, Option_D, Correct_Answer, Points.{" "}
  <Link href="/docs/csv-guide" className="underline hover:text-white transition">
    Need help?
  </Link>
</p>
```
Import `Link` from `"next/link"`.
---PROMPT---

**Verify:** Both creation paths produce a working quiz and shareable link. Switching to CSV tab clears the builder draft. `npx tsc --noEmit` passes.

---

### COMMIT 3-E
**Commit:** `test(builder): questionValidation and csvGenerator tests`

---PROMPT---
Create `src/utils/questionValidation.test.ts` and `src/utils/csvGenerator.test.ts`.

**`questionValidation.test.ts`:**
```ts
import { validateQuestion, validateQuizForSubmit } from "./questionValidation";
import type { AppQuestion } from "../lib/types";

const VALID_Q: AppQuestion = {
  id: "1", quizId: "q1", questionText: "What?",
  optionA: "One", optionB: "Two", optionC: "Three", optionD: "Four",
  correctIndex: 0, points: 1, order: 0,
};
```

Test cases:
```ts
it("returns empty array for valid question")
it("returns error for empty questionText")
it("returns error for empty optionA")
it("returns error for duplicate options")
it("returns error for correctIndex of -1")
it("returns error for correctIndex of 4")
it("validateQuizForSubmit returns empty Map for all-valid questions")
it("validateQuizForSubmit returns Map entry for each invalid question")
```

**`csvGenerator.test.ts`** — the key test is the round-trip:
```ts
import { generateCSV } from "./csvGenerator";
import { parseAndValidateCSV } from "./csvParser";
import type { AppQuestion } from "../lib/types";

const QUESTIONS: AppQuestion[] = [
  {
    id: "1", quizId: "q1", questionText: "What is 2+2?",
    optionA: "1", optionB: "2", optionC: "3", optionD: "4",
    correctIndex: 3, points: 1, order: 0,
  },
  {
    id: "2", quizId: "q1", questionText: "Capital of France?",
    optionA: "Berlin", optionB: "Paris", optionC: "Rome", optionD: "Madrid",
    correctIndex: 1, points: 2, order: 1,
  },
];

it("round-trip: generateCSV output is parseable by parseAndValidateCSV", async () => {
  const csv = generateCSV(QUESTIONS);
  const file = new File([csv], "test.csv", { type: "text/csv" });
  const result = await parseAndValidateCSV(file);
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data).toHaveLength(2);
    expect(result.data[0].Correct_Answer).toBe("D");
    expect(result.data[1].Correct_Answer).toBe("B");
  }
});

it("handles fields containing commas without breaking CSV structure", async () => {
  const q = { ...QUESTIONS[0], questionText: "One, two, or three?" };
  const csv = generateCSV([q]);
  const file = new File([csv], "test.csv", { type: "text/csv" });
  const result = await parseAndValidateCSV(file);
  expect(result.success).toBe(true);
});
```
---PROMPT---

**Verify:** `npm test` passes. `questionValidation.ts` and `csvGenerator.ts` at 100% coverage.

---

## PR-3 Description

**Summary**
Visual quiz builder: `questionValidation` utility, `BuilderQuestionCard` and `QuizBuilder` with live validation and localStorage draft persistence, `csvGenerator` for optional CSV export, and a tabbed `CreateQuiz` view offering both manual and CSV creation paths through `useCreateQuiz`.

**Changed files**
- `src/utils/questionValidation.ts` (new)
- `src/components/quiz-builder/BuilderQuestionCard.tsx` (new)
- `src/components/quiz-builder/QuizBuilder.tsx` (new)
- `src/utils/csvGenerator.ts` (new)
- `src/views/CreateQuiz.tsx`
- `src/components/UploadQuestionsForm.tsx`
- `src/utils/questionValidation.test.ts` (new)
- `src/utils/csvGenerator.test.ts` (new)

**Checklist**
- [ ] `npm test` passes
- [ ] `questionValidation.ts` and `csvGenerator.ts` at 100% coverage
- [ ] `npx tsc --noEmit` passes
- [ ] Both creation paths produce a shareable link
- [ ] Builder draft persists on refresh and clears on successful publish
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`

---

# PR-4 — Quiz Timer
**Branch:** `feat/quiz-timer`

```bash
git checkout main && git pull
git checkout -b feat/quiz-timer
```

> After commit 4-A, run this migration in the Supabase dashboard before continuing:
> `alter table quizzes add column time_limit integer;`

---

### COMMIT 4-A
**Commit:** `feat(types): add time_limit to QuizDraft, document migration`

---PROMPT---
Update `src/lib/types.ts`. Read the file first. Add `time_limit` to `QuizDraft`:

```ts
export interface QuizDraft {
  id?: string;
  title: string;
  description: string;
  // Supabase migration required before this field is usable:
  // alter table quizzes add column time_limit integer;
  time_limit?: number | null;
}
```

No other changes in this commit.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime changes yet.

---

### COMMIT 4-B
**Commit:** `feat(timer): TimeLimitInput component`

---PROMPT---
Create `src/components/quiz-builder/TimeLimitInput.tsx`:

```tsx
"use client";

interface TimeLimitInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function TimeLimitInput({
  value,
  onChange,
}: TimeLimitInputProps) {
  const enabled = value !== null;

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? 30 : null)}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm text-gray-300">Set a time limit</span>
      </label>
      {enabled && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={180}
            value={value ?? 30}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 1 && v <= 180) onChange(v);
            }}
            className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition"
          />
          <span className="text-sm text-gray-400">minutes</span>
        </div>
      )}
    </div>
  );
}
```

Wire into `src/views/CreateQuiz.tsx`. Read the current file (after PR-3D). Find the `{/* TimeLimitInput goes here in PR-4 */}` comment and replace it with:
```tsx
import TimeLimitInput from "../components/quiz-builder/TimeLimitInput";
// In JSX:
<TimeLimitInput value={timeLimit} onChange={setTimeLimit} />
```

`timeLimit` and `setTimeLimit` are already exposed by `useCreateQuiz` from PR-1F. Destructure them.
---PROMPT---

**Verify:** The time limit checkbox appears in the create flow. Enabling it and creating then submitting a quiz saves `time_limit` to the Supabase row (verify in Supabase dashboard).

---

### COMMIT 4-C
**Commit:** `feat(timer): QuizTimer component`

---PROMPT---
Create `src/components/quiz/QuizTimer.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface QuizTimerProps {
  timeLimitSeconds: number;
  onExpire: () => void;
}

export default function QuizTimer({
  timeLimitSeconds,
  onExpire,
}: QuizTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitSeconds);
  const warnedRef = useRef(false);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current();
          }
          return 0;
        }
        if (prev === 61 && !warnedRef.current) {
          warnedRef.current = true;
          toast("1 minute remaining!", { icon: "⏱" });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const ratio = secondsRemaining / timeLimitSeconds;
  const colorClass =
    ratio > 0.5
      ? "text-green-400"
      : ratio > 0.2
      ? "text-yellow-400"
      : "text-red-400";

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className={`font-mono text-lg font-bold tabular-nums ${colorClass}`}>
      {display}
    </div>
  );
}
```

Note: `onExpire` is stored in a ref to avoid restarting the interval when the parent re-renders. The interval runs once on mount.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. (Behaviour tests land in 4-F.)

---

### COMMIT 4-D
**Commit:** `feat(timer): elapsed tracking, handleTimerExpire, isAutoSubmit in useTakeQuiz`

---PROMPT---
Update `src/hooks/useTakeQuiz.ts`. Read the full file before editing. Add `useRef` to the react import.

**Add three things:**

1. A start time ref, set when quiz data loads:
```ts
const startTimeRef = useRef<number>(Date.now());
```
Inside `fetchQuizData`, after `setQuestions(...)`, add:
```ts
startTimeRef.current = Date.now();
```

2. Two new state values:
```ts
const [elapsedSeconds, setElapsedSeconds] = useState(0);
const [isAutoSubmit, setIsAutoSubmit] = useState(false);
```

3. Update `confirmSubmit` to capture elapsed time:
```ts
const confirmSubmit = () => {
  setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
};
```

4. Add `handleTimerExpire`:
```ts
const handleTimerExpire = () => {
  setIsAutoSubmit(true);
  setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
};
```

Add `elapsedSeconds`, `isAutoSubmit`, and `handleTimerExpire` to the return object.

**Update `src/components/quiz/SubmitConfirmationModal.tsx`** — add an optional `isAutoSubmit?: boolean` prop. When true, show "Time's up! Your quiz has been submitted." as the title and hide the Cancel/Submit buttons. Read the file before editing.
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. Create a 1-minute quiz, take it, wait for expiry — auto-submit fires and results show.

---

### COMMIT 4-E
**Commit:** `feat(timer): wire QuizTimer into TakeQuizClient, show elapsed time on results`

---PROMPT---
**Update `src/components/quiz/TakeQuizClient.tsx`.** Read the full file before editing. This is the main quiz-taking client component.

Destructure `handleTimerExpire`, `elapsedSeconds`, and `isAutoSubmit` from `useTakeQuiz`. Import `QuizTimer`.

In the JSX, just above `<QuizProgress .../>`, add:
```tsx
{quiz.time_limit && !showResults && (
  <div className="flex justify-end mb-2">
    <QuizTimer
      timeLimitSeconds={quiz.time_limit * 60}
      onExpire={handleTimerExpire}
    />
  </div>
)}
```

**Update `src/components/quiz/QuizResults.tsx`.** Read the full file before editing. Add props:
```ts
elapsedSeconds: number;
isAutoSubmit?: boolean;
timeLimit?: number | null;
```

Inside the score card `<div>`, below the points line, add:
```tsx
{/* Time display */}
{(() => {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${m}m ${s}s`;
  if (isAutoSubmit) {
    return <p className="text-red-400 font-medium mt-2">Time&apos;s up!</p>;
  }
  if (timeLimit && elapsedSeconds < timeLimit * 60) {
    const remaining = timeLimit * 60 - elapsedSeconds;
    const rm = Math.floor(remaining / 60);
    const rs = remaining % 60;
    return (
      <p className="text-gray-400 mt-2">
        Completed in {timeStr} · {rm}m {rs}s remaining
      </p>
    );
  }
  return <p className="text-gray-400 mt-2">Completed in {timeStr}</p>;
})()}
```

Update the `<QuizResults>` call in `TakeQuizClient.tsx` to pass the new props:
```tsx
<QuizResults
  {...existingProps}
  elapsedSeconds={elapsedSeconds}
  isAutoSubmit={isAutoSubmit}
  timeLimit={quiz.time_limit}
/>
```
---PROMPT---

**Verify:** Complete an untimed quiz — elapsed time shows on results. Complete a timed quiz within the limit — remaining time shows. Let a timed quiz expire — "Time's up!" shows on results.

---

### COMMIT 4-F
**Commit:** `test(timer): QuizTimer unit tests with fake timers`

---PROMPT---
Create `src/components/quiz/QuizTimer.test.tsx`. Read the full component file before writing.

```tsx
import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import QuizTimer from "./QuizTimer";

vi.mock("react-hot-toast", () => ({
  default: vi.fn(),
}));

import toast from "react-hot-toast";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("QuizTimer", () => {
  it("displays initial time in mm:ss format", () => {
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("decrements by 1 every second", () => {
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("01:59")).toBeInTheDocument();
  });

  it("calls onExpire exactly once when reaching zero", () => {
    const onExpire = vi.fn();
    render(<QuizTimer timeLimitSeconds={3} onExpire={onExpire} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("shows green text above 50% remaining", () => {
    const { container } = render(
      <QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />
    );
    expect(container.firstChild).toHaveClass("text-green-400");
  });

  it("shows yellow text between 20-50% remaining", () => {
    const { container } = render(
      <QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />
    );
    act(() => vi.advanceTimersByTime(55000)); // 45s remaining = 45%
    expect(container.firstChild).toHaveClass("text-yellow-400");
  });

  it("shows red text below 20% remaining", () => {
    const { container } = render(
      <QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />
    );
    act(() => vi.advanceTimersByTime(85000)); // 15s remaining = 15%
    expect(container.firstChild).toHaveClass("text-red-400");
  });

  it("fires warning toast exactly once at 60 seconds remaining", () => {
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(60000)); // 60s remaining
    expect(toast).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10000));
    expect(toast).toHaveBeenCalledTimes(1); // still 1
  });
});
```
---PROMPT---

**Verify:** `npm test` passes all timer cases.

---

## PR-4 Description

**Summary**
Optional per-quiz time limits: `TimeLimitInput` in the creation flow, `QuizTimer` countdown with color-coded urgency and a 1-minute toast warning, auto-submit on expiry via `handleTimerExpire` in `useTakeQuiz`, and elapsed/remaining time on results.

**Changed files**
- `src/lib/types.ts`
- `src/components/quiz-builder/TimeLimitInput.tsx` (new)
- `src/components/quiz/QuizTimer.tsx` (new)
- `src/hooks/useTakeQuiz.ts`
- `src/components/quiz/SubmitConfirmationModal.tsx`
- `src/components/quiz/TakeQuizClient.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/components/quiz/QuizTimer.test.tsx` (new)

**Checklist**
- [ ] Supabase migration run: `alter table quizzes add column time_limit integer;`
- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` zero warnings
- [ ] Timed quiz auto-submits at zero
- [ ] Untimed quiz shows elapsed time on results
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`


> Continuation of the PRT. Same rules: Next.js App Router, `"use client"` on all interactive components, `next/link` for navigation, `next/navigation` for hooks. Paste one `---PROMPT---` block at a time.

---

# PR-5 — Docs Section
**Branch:** `feat/docs`

```bash
git checkout main && git pull
git checkout -b feat/docs
```

---

### COMMIT 5-A
**Commit:** `feat(docs): layout, sidebar, and routing`

---PROMPT---
Create the docs section. Read `src/components/DashboardLayout.tsx` and `src/components/SideBar.tsx` before writing — match the dark theme but build a separate layout since docs is public (no auth wrapper).

**Create `src/components/docs/DocsSidebar.tsx`:**
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "csv-guide", label: "CSV Guide" },
  { slug: "troubleshooting", label: "Troubleshooting" },
  { slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0">
      <ul className="space-y-1">
        {SECTIONS.map((s) => {
          const isActive =
            pathname === `/docs/${s.slug}` ||
            (s.slug === "getting-started" && pathname === "/docs");
          return (
            <li key={s.slug}>
              <Link
                href={`/docs/${s.slug}`}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

**Create `src/components/docs/DocsLayout.tsx`:**
```tsx
import { ReactNode } from "react";
import DocsSidebar from "./DocsSidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-12 flex gap-10">
        <div className="hidden md:block">
          <DocsSidebar />
        </div>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

**Create `app/docs/page.tsx`** — redirects to the first section:
```tsx
import { redirect } from "next/navigation";

export default function DocsPage() {
  redirect("/docs/getting-started");
}
```

**Create `app/docs/[section]/page.tsx`:**
```tsx
import DocsLayout from "../../../src/components/docs/DocsLayout";
import GettingStarted from "../../../src/components/docs/GettingStarted";
import CSVGuide from "../../../src/components/docs/CSVGuide";
import Troubleshooting from "../../../src/components/docs/Troubleshooting";
import QuestionTips from "../../../src/components/docs/QuestionTips";
import type { Metadata } from "next";

const SECTION_TITLES: Record<string, string> = {
  "getting-started": "Getting Started — PREP Docs",
  "csv-guide": "CSV Guide — PREP Docs",
  troubleshooting: "Troubleshooting — PREP Docs",
  "question-tips": "Question Tips — PREP Docs",
};

const CONTENT: Record<string, React.ComponentType> = {
  "getting-started": GettingStarted,
  "csv-guide": CSVGuide,
  troubleshooting: Troubleshooting,
  "question-tips": QuestionTips,
};

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}): Promise<Metadata> {
  return {
    title: SECTION_TITLES[params.section] ?? "PREP Docs",
  };
}

export default function DocsSection({
  params,
}: {
  params: { section: string };
}) {
  const Content = CONTENT[params.section] ?? GettingStarted;
  return (
    <DocsLayout>
      <Content />
    </DocsLayout>
  );
}
```

No changes to `app/layout.tsx` needed — docs routes are public and inherit the root layout.
---PROMPT---

**Verify:** `/docs` redirects to `/docs/getting-started`. `/docs/csv-guide` and `/docs/troubleshooting` render without crashing (content components can be stubs for now). Sidebar active state updates correctly. Works unauthenticated.

---

### COMMIT 5-B
**Commit:** `feat(docs): content components including interactive CSV validator`

---PROMPT---
Create the four content components. Read `src/utils/csvParser.ts` and `src/utils/csvGenerator.ts` before writing `CSVGuide`. All components that use state or browser APIs need `"use client"` at the top. `GettingStarted`, `Troubleshooting`, and `QuestionTips` are prose-only and do not need it.

**`src/components/docs/GettingStarted.tsx`** — no `"use client"` needed, prose only:
```tsx
export default function GettingStarted() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-3">Getting Started</h1>
        <p className="text-gray-300 leading-relaxed">
          PREP lets you create and share multiple-choice quizzes. Build questions
          manually or upload a CSV, then share a link with anyone.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Three steps</h2>
        {[
          { n: "1", t: "Create an account", d: "Sign up and go to your dashboard." },
          { n: "2", t: "Build your quiz", d: "Add questions manually in the builder, or upload a CSV. Set an optional time limit." },
          { n: "3", t: "Share the link", d: "Copy the shareable link and send it to anyone. No account needed to take a quiz." },
        ].map((s) => (
          <div key={s.n} className="flex gap-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
            <span className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
              {s.n}
            </span>
            <div>
              <p className="text-white font-medium">{s.t}</p>
              <p className="text-gray-400 text-sm mt-0.5">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**`src/components/docs/CSVGuide.tsx`** — needs `"use client"` for the validator and download:
```tsx
"use client";

import { useState } from "react";
import { parseAndValidateCSV } from "../../utils/csvParser";
import { generateCSV } from "../../utils/csvGenerator";
import type { AppQuestion } from "../../lib/types";

const EXAMPLE_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is the capital of France?,London,Paris,Berlin,Rome,B,1
What is 2 + 2?,3,4,5,6,B,1`;

const EXAMPLE_QUESTIONS: AppQuestion[] = [
  {
    id: "ex1", quizId: "", order: 0, points: 1, correctIndex: 1,
    questionText: "What is the capital of France?",
    optionA: "London", optionB: "Paris", optionC: "Berlin", optionD: "Rome",
  },
  {
    id: "ex2", quizId: "", order: 1, points: 1, correctIndex: 1,
    questionText: "What is 2 + 2?",
    optionA: "3", optionB: "4", optionC: "5", optionD: "6",
  },
];

const COLUMNS = [
  { name: "Question", required: true, notes: "The question text" },
  { name: "Option_A", required: true, notes: "Answer choice A" },
  { name: "Option_B", required: true, notes: "Answer choice B" },
  { name: "Option_C", required: true, notes: "Answer choice C" },
  { name: "Option_D", required: true, notes: "Answer choice D" },
  { name: "Correct_Answer", required: true, notes: "Must be A, B, C, or D (case-insensitive)" },
  { name: "Points", required: false, notes: "Integer point value, defaults to 1" },
];

export default function CSVGuide() {
  const [csvInput, setCsvInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EXAMPLE_CSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const csv = generateCSV(EXAMPLE_QUESTIONS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prep-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    const file = new File([csvInput], "validate.csv", { type: "text/csv" });
    const result = await parseAndValidateCSV(file);
    setValidationResult(
      result.success
        ? {
            ok: true,
            message: `Valid! ${result.data.length} question${result.data.length !== 1 ? "s" : ""} found.`,
          }
        : { ok: false, message: result.message }
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-3">CSV Guide</h1>
        <p className="text-gray-300">
          Upload questions as a CSV file. The file must have a header row with
          these exact column names.
        </p>
      </div>

      {/* Columns table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Column</th>
              <th className="text-left py-2 pr-4 text-gray-400 font-medium">Required</th>
              <th className="text-left py-2 text-gray-400 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {COLUMNS.map((col) => (
              <tr key={col.name} className="border-b border-white/5">
                <td className="py-2 pr-4 font-mono text-white">{col.name}</td>
                <td className="py-2 pr-4 text-gray-400">{col.required ? "Yes" : "No"}</td>
                <td className="py-2 text-gray-400">{col.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Example + download */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Example CSV</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:text-white transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:text-white transition"
            >
              Download sample
            </button>
          </div>
        </div>
        <pre className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto">
          {EXAMPLE_CSV}
        </pre>
      </div>

      {/* Mini-validator */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Validate your CSV</h2>
        <p className="text-sm text-gray-400">Paste your CSV below to check it before uploading.</p>
        <textarea
          value={csvInput}
          onChange={(e) => { setCsvInput(e.target.value); setValidationResult(null); }}
          placeholder="Paste CSV content here..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none"
        />
        <button
          onClick={handleValidate}
          disabled={!csvInput.trim()}
          className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Validate
        </button>
        {validationResult && (
          <p
            className={`text-sm font-medium ${
              validationResult.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {validationResult.message}
          </p>
        )}
      </div>
    </div>
  );
}
```

**`src/components/docs/Troubleshooting.tsx`** — no `"use client"` needed:
```tsx
export default function Troubleshooting() {
  const issues = [
    {
      title: "CSV upload errors",
      items: [
        { error: '"CSV is missing required columns."', fix: "Check that your header row contains all six required column names exactly as shown, including underscores." },
        { error: '"Row N has missing values."', fix: "One or more cells in that row is empty. Every row needs all six fields." },
        { error: '"Row N: Correct_Answer must be A, B, C, or D."', fix: "Check the Correct_Answer cell for that row. Lowercase letters and surrounding spaces are accepted, but the value must be A, B, C, or D." },
        { error: '"No data found in CSV."', fix: "The file has a header row but no data rows, or the file is empty." },
        { error: '"CSV contains parsing errors."', fix: "The file has a structural problem. Open it in a text editor and check for unmatched quotes or unexpected line breaks." },
      ],
    },
    {
      title: "Quiz not found",
      items: [
        { error: "Quiz shows a not-found error", fix: "The link may be wrong or the quiz may have been deleted by its creator. Ask them to share the link again." },
      ],
    },
    {
      title: "Progress not saving",
      items: [
        { error: "Progress is lost on refresh", fix: "Progress is stored in localStorage. Private browsing mode or browser settings that block site data will prevent saving. Switch to a normal browsing window." },
      ],
    },
    {
      title: "Timer did not auto-submit",
      items: [
        { error: "Time ran out but quiz did not submit", fix: "This can happen if the tab was in the background for a long time. Submit manually using the Submit button." },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-3">Troubleshooting</h1>
        <p className="text-gray-300">Common issues and how to fix them.</p>
      </div>
      {issues.map((section) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-lg font-semibold text-white">{section.title}</h2>
          <div className="space-y-2">
            {section.items.map((item, i) => (
              <div key={i} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
                <p className="font-mono text-sm text-red-400">{item.error}</p>
                <p className="text-sm text-gray-300">{item.fix}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**`src/components/docs/QuestionTips.tsx`** — no `"use client"` needed:
Prose tips covering: keeping questions unambiguous, avoiding double negatives, making distractors plausible (wrong answers that look right to someone who partially understands), varying difficulty, using points to weight harder questions.
---PROMPT---

**Verify:** Mini-validator shows a success message with row count for a valid CSV. Shows the exact error message for an invalid one. Sample download produces a file that opens with the right columns. All four docs pages render without errors.

---

## PR-5 Description

**Summary**
Public `/docs` section with sidebar navigation and four content pages. The CSV Guide includes a column reference table, a copyable example, a sample CSV download, and an interactive mini-validator using the same `parseAndValidateCSV` function as the upload flow.

**Changed files**
- `app/docs/page.tsx` (new)
- `app/docs/[section]/page.tsx` (new)
- `src/components/docs/DocsLayout.tsx` (new)
- `src/components/docs/DocsSidebar.tsx` (new)
- `src/components/docs/GettingStarted.tsx` (new)
- `src/components/docs/CSVGuide.tsx` (new)
- `src/components/docs/Troubleshooting.tsx` (new)
- `src/components/docs/QuestionTips.tsx` (new)

**Checklist**
- [ ] `npx tsc --noEmit` passes
- [ ] `/docs` accessible unauthenticated, redirects to getting-started
- [ ] CSV mini-validator works correctly
- [ ] Sample download produces a valid CSV
- [ ] Sidebar active state correct on all four routes
- [ ] Page titles set correctly via `generateMetadata`
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`

---

# PR-6 — AI Performance Review
**Branch:** `feat/ai-review`

```bash
git checkout main && git pull
git checkout -b feat/ai-review
```

> Prerequisite: `GROQ_API_KEY` must be added to Vercel environment variables before this PR is testable on a deployed preview. Add it at vercel.com under your project's Settings > Environment Variables.

---

### COMMIT 6-A
**Commit:** `feat(api): Groq AI review route handler`

---PROMPT---
Create `app/api/ai-review/route.ts`. This is a Next.js App Router route handler — not a Vercel Edge Function config file. The export is a named `POST` function.

```ts
import { NextRequest, NextResponse } from "next/server";
import type { AppQuestion } from "../../../src/lib/types";

interface ReviewPayload {
  questions: AppQuestion[];
  selectedAnswers: Record<string, number>;
  score: number;
  totalPoints: number;
}

// In-memory rate limit store — resets on cold start, acceptable for portfolio scale
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT) {
      const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
      return NextResponse.json(
        {
          error: `Rate limit exceeded. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`,
        },
        { status: 429 }
      );
    }
    record.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
  }

  let payload: ReviewPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questions, selectedAnswers, score, totalPoints } = payload;
  const percentage = Math.round((score / totalPoints) * 100);

  const questionLines = questions
    .map((q, i) => {
      const userIdx = selectedAnswers[i] ?? -1;
      const options = [q.optionA, q.optionB, q.optionC, q.optionD];
      const userAnswer = userIdx >= 0 ? options[userIdx] : "Not answered";
      const correctAnswer = options[q.correctIndex];
      const correct = userIdx === q.correctIndex;
      return `Q${i + 1}: ${q.questionText}\nUser answered: ${userAnswer} (${correct ? "Correct" : "Wrong"})\nCorrect answer: ${correctAnswer}`;
    })
    .join("\n\n");

  const prompt = `A student scored ${score}/${totalPoints} (${percentage}%) on a quiz.\n\n${questionLines}\n\nProvide a brief performance review with:\n- 3-5 sentences on what the student did well\n- 3-5 sentences on areas to improve\n- 2-3 specific study suggestions\n\nBe concise and specific to the questions above.`;

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 600,
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!groqResponse.ok) {
      return NextResponse.json(
        { error: "AI review temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await groqResponse.json();
    const review: string | undefined = data.choices?.[0]?.message?.content;

    if (!review) {
      return NextResponse.json(
        { error: "AI review temporarily unavailable." },
        { status: 502 }
      );
    }

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json(
      { error: "AI review temporarily unavailable." },
      { status: 502 }
    );
  }
}
```
---PROMPT---

**Verify:** Deploy to Vercel preview. POST to `/api/ai-review` with a sample payload — confirm a review string is returned. Send 6 requests quickly — confirm the 6th returns 429.

---

### COMMIT 6-B
**Commit:** `feat(hooks): useAIReview hook`

---PROMPT---
Create `src/hooks/useAIReview.ts`. Read `src/lib/types.ts` to confirm the `AIReviewPayload` type is exported (it was added in PR-1E).

```ts
import { useState } from "react";
import type { AIReviewPayload } from "../lib/types";

interface AIReviewState {
  review: string | null;
  loading: boolean;
  error: string | null;
}

export function useAIReview() {
  const [state, setState] = useState<AIReviewState>({
    review: null,
    loading: false,
    error: null,
  });

  const getReview = async (payload: AIReviewPayload) => {
    setState({ review: null, loading: true, error: null });

    try {
      const response = await fetch("/api/ai-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 429) {
        setState({
          review: null,
          loading: false,
          error:
            "You've used your 5 free reviews this hour. Try again later, or use the export option below.",
        });
        return;
      }

      if (!response.ok || data.error) {
        setState({
          review: null,
          loading: false,
          error: "AI review is temporarily unavailable.",
        });
        return;
      }

      setState({ review: data.review, loading: false, error: null });
    } catch {
      setState({
        review: null,
        loading: false,
        error: "AI review is temporarily unavailable.",
      });
    }
  };

  const clearReview = () =>
    setState({ review: null, loading: false, error: null });

  return { ...state, getReview, clearReview };
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. (Tests land in 6-D.)

---

### COMMIT 6-C
**Commit:** `feat(results): AI review section in QuizResults`

---PROMPT---
Update `src/components/quiz/QuizResults.tsx`. Read the full file before editing — the current props are `quizTitle`, `correctCount`, `totalQuestions`, `earnedPoints`, `totalPoints`, `onRetake`, `quizId`, `questions`, `userAnswers`.

Add these props to `QuizResultsProps`:
```ts
elapsedSeconds: number;
isAutoSubmit?: boolean;
timeLimit?: number | null;
quizVisibility?: string;
```

Import `useAIReview` and `AIReviewPayload` at the top:
```ts
import { useAIReview } from "../../hooks/useAIReview";
import type { AIReviewPayload } from "../../lib/types";
```

At the top of the component body, call the hook and build the payload:
```ts
const { review, loading, error, getReview } = useAIReview();

const reviewPayload: AIReviewPayload = {
  questions,
  selectedAnswers: userAnswers,
  score: earnedPoints,
  totalPoints,
};
```

Inside the score card `<div>`, below the points/time lines, add the AI review section:
```tsx
{/* AI Review */}
<div className="mt-6 text-left">
  {!review && !loading && !error && (
    <button
      onClick={() => getReview(reviewPayload)}
      className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
    >
      Get AI Review
    </button>
  )}

  {loading && (
    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-400 text-sm">
      Analysing your results...
    </div>
  )}

  {error && (
    <div className="backdrop-blur-sm bg-white/5 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
      {error}
    </div>
  )}

  {review && (
    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          AI Review
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(review)}
            className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-white/10"
          >
            Copy
          </button>
          {!error?.includes("Rate limit") && (
            <button
              onClick={() => getReview(reviewPayload)}
              className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-white/10"
            >
              Regenerate
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
        {review}
      </p>
    </div>
  )}

  <p className="text-xs text-gray-500 mt-3 text-center">
    Or export manually to use with any AI tool
  </p>
</div>
```

The component already has `"use client"` from the migration — keep it. Update the `<QuizResults>` call in `TakeQuizClient.tsx` to pass `elapsedSeconds`, `isAutoSubmit`, `timeLimit`, and `quizVisibility` (read the file first).
---PROMPT---

**Verify:** Complete a quiz. AI review section appears below the score. Loading state shows on click, then the review renders. Copy and Regenerate buttons work. The rate limit message appears after 5 requests.

---

### COMMIT 6-D
**Commit:** `test(hooks): useAIReview with mocked fetch`

---PROMPT---
Create `src/hooks/useAIReview.test.ts`. Read the hook in full before writing.

```ts
import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAIReview } from "./useAIReview";

const makeResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => vi.restoreAllMocks());

const PAYLOAD = {
  questions: [],
  selectedAnswers: {},
  score: 5,
  totalPoints: 10,
};

describe("useAIReview", () => {
  it("sets review on 200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ review: "Great job!" }, 200))
    );
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.review).toBe("Great job!");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets rate limit error message on 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ error: "Rate limit" }, 429))
    );
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("5 free reviews");
  });

  it("sets generic error on non-429 failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ error: "Server error" }, 500))
    );
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("sets generic error on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network")));
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("loading is true during request and false after", async () => {
    let resolve: (r: Response) => void;
    const pending = new Promise<Response>((res) => (resolve = res));
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));
    const { result } = renderHook(() => useAIReview());
    act(() => {
      result.current.getReview(PAYLOAD);
    });
    expect(result.current.loading).toBe(true);
    await act(async () => {
      resolve!(makeResponse({ review: "Done" }, 200));
    });
    expect(result.current.loading).toBe(false);
  });

  it("clearReview resets review and error to null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ review: "Good" }, 200))
    );
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    act(() => result.current.clearReview());
    expect(result.current.review).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
```
---PROMPT---

**Verify:** `npm test` passes all cases.

---

## PR-6 Description

**Summary**
AI-powered quiz performance review: a Next.js App Router route handler at `/api/ai-review` calling Groq with in-memory rate limiting (5/hour/IP); a `useAIReview` hook managing loading/error state; and a review section on the results screen with copy and regenerate actions.

**Changed files**
- `app/api/ai-review/route.ts` (new)
- `src/hooks/useAIReview.ts` (new)
- `src/components/quiz/QuizResults.tsx`
- `src/components/quiz/TakeQuizClient.tsx`
- `src/hooks/useAIReview.test.ts` (new)

**Checklist**
- [ ] `GROQ_API_KEY` set in Vercel environment variables
- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes
- [ ] Deployed preview returns a review on POST
- [ ] Rate limit returns 429 after 5 requests
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`

---

# PR-7 — Public Quiz Bank
**Branch:** `feat/quiz-bank`

```bash
git checkout main && git pull
git checkout -b feat/quiz-bank
```

> After commit 7-A, run all migrations documented in `src/lib/types.ts` in the Supabase dashboard before working on 7-B onward.

---

### COMMIT 7-A
**Commit:** `feat(types): quiz bank types, visibility, categories, and migration docs`

---PROMPT---
Update `src/lib/types.ts`. Read the full file first. Add all quiz bank types and document required migrations as comments.

```ts
export type QuizVisibility = "private" | "public" | "unlisted";
export type QuizDifficulty = "Beginner" | "Intermediate" | "Advanced";

export const QUIZ_CATEGORIES = [
  "General Knowledge",
  "Science",
  "History",
  "Mathematics",
  "Language & Literature",
  "Technology",
  "Arts & Culture",
  "Geography",
  "Health & Medicine",
  "Business & Economics",
] as const;

export type QuizCategory = (typeof QUIZ_CATEGORIES)[number];

// Supabase migrations — run in order in the Supabase dashboard:
//
// alter table quizzes add column visibility text not null default 'private'
//   check (visibility in ('private', 'public', 'unlisted'));
// alter table quizzes add column category text;
// alter table quizzes add column difficulty text
//   check (difficulty in ('Beginner', 'Intermediate', 'Advanced'));
// alter table quizzes add column times_taken integer not null default 0;
// alter table quizzes add column average_rating numeric;
//
// create table quiz_ratings (
//   id uuid primary key default gen_random_uuid(),
//   quiz_id uuid references quizzes(id) on delete cascade not null,
//   user_id uuid references auth.users(id) on delete cascade not null,
//   rating integer not null check (rating between 1 and 5),
//   created_at timestamptz default now(),
//   unique (quiz_id, user_id)
// );
//
// alter table quiz_ratings enable row level security;
// create policy "Anyone can read ratings" on quiz_ratings for select using (true);
// create policy "Auth users can rate" on quiz_ratings for insert
//   with check (auth.uid() = user_id);
// create policy "Auth users can update own rating" on quiz_ratings for update
//   using (auth.uid() = user_id);

export interface PublicQuiz {
  id: string;
  title: string;
  description: string;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  times_taken: number;
  average_rating: number | null;
  created_at: string;
  question_count?: number;
}
```

Also update `QuizDraft` to include the new fields:
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
}
```
---PROMPT---

**Verify:** `npx tsc --noEmit` passes. No runtime changes.

---

### COMMIT 7-B
**Commit:** `feat(quiz-bank): usePublishQuiz hook and PublishModal`

---PROMPT---
Create the publish flow. Read `src/lib/types.ts`, `src/components/quiz/SubmitConfirmationModal.tsx` (for modal pattern), and `src/components/QuizCard.tsx` before writing.

**Create `src/hooks/usePublishQuiz.ts`:**
```ts
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizDifficulty, QuizCategory } from "../lib/types";

interface PublishSettings {
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
}

export function usePublishQuiz(quizId: string, onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async (settings: PublishSettings) => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("quizzes")
      .update(settings)
      .eq("id", quizId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      toast.error("Failed to update quiz visibility");
      return;
    }

    toast.success(
      settings.visibility === "public"
        ? "Quiz published to the Quiz Bank!"
        : "Quiz visibility updated"
    );
    onSuccess();
  };

  return { publish, loading, error };
}
```

**Create `src/components/quiz-bank/PublishModal.tsx`:**
```tsx
"use client";

import { useState } from "react";
import { usePublishQuiz } from "../../hooks/usePublishQuiz";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type {
  QuizVisibility,
  QuizDifficulty,
  QuizCategory,
} from "../../lib/types";

interface PublishModalProps {
  quizId: string;
  currentVisibility: QuizVisibility;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VISIBILITY_OPTIONS: {
  value: QuizVisibility;
  label: string;
  desc: string;
}[] = [
  {
    value: "private",
    label: "Private",
    desc: "Only accessible via direct link",
  },
  {
    value: "unlisted",
    label: "Unlisted",
    desc: "Shareable but not listed in the Quiz Bank",
  },
  {
    value: "public",
    label: "Public",
    desc: "Listed in the Quiz Bank for anyone to discover",
  },
];

export default function PublishModal({
  quizId,
  currentVisibility,
  isOpen,
  onClose,
  onSuccess,
}: PublishModalProps) {
  const [visibility, setVisibility] =
    useState<QuizVisibility>(currentVisibility);
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);

  const { publish, loading } = usePublishQuiz(quizId, () => {
    onSuccess();
    onClose();
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <h3 className="text-xl font-bold text-white">Quiz Visibility</h3>

        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition"
            >
              <input
                type="radio"
                name="visibility"
                value={opt.value}
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
                className="mt-0.5"
              />
              <div>
                <p className="text-white text-sm font-medium">{opt.label}</p>
                <p className="text-gray-400 text-xs">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {visibility === "public" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category ?? ""}
                onChange={(e) =>
                  setCategory((e.target.value as QuizCategory) || null)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={difficulty ?? ""}
                onChange={(e) =>
                  setDifficulty((e.target.value as QuizDifficulty) || null)
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              >
                <option value="">Not specified</option>
                {(
                  ["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]
                ).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => publish({ visibility, category, difficulty })}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

Wire `PublishModal` into `src/components/QuizCard.tsx`. Read the current file fully before editing. Add `isPublishOpen` state and a "Publish" button in the card actions. `QuizCard` needs to accept `visibility: QuizVisibility` and call `onRefetch` after `PublishModal.onSuccess` to refresh the list. Update `QuizCardProps` and all call sites in the views/pages that render `QuizCard`.
---PROMPT---

**Verify:** Opening the modal, selecting Public + category + difficulty, clicking Save updates the Supabase row. `QuizCard` shows the updated visibility.

---

### COMMIT 7-C
**Commit:** `feat(quiz-bank): useQuizBank hook, QuizBank page, and app route`

---PROMPT---
Create the public quiz bank browser. Read `src/lib/types.ts` and `src/components/QuizCard.tsx` for patterns. All client components need `"use client"`.

**Create `src/hooks/useQuizBank.ts`:**
```ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { PublicQuiz, QuizCategory, QuizDifficulty } from "../lib/types";

type SortOption = "popular" | "rated" | "newest" | "alphabetical";

interface Filters {
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  sort: SortOption;
}

export function useQuizBank() {
  const [allQuizzes, setAllQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>({
    category: null,
    difficulty: null,
    sort: "newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);

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
        query = query.order("average_rating", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "alphabetical":
        query = query.order("title", { ascending: true });
        break;
    }

    const { data, error: fetchError } = await query;
    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setAllQuizzes(data ?? []);
  }, [filters.category, filters.difficulty, filters.sort]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

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

**Create `src/components/quiz-bank/QuizBankFilters.tsx`** — category dropdown, difficulty dropdown, sort select, and search text input. Uses `setFilter` and `setSearchQuery`. All inputs use the existing `bg-white/5 border border-white/10` styling. Needs `"use client"`.

**Create `src/components/quiz-bank/QuizBankCard.tsx`** — needs `"use client"`. Shows title, category badge, difficulty badge, star rating (5 stars, `★` filled up to `Math.round(average_rating ?? 0)`, `☆` for the rest), times_taken count. "Take Quiz" uses `<Link href={`/quiz/${quiz.id}`}>` from `next/link`. "Preview" button fetches the first 3 questions from Supabase on click and shows them in a simple inline dropdown rather than a modal (avoids portal complexity). Follow the `backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl` card pattern.

**Create `src/views/QuizBankView.tsx`** — needs `"use client"`. Calls `useQuizBank`. Renders `QuizBankFilters` above a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`. Empty state when no quizzes match filters. Loading state with a simple spinner or skeleton.

**Create `app/quiz-bank/page.tsx`** — Server Component, no `"use client"`:
```tsx
import type { Metadata } from "next";
import QuizBankView from "../../src/views/QuizBankView";

export const metadata: Metadata = {
  title: "Quiz Bank — PREP",
  description: "Browse and take public quizzes created by the PREP community.",
};

export default function QuizBankPage() {
  return <QuizBankView />;
}
```

Add a "Browse Quiz Bank" link to the home page. Read the home page file first — find the CTA button group and add a `<Link href="/quiz-bank">` alongside it.
---PROMPT---

**Verify:** `/quiz-bank` renders unauthenticated. Published quizzes appear. Filtering by category and sort updates the list. Search filters by title. "Take Quiz" navigates correctly.

---

### COMMIT 7-D
**Commit:** `feat(quiz-bank): useRating hook and RatingWidget`

---PROMPT---
Create the rating system. Read `src/hooks/useAuth.ts` and `src/components/quiz/QuizResults.tsx` before writing.

**Create `src/hooks/useRating.ts`:**
```ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

export function useRating(quizId: string) {
  const { user } = useAuth();
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !quizId) return;
    supabase
      .from("quiz_ratings")
      .select("rating")
      .eq("quiz_id", quizId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setCurrentRating(data.rating);
      });
  }, [quizId, user]);

  const submitRating = async (rating: number) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error: upsertError } = await supabase
      .from("quiz_ratings")
      .upsert(
        { quiz_id: quizId, user_id: user.id, rating },
        { onConflict: "quiz_id,user_id" }
      );

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    // Recalculate average_rating
    const { data: ratings } = await supabase
      .from("quiz_ratings")
      .select("rating")
      .eq("quiz_id", quizId);

    if (ratings && ratings.length > 0) {
      const avg =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      await supabase
        .from("quizzes")
        .update({ average_rating: avg })
        .eq("id", quizId);
    }

    setCurrentRating(rating);
    setLoading(false);
    toast.success("Rating submitted!");
  };

  return { currentRating, loading, error, submitRating };
}
```

**Create `src/components/quiz-bank/RatingWidget.tsx`:**
```tsx
"use client";

import { useState } from "react";
import { useRating } from "../../hooks/useRating";
import { useAuth } from "../../hooks/useAuth";

export default function RatingWidget({ quizId }: { quizId: string }) {
  const { user } = useAuth();
  const { currentRating, loading, submitRating } = useRating(quizId);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-gray-400">Sign in to rate this quiz</p>
    );
  }

  if (submitted || currentRating !== null) {
    return (
      <p className="text-sm text-gray-400">
        Your rating:{" "}
        {"★".repeat(currentRating ?? 0)}
        {"☆".repeat(5 - (currentRating ?? 0))}{" "}
        Thanks!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading}
          onClick={async () => {
            await submitRating(star);
            setSubmitted(true);
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl transition disabled:cursor-not-allowed"
        >
          <span
            className={
              (hovered ?? currentRating ?? 0) >= star
                ? "text-yellow-400"
                : "text-gray-600"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
```

Wire into `src/components/quiz/QuizResults.tsx`. Read the file. Add `RatingWidget` below the time display, only when `quizVisibility === "public"`:
```tsx
{quizVisibility === "public" && quizId && (
  <div className="mt-4">
    <p className="text-xs text-gray-400 mb-2">Rate this quiz</p>
    <RatingWidget quizId={quizId} />
  </div>
)}
```
---PROMPT---

**Verify:** Complete a public quiz while authenticated. Rating stars appear. Clicking a star submits the rating and shows "Thanks!". Completing a private quiz shows no rating widget.

---

### COMMIT 7-E
**Commit:** `feat(dashboard): visibility badges and publish stats on QuizCard`

---PROMPT---
Update `src/components/QuizCard.tsx` and the hook that fetches quizzes for the dashboard. Read both files in full before editing.

Find the hook that fetches the dashboard quiz list (likely `src/hooks/useQuizzes.ts` or similar). Update the Supabase select to include the new fields: `visibility`, `category`, `difficulty`, `times_taken`, `average_rating`. Update the local interface to match.

**In `QuizCard.tsx`:**

Update `QuizCardProps` to include `visibility`, `times_taken`, `average_rating`.

Add a visibility badge in the card header:
```tsx
const VISIBILITY_COLORS: Record<string, string> = {
  private: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  unlisted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  public: "text-green-400 bg-green-400/10 border-green-400/20",
};

<span
  className={`text-xs font-medium px-2 py-0.5 rounded border ${
    VISIBILITY_COLORS[visibility ?? "private"]
  }`}
>
  {visibility ?? "private"}
</span>
```

For public quizzes, add a stats row below the description:
```tsx
{visibility === "public" && (
  <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
    <span>{times_taken ?? 0} taken</span>
    {average_rating != null && (
      <span>★ {average_rating.toFixed(1)}</span>
    )}
  </div>
)}
```

Add a "Publish" button in the card actions row. It opens `PublishModal` with the current `visibility`. After `PublishModal.onSuccess`, trigger a refetch (pass a `onRefetch` callback prop from the parent, or use the same pattern the existing cards use to refresh data).
---PROMPT---

**Verify:** Dashboard shows visibility badges on all quiz cards. Public quizzes show times_taken and average_rating. Publish button opens the modal. Unpublishing (setting to private) refreshes the badge.

---

### COMMIT 7-F
**Commit:** `test(quiz-bank): useQuizBank filters and useRating upsert`

---PROMPT---
Create `src/hooks/useQuizBank.test.ts` and `src/hooks/useRating.test.ts`. Read both hook files in full before writing.

Mock Supabase as a chainable query builder:
```ts
const mockQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue({ error: null }),
  update: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null }),
};

vi.mock("../lib/supabase", () => ({
  supabase: { from: vi.fn(() => mockQuery) },
}));

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "u1" } })),
}));
```

**`useQuizBank.test.ts`** cases:
```ts
it("includes visibility = public filter in every query")
it("adds category filter when category is set")
it("orders by times_taken descending for popular sort")
it("orders by title ascending for alphabetical sort")
it("client-side search returns only quizzes matching the query substring")
```

For the search test, mock Supabase to return a fixed array of quizzes, then call `setSearchQuery` and check the filtered output.

**`useRating.test.ts`** cases:
```ts
it("submitRating calls upsert with correct quiz_id, user_id, and rating")
it("loading is true during submitRating and false after")
it("sets error state on Supabase upsert failure")
```
---PROMPT---

**Verify:** `npm test` passes all cases.

---

## PR-7 Description

**Summary**
Public quiz bank: creators publish quizzes with category and difficulty from their dashboard; a public `/quiz-bank` page lets anyone browse, filter, and take published quizzes; post-completion star ratings update the quiz's average; creator dashboard cards show visibility, stats, and a publish/unpublish action.

**Changed files**
- `src/lib/types.ts`
- `src/hooks/usePublishQuiz.ts` (new)
- `src/components/quiz-bank/PublishModal.tsx` (new)
- `src/hooks/useQuizBank.ts` (new)
- `src/components/quiz-bank/QuizBankFilters.tsx` (new)
- `src/components/quiz-bank/QuizBankCard.tsx` (new)
- `src/views/QuizBankView.tsx` (new)
- `app/quiz-bank/page.tsx` (new)
- `src/hooks/useRating.ts` (new)
- `src/components/quiz-bank/RatingWidget.tsx` (new)
- `src/components/QuizCard.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/hooks/useQuizBank.test.ts` (new)
- `src/hooks/useRating.test.ts` (new)

**Checklist**
- [ ] All Supabase migrations from 7-A run in dashboard
- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `/quiz-bank` accessible unauthenticated
- [ ] Publish flow updates Supabase row
- [ ] Rating upsert works and updates average_rating
- [ ] No `console.log` statements
- [ ] Branch up to date with `main`

---

# PR-8 — Polish and Final Tests
**Branch:** `feat/polish`

```bash
git checkout main && git pull
git checkout -b feat/polish
```

---

### COMMIT 8-A
**Commit:** `feat(errors): ErrorBoundary component`

---PROMPT---
Create `src/components/ErrorBoundary.tsx`. React error boundaries must be class components — this cannot use hooks.

```tsx
"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Something went wrong
            </h2>
            <p className="text-gray-400">
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

**Update `app/layout.tsx`** — wrap the main content in `<ErrorBoundary>`. Read the file first. Import `ErrorBoundary` from `"../src/components/ErrorBoundary"` and wrap `{children}`:
```tsx
<ErrorBoundary>
  {children}
</ErrorBoundary>
```

**Update `src/components/quiz/QuizResults.tsx`** — wrap only the AI review section in a tighter boundary so a Groq failure does not crash the whole results screen:
```tsx
<ErrorBoundary
  fallback={
    <p className="text-sm text-gray-400 mt-4">AI review unavailable.</p>
  }
>
  {/* the AI review JSX block */}
</ErrorBoundary>
```
---PROMPT---

**Verify:** App still loads normally. Temporarily throw inside a component and confirm the fallback screen renders, then remove the throw. Confirm the AI review boundary does not affect the rest of the results page.

---

### COMMIT 8-B
**Commit:** `feat(ux): keyboard shortcuts during quiz taking`

---PROMPT---
Create `src/hooks/useQuizKeyboard.ts`:

```ts
import { useEffect } from "react";

interface QuizKeyboardOptions {
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancelModal: () => void;
  isActive: boolean;
}

export function useQuizKeyboard({
  onSelectAnswer,
  onNext,
  onSubmit,
  onCancelModal,
  isActive,
}: QuizKeyboardOptions) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          onSelectAnswer(0);
          break;
        case "b":
          onSelectAnswer(1);
          break;
        case "c":
          onSelectAnswer(2);
          break;
        case "d":
          onSelectAnswer(3);
          break;
        case "enter":
          onNext();
          break;
        case "escape":
          onCancelModal();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onSelectAnswer, onNext, onSubmit, onCancelModal]);
}
```

Wire into `src/components/quiz/TakeQuizClient.tsx`. Read the file first. Destructure `cancelSubmit` and `initiateSubmit` from `useTakeQuiz` if not already present. Add:
```ts
import { useQuizKeyboard } from "../../hooks/useQuizKeyboard";

useQuizKeyboard({
  onSelectAnswer: handleAnswerSelect,
  onNext: goToNext,
  onSubmit: initiateSubmit,
  onCancelModal: cancelSubmit,
  isActive: !showResults,
});
```
---PROMPT---

**Verify:** During quiz taking, A/B/C/D selects the corresponding option. Enter advances. Escape closes the submit modal when open. Nothing fires after results are shown. Typing in an input does not trigger shortcuts.

---

### COMMIT 8-C
**Commit:** `feat(seo): metadata, OG tags, and dynamic quiz titles`

---PROMPT---
Next.js App Router uses `metadata` exports and `generateMetadata` for SEO — no `useDocumentTitle` hook needed.

**Update `app/layout.tsx`** — add root metadata. Read the file first:
```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "PREP — Quiz Builder & Study Tool",
    template: "%s — PREP",
  },
  description:
    "Create and share multiple-choice quizzes. Build manually or upload a CSV. Get AI-powered performance reviews.",
  openGraph: {
    type: "website",
    siteName: "PREP",
    title: "PREP — Quiz Builder & Study Tool",
    description:
      "Create and share multiple-choice quizzes. Build manually or upload a CSV.",
    // Add /og-image.png to /public before launch
  },
};
```

**Update `app/quiz/[quizId]/page.tsx`** — add `generateMetadata` to set the quiz title dynamically. Read the file first. The page already fetches quiz data server-side or passes params to the client component:
```ts
export async function generateMetadata({
  params,
}: {
  params: { quizId: string };
}): Promise<Metadata> {
  const { data } = await supabase
    .from("quizzes")
    .select("title")
    .eq("id", params.quizId)
    .single();

  return {
    title: data?.title ?? "Quiz",
  };
}
```

This requires importing `supabase` from the lib. Check if the page already does a server-side fetch — if so, reuse that data rather than making a second call.

Docs and quiz bank already have `generateMetadata` from PRs 5 and 7. No changes needed there.
---PROMPT---

**Verify:** Navigating to a quiz URL shows the quiz title in the browser tab. `/quiz-bank` shows "Quiz Bank — PREP". `/docs/csv-guide` shows "CSV Guide — PREP Docs". The home page shows "PREP — Quiz Builder & Study Tool".

---

### COMMIT 8-D
**Commit:** `perf: lazy load heavy pages with next/dynamic`

---PROMPT---
In Next.js App Router, `next/dynamic` is the equivalent of `React.lazy`. Use it for client-heavy views that do not need to be in the initial bundle.

Read the client component files for the quiz bank and quiz builder to understand what they import before deciding on split points.

**Update `src/views/QuizBankView.tsx`** — this is the heaviest client component (recharts or other charting if added, quiz list, filters). If it imports anything large, wrap heavy sub-components with `dynamic`:
```ts
import dynamic from "next/dynamic";

const QuizBankFilters = dynamic(
  () => import("../components/quiz-bank/QuizBankFilters"),
  { loading: () => <div className="h-12 animate-pulse bg-white/5 rounded-xl" /> }
);
```

Only apply `dynamic` where chunks are actually large — run `npm run build` first and check the output. If no single JS chunk exceeds 500kb, no changes are needed. Document your finding in the PR description either way.

**Add `loading.tsx` files** to the heavy app routes — this is the Next.js App Router way to show a loading state during navigation:

`app/quiz-bank/loading.tsx`:
```tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading quiz bank...</div>
    </div>
  );
}
```

`app/docs/loading.tsx`: same pattern with "Loading docs..."
`app/quiz/[quizId]/loading.tsx`: same with "Loading quiz..."
---PROMPT---

**Verify:** `npm run build` completes with zero errors. Navigating to `/quiz-bank` shows the loading state briefly. No chunk exceeds 500kb (or document why if one does).

---

### COMMIT 8-E
**Commit:** `test: coverage gap fill to 80% across hooks and utils`

---PROMPT---
Run `npm run coverage` first. Read the full output before writing a single test. Do not write tests for files already at or above 80%.

For each file below 80%: identify the exact uncovered lines or branches from the coverage report, then write the minimum tests needed to cover them. Add to the nearest existing test file or create a new one if none exists.

Priority files to check:
- `src/hooks/useCreateQuiz.ts`
- `src/hooks/usePublishQuiz.ts`
- `src/hooks/useQuizBank.ts`
- `src/hooks/useRating.ts`
- `src/hooks/useAIReview.ts`
- `src/utils/questionValidation.ts`
- `src/utils/csvGenerator.ts`

For `useCreateQuiz.ts` if below threshold — mock Supabase and cover:
```ts
it("createQuiz with empty title calls toast.error without calling supabase.insert")
it("createQuiz with valid title and authenticated user calls supabase.insert")
it("uploadQuestions with empty questions array calls toast.error")
it("setQuestionsFromCSV with a valid CSV File populates questions state")
```

Do not write tests for UI components — hooks and utils only.
---PROMPT---

**Verify:** `npm run coverage` shows no file in `src/hooks/` or `src/utils/` below 80%.

---

## PR-8 Description

**Summary**
Final polish: `ErrorBoundary` wrapping the app root and the AI review section; keyboard shortcuts (A/B/C/D, Enter, Escape) during quiz taking; Next.js native metadata and `generateMetadata` for dynamic quiz titles and OG tags; `next/dynamic` applied where bundle analysis warrants it; App Router `loading.tsx` files for heavy routes; and a coverage gap fill pass to bring all hooks and utils to 80%+.

**Changed files**
- `src/components/ErrorBoundary.tsx` (new)
- `app/layout.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/hooks/useQuizKeyboard.ts` (new)
- `src/components/quiz/TakeQuizClient.tsx`
- `app/quiz/[quizId]/page.tsx`
- `app/quiz-bank/loading.tsx` (new)
- `app/docs/loading.tsx` (new)
- `app/quiz/[quizId]/loading.tsx` (new)
- Various `*.test.ts` files for coverage gaps

**Checklist**
- [ ] `npm run build` zero errors
- [ ] `npm run coverage` no file in hooks/ or utils/ below 80%
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` zero errors and warnings
- [ ] Keyboard shortcuts work during quiz taking
- [ ] Page titles correct on all routes
- [ ] No `console.log` statements (except ErrorBoundary's intentional one)
- [ ] Branch up to date with `main`