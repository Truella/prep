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