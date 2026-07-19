cat > /home/claude/PREP_PRT.md << 'ENDOFFILE'
# PREP — Enhancement Agent Prompts
> Eight PRs building on the existing codebase. Paste one `---PROMPT---` block at a time into Cursor or your agent.
> Verify each step before committing and moving on.
> CodeRabbit will review each PR — address all flagged issues before merging.

---

# PR-1 — Code Health
**Branch:** `fix/code-health`

```bash
git checkout main && git pull
git checkout -b fix/code-health
```

---

### COMMIT 1-A
**Commit:** `fix(csvParser): case-insensitive, whitespace-tolerant Correct_Answer validation`

---PROMPT---
Fix `src/utils/csvParser.ts`. The current row validation does a raw `includes` check on `Correct_Answer` without trimming or uppercasing first, so values like `"a"` or `" B "` fail with a misleading error. The PRD says validation is case-insensitive and whitespace-tolerant — make the code match.

In the row loop, change the `Correct_Answer` check from:
```ts
if (!["A", "B", "C", "D"].includes(row.Correct_Answer)) {
```
to:
```ts
const answer = row.Correct_Answer?.trim().toUpperCase();
if (!["A", "B", "C", "D"].includes(answer)) {
```

Also trim all other string field checks before the emptiness test. Change:
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

Do not change the function signature, return type, error messages (other than Correct_Answer now accepting lowercase), or overall structure.
---PROMPT---

**Verify:** A CSV with `Correct_Answer` of `"a"`, `" B "`, or `" c "` parses with `success: true`. A CSV with `Correct_Answer: "E"` still returns `success: false` with the row error message.

---

### COMMIT 1-B
**Commit:** `fix(auth): split useAuth into own file, resolve fast-refresh lint error`

---PROMPT---
`src/context/AuthContext.tsx` currently exports both the `AuthProvider` component and the `useAuth` hook from the same file, causing an eslint `react-refresh/only-export-components` error.

**Create `src/hooks/useAuth.ts`:**
```ts
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

**Update `src/context/AuthContext.tsx`:**
- Export `AuthContext` (the context object itself) so `useAuth.ts` can import it. Change `const AuthContext` to `export const AuthContext`.
- Remove the `useAuth` function and its export entirely from this file.
- Everything else stays identical.

**Update all import sites.** Grep for `useAuth` imports across `src/` and update each one from `"../context/AuthContext"` to `"../hooks/useAuth"` (adjust the relative path per file location). Files currently importing it: `DashboardLayout.tsx` and any auth-gated components.
---PROMPT---

**Verify:** `npx eslint src/context/AuthContext.tsx` reports zero errors. App boots, auth sign-in and sign-out still work.

---

### COMMIT 1-C
**Commit:** `fix(useQuizProgress): wrap saveProgress and clearProgress in useCallback`

---PROMPT---
`src/hooks/useQuizProgress.ts` has two lint warnings: `saveProgress` and `clearProgress` are recreated every render and used inside `useEffect` bodies without being in the dep arrays, creating stale-closure risk.

Replace the plain function declarations with `useCallback`. Add `useCallback` to the import from `react`.

**`saveProgress`** closes over `quizId`, `isSubmitted`, `selectedAnswers`, `currentQuestionIndex`, and `isHydratedRef`. `isHydratedRef` is a ref — do not include it in the dep array. The dep array is `[quizId, isSubmitted, selectedAnswers, currentQuestionIndex]`.

Change:
```ts
const saveProgress = () => {
```
to:
```ts
const saveProgress = useCallback(() => {
  // body unchanged
}, [quizId, isSubmitted, selectedAnswers, currentQuestionIndex]);
```

**`clearProgress`** closes over `quizId` only:
```ts
const clearProgress = useCallback(() => {
  if (!quizId) return;
  localStorage.removeItem(STORAGE_KEY);
}, [quizId]);
```

After wrapping, the `useEffect` that calls `saveProgress` can safely list it as a dependency:
```ts
useEffect(() => {
  saveProgress();
}, [selectedAnswers, currentQuestionIndex, saveProgress]);
```

And the `useEffect` that calls `clearProgress`:
```ts
useEffect(() => {
  if (isSubmitted) {
    clearProgress();
  }
}, [isSubmitted, clearProgress]);
```

`markHydrated` mutates a ref — it does not need `useCallback`. Leave it as is.
---PROMPT---

**Verify:** `npx eslint src/hooks/useQuizProgress.ts` reports zero warnings. Progress save and restore still work end-to-end.

---

### COMMIT 1-D
**Commit:** `fix(useTakeQuiz): wrap fetchQuizData in useCallback, fix useEffect deps`

---PROMPT---
`src/hooks/useTakeQuiz.ts` has two lint warnings. `fetchQuizData` is defined inside the hook but called in a `useEffect` without being in the dep array. The second `useEffect` (progress restore) also omits `loadProgress` and `markHydrated` from its deps.

Add `useCallback` to the import from `react`.

**Wrap `fetchQuizData`:**
```ts
const fetchQuizData = useCallback(async () => {
  if (!quizId) return;
  // body is identical to the current function
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

**Update the second `useEffect`** (progress restore). After PR-1C lands, `loadProgress` and `markHydrated` are stable. Include them:
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

**Verify:** `npx eslint src/hooks/useTakeQuiz.ts` reports zero warnings. Quiz loading, progress restore, and scoring all work end-to-end.

---

### COMMIT 1-E
**Commit:** `refactor(types): introduce DBQuestion/AppQuestion, add transforms layer`

---PROMPT---
The codebase has `QuizQuestion` using raw DB column names (`Question`, `Option_A`, `Correct_Answer`) throughout the component layer. The PRD describes a separation between display format and DB format — implement it.

**Update `src/lib/types.ts`:**

Rename `QuizQuestion` to `DBQuestion` (do a find-and-replace across the codebase after — check with grep first). Add `AppQuestion` and the `AIReviewPayload` type:

```ts
// Rename existing QuizQuestion to:
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

// New app-internal type (camelCase, correctIndex as number):
export interface AppQuestion {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number; // 0-3
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

**Create `src/utils/transforms.ts`:**
```ts
import type { DBQuestion, AppQuestion } from "../lib/types";

export function letterToIndex(letter: string): number {
  const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  return map[letter?.trim().toUpperCase()] ?? -1;
}

export function indexToLetter(index: number): "A" | "B" | "C" | "D" {
  const map: Record<number, "A" | "B" | "C" | "D"> = { 0: "A", 1: "B", 2: "C", 3: "D" };
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

**Update `src/utils/helpers.ts`:** Remove `letterToIndex` and re-export it from transforms to avoid breaking anything during the transition:
```ts
export { letterToIndex } from "./transforms";
```

**Update `src/hooks/useTakeQuiz.ts`:**
- Change the `questions` state type from `DBQuestion[]` (formerly `QuizQuestion[]`) to `AppQuestion[]`.
- After fetching from Supabase, map through `dbToAppQuestion`:
  ```ts
  setQuestions(questionsData.map((q, i) => dbToAppQuestion(q, i)));
  ```
- In `calculateScore`, compare `selectedAnswers[index] === q.correctIndex` directly. Remove the `letterToIndex` import from `helpers`.

Update all other files that import `QuizQuestion` — grep for it, change to `DBQuestion` where the raw DB type is needed, `AppQuestion` where it's used in components. The main consumer is `QuizResults.tsx` — update its `questions` prop type to `AppQuestion[]`.
---PROMPT---

**Verify:** `npx tsc -b --noEmit` passes with zero errors. `letterToIndex` is called in exactly one place in the codebase (`transforms.ts`). Quiz taking and scoring work end-to-end.

---

### COMMIT 1-F
**Commit:** `refactor(handlers): replace handlers.ts with useCreateQuiz hook`

---PROMPT---
`src/utils/handlers.ts` exports three functions that take `setState` dispatchers as arguments and mix auth, DB writes, state mutation, and toasts in one place. Replace the whole file with a `useCreateQuiz` hook.

**Create `src/hooks/useCreateQuiz.ts`:**
```ts
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
      correctIndex: ["A", "B", "C", "D"].indexOf(row.Correct_Answer.trim().toUpperCase()),
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

**Update `src/pages/CreateQuiz.tsx`** to use `useCreateQuiz` instead of local state + dispatchers. Remove the local `quiz`, `questions`, `isCreatingQuiz`, `isUploadingQuestions`, `shareableLink` state. Call `useCreateQuiz()` at the top. Pass values and callbacks down to child components — no more raw `setState` dispatchers as props.

**Update `src/components/CreateQuizForm.tsx`** props to:
```ts
{
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isLoading: boolean;
}
```
Move the "Create Quiz" button from `CreateQuizForm` into the parent `CreateQuiz.tsx` page. Remove all handler imports from `CreateQuizForm`.

**Update `src/components/UploadQuestionsForm.tsx`** props to:
```ts
{
  onFileChange: (file: File) => void;
  onSubmit: () => void;
  disabled: boolean;
  isUploading: boolean;
  questionCount: number;
}
```

**Delete `src/utils/handlers.ts`** after confirming nothing imports it.
---PROMPT---

**Verify:** `handlers.ts` does not exist. `npx tsc -b --noEmit` passes. `npx eslint src/` reports zero errors and zero warnings. CSV quiz creation works end-to-end including the shareable link.

---

## PR-1 Description

**Summary**
Six code health fixes found during grounded gap analysis: CSV parser now correctly handles lowercase and whitespace-padded correct answers; `useAuth` split into its own file resolving the fast-refresh lint error; `saveProgress` and `clearProgress` wrapped in `useCallback` clearing two lint warnings; `fetchQuizData` wrapped in `useCallback` clearing the remaining lint warning; a proper `DBQuestion`/`AppQuestion` type layer introduced with a `transforms.ts` mapping module; and `handlers.ts` replaced with a `useCreateQuiz` hook that owns all quiz-creation state.

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
- `src/pages/CreateQuiz.tsx`
- `src/components/CreateQuizForm.tsx`
- `src/components/UploadQuestionsForm.tsx`
- `src/components/quiz/QuizResults.tsx`

**Checklist**
- [ ] `npx tsc -b --noEmit` passes with zero errors
- [ ] `npx eslint src/` passes with zero errors, zero warnings
- [ ] CSV creation works end-to-end
- [ ] Quiz taking and scoring work end-to-end
- [ ] `handlers.ts` is deleted
- [ ] No `console.log` statements left in code
- [ ] Branch is up to date with `main`

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

Run:
```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

**Update `vite.config.ts`** — add a `test` block inside `defineConfig`. Read the current file first before editing:
```ts
test: {
  environment: "jsdom",
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov"],
  },
},
```

**Update `package.json`** scripts — add:
```json
"test": "vitest run",
"test:watch": "vitest",
"coverage": "vitest run --coverage"
```
---PROMPT---

**Verify:** `npm test` runs and exits with code 0. `npm run coverage` also exits cleanly.

---

### COMMIT 2-B
**Commit:** `test(csvParser): full coverage including PR-1 case/whitespace fixes`

---PROMPT---
Create `src/utils/csvParser.test.ts`.

PapaParse requires real `File` objects. Construct them from strings:
```ts
const makeFile = (content: string) =>
  new File([content], "test.csv", { type: "text/csv" });
```

The valid CSV fixture to reuse across tests:
```ts
const VALID_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is 2+2?,1,2,3,4,D,1
Capital of France?,Berlin,Paris,Rome,Madrid,B,2`;
```

Write the following test cases inside `describe("parseAndValidateCSV")`:

```ts
it("parses a valid CSV successfully")
// result.success === true, result.data.length === 2

it("accepts lowercase correct answer")
// CSV with Correct_Answer "a" → success: true

it("accepts whitespace-padded correct answer")
// CSV with Correct_Answer " B " → success: true

it("rejects an invalid correct answer")
// CSV with Correct_Answer "E" → success: false, message contains "Row 1"

it("rejects a CSV missing required columns")
// CSV without Correct_Answer column → success: false, message === "CSV is missing required columns."

it("rejects an empty file")
// Empty string → success: false, message === "No data found in CSV."

it("rejects a row with missing question text")
// Row where Question is empty → success: false, message contains "Row"

it("trims option whitespace without failing")
// Options with leading/trailing spaces → success: true
```
---PROMPT---

**Verify:** `npm test` passes all cases. `npm run coverage` shows `csvParser.ts` at 100%.

---

### COMMIT 2-C
**Commit:** `test(transforms): round-trip and mapping coverage`

---PROMPT---
Create `src/utils/transforms.test.ts`.

Use these fixtures:
```ts
import type { DBQuestion, AppQuestion } from "../lib/types";

const DB_QUESTION: DBQuestion = {
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

const APP_QUESTION: AppQuestion = {
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
  it("maps all fields correctly")
  it("sets correctIndex to 3 for Correct_Answer D")
})

describe("appToDBQuestion", () => {
  it("maps all fields back correctly")
})

describe("round-trip", () => {
  it("appToDBQuestion(dbToAppQuestion(q)) matches original DB fields")
  // Compare Question, Option_A-D, Correct_Answer, Points
  // Exclude id, quiz_id, created_at (not in appToDBQuestion output)
})
```
---PROMPT---

**Verify:** `npm test` passes. `transforms.ts` at 100% coverage.

---

### COMMIT 2-D
**Commit:** `test(useQuizProgress): save, load, expiry, and guard logic`

---PROMPT---
Create `src/hooks/useQuizProgress.test.ts`.

Setup:
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

The hook signature is:
```ts
useQuizProgress(quizId, selectedAnswers, currentQuestionIndex, isSubmitted)
```

Tests:
```ts
it("saveProgress writes correct shape to localStorage")
// Render with quizId="q1", call markHydrated, trigger save via selectedAnswers change
// Parse localStorage item, check answers, currentIndex, timestamp fields exist

it("loadProgress returns null when nothing is saved")

it("loadProgress returns null when saved data is older than 24 hours")
// Save an item manually with timestamp = Date.now() - 25 hours in ms
// loadProgress() should return null

it("loadProgress returns saved data when fresh")
// Save valid item, loadProgress() returns { answers, currentIndex }

it("clearProgress removes the storage key")

it("saveProgress does nothing before markHydrated is called")
// Render hook, do NOT call markHydrated, change selectedAnswers
// localStorage should remain empty

it("saveProgress does nothing when isSubmitted is true")
// Render with isSubmitted=true, call markHydrated, trigger save
// localStorage should remain empty
```
---PROMPT---

**Verify:** `npm test` passes. `useQuizProgress.ts` above 90% coverage.

---

### COMMIT 2-E
**Commit:** `test(useTakeQuiz): scoring logic and submission state machine`

---PROMPT---
Create `src/hooks/useTakeQuiz.test.ts`.

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
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
```

For scoring tests, mock the questions fetch to return a fixed array of `AppQuestion` objects with known `correctIndex` values. Use `renderHook(() => useTakeQuiz("quiz1"))`.

Tests:
```ts
it("calculateScore returns full points when all answers correct")
it("calculateScore returns zero when all answers wrong")
it("calculateScore returns partial score for mixed answers")
it("answeredCount reflects selected answers")
it("unansweredCount = total - answeredCount")
it("initiateSubmit with zero answers calls toast.error and does not open modal")
it("confirmSubmit sets showResults true and isSubmitted true")
it("cancelSubmit sets showSubmitModal false")
it("resetQuiz clears selectedAnswers, resets index to 0, sets showResults false")
```
---PROMPT---

**Verify:** `npm test` passes. `useTakeQuiz.ts` above 85% coverage.

---

## PR-2 Description

**Summary**
Installs Vitest with jsdom and Testing Library, then adds baseline test coverage for the four highest-value units: `csvParser` (including the case/whitespace fixes from PR-1), `transforms` (full round-trip), `useQuizProgress` (save/load/expiry/guard logic), and `useTakeQuiz` (scoring and submission state machine).

**Changed files**
- `package.json`
- `vite.config.ts`
- `src/utils/csvParser.test.ts` (new)
- `src/utils/transforms.test.ts` (new)
- `src/hooks/useQuizProgress.test.ts` (new)
- `src/hooks/useTakeQuiz.test.ts` (new)

**Checklist**
- [ ] `npm test` passes with zero failures
- [ ] `npm run coverage` — `csvParser.ts` and `transforms.ts` at 100%, hooks above 85%
- [ ] `npx tsc -b --noEmit` passes
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

---

# PR-3 — Visual Quiz Builder
**Branch:** `feat/visual-builder`

```bash
git checkout main && git pull
git checkout -b feat/visual-builder
```

---

### COMMIT 3-A
**Commit:** `feat(validation): add questionValidation utility`

---PROMPT---
Create `src/utils/questionValidation.ts`. Pure functions only — no imports from outside `types.ts`.

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

**Verify:** `npx tsc -b --noEmit` passes. (Tests land in 3-E.)

---

### COMMIT 3-B
**Commit:** `feat(builder): BuilderQuestionCard and QuizBuilder components`

---PROMPT---
Create two components. Read `src/lib/types.ts` (for `AppQuestion`) and `src/utils/questionValidation.ts` before writing.

**Create `src/components/quiz-builder/BuilderQuestionCard.tsx`:**
```tsx
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
    <div className={`backdrop-blur-sm bg-white/5 border rounded-xl p-6 space-y-4 ${hasErrors ? "border-red-500/50" : "border-white/10"}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">Question {index + 1}</span>
        <div className="flex gap-2">
          <button onClick={onMoveUp} disabled={index === 0} className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10">↑</button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10">↓</button>
          <button onClick={onDelete} className="text-red-400 hover:text-red-300 transition text-xs px-2 py-1 rounded border border-red-500/20">Delete</button>
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
              className={`shrink-0 w-7 h-7 rounded-full border text-xs font-bold transition ${question.correctIndex === i ? "bg-white text-black border-white" : "border-white/30 text-gray-400 hover:border-white/60"}`}
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
          onChange={(e) => onChange({ ...question, points: parseInt(e.target.value) || 1 })}
          className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition"
        />
        <span className="text-xs text-gray-500">Click a letter to mark correct answer</span>
      </div>

      {hasErrors && (
        <ul className="space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-400">{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Create `src/components/quiz-builder/QuizBuilder.tsx`:**
```tsx
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

export default function QuizBuilder({ quizId, onSubmit, isUploading }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<AppQuestion[]>([blankQuestion(0)]);
  const [errors, setErrors] = useState<Map<number, string[]>>(new Map());

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setQuestions(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist draft on change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  const updateQuestion = (index: number, updated: AppQuestion) => {
    const next = [...questions];
    next[index] = updated;
    setQuestions(next);
    // Live validation
    const errs = validateQuizForSubmit(next);
    setErrors(errs);
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

**Verify:** Type-check passes. Can add, delete, reorder questions. Validation errors appear inline on the card. Refreshing mid-build restores the draft from localStorage.

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
  const header = "Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points";
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

**Verify:** Type-check passes. (Round-trip test lands in 3-E.)

---

### COMMIT 3-D
**Commit:** `feat(create): tabbed create page with manual builder and CSV upload`

---PROMPT---
Rewrite `src/pages/CreateQuiz.tsx` as a tabbed layout. Read the current file in full before writing — the existing stat cards and `ShareableLink` / `QuizPreview` components should be preserved where they still make sense.

```tsx
import { useState } from "react";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";

type Tab = "build" | "csv";

export default function CreateQuiz() {
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
            <p className="text-xl font-bold text-white">{quiz.id ? "Draft Created" : "Not Created"}</p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-white">{questions.length}</p>
          </div>
        </div>

        {/* Main form card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          {/* Quiz metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quiz Title</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                placeholder="Enter quiz description"
                value={quiz.description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!!quiz.id}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              />
            </div>
            {/* TimeLimitInput placeholder — wired in PR-4 */}
            {!quiz.id && (
              <button
                onClick={createQuiz}
                disabled={isCreatingQuiz}
                type="button"
                className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isCreatingQuiz ? "Creating..." : "Create Quiz"}
              </button>
            )}
          </div>

          {/* Tab switcher — only shown after quiz is created */}
          {quiz.id && (
            <>
              <div className="flex gap-2 border-b border-white/10 pb-0">
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

Update `UploadQuestionsForm` to match its new simplified props:
```tsx
interface UploadQuestionsFormProps {
  onFileChange: (file: File) => void;
  onSubmit: () => void;
  disabled: boolean;
  isUploading: boolean;
  questionCount: number;
}
```

Add the "Need help?" link near the file input:
```tsx
<p className="mt-2 text-xs text-gray-400">
  Format: Question, Option_A, Option_B, Option_C, Option_D, Correct_Answer, Points.{" "}
  <a href="/docs/csv-guide" className="underline hover:text-white transition">Need help?</a>
</p>
```
---PROMPT---

**Verify:** Both creation paths produce a working quiz with a shareable link. Switching to CSV tab clears the builder draft. Type-check passes.

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

// Tests:
// validateQuestion(VALID_Q) → []
// empty questionText → includes "Question text is required"
// empty optionA → includes "Option A is required"
// duplicate options → includes "Options must be unique"
// correctIndex -1 → includes "Correct answer must be A, B, C, or D"
// correctIndex 4 → includes error
// validateQuizForSubmit([VALID_Q]) → empty Map
// validateQuizForSubmit([VALID_Q, {...VALID_Q, questionText: ""}]) → Map with entry at index 1
```

**`csvGenerator.test.ts`** — the key test is the round-trip:
```ts
import { generateCSV } from "./csvGenerator";
import { parseAndValidateCSV } from "./csvParser";
import type { AppQuestion } from "../lib/types";

const QUESTIONS: AppQuestion[] = [
  {
    id: "1", quizId: "q1",
    questionText: "What is 2+2?",
    optionA: "1", optionB: "2", optionC: "3", optionD: "4",
    correctIndex: 3, points: 1, order: 0,
  },
  {
    id: "2", quizId: "q1",
    questionText: "Capital of France?",
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

it("handles fields containing commas", async () => {
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
Adds the visual quiz builder: a `questionValidation` utility, `BuilderQuestionCard` and `QuizBuilder` components with live validation and localStorage draft persistence, a `csvGenerator` for optional CSV export, and a tabbed `CreateQuiz` page offering both build-manually and CSV-upload paths through the same `useCreateQuiz` hook.

**Changed files**
- `src/utils/questionValidation.ts` (new)
- `src/components/quiz-builder/BuilderQuestionCard.tsx` (new)
- `src/components/quiz-builder/QuizBuilder.tsx` (new)
- `src/utils/csvGenerator.ts` (new)
- `src/pages/CreateQuiz.tsx`
- `src/components/UploadQuestionsForm.tsx`
- `src/utils/questionValidation.test.ts` (new)
- `src/utils/csvGenerator.test.ts` (new)

**Checklist**
- [ ] `npm test` passes
- [ ] `npm run coverage` — `questionValidation.ts` and `csvGenerator.ts` at 100%
- [ ] `npx tsc -b --noEmit` passes
- [ ] Both quiz creation paths produce a shareable link
- [ ] Builder draft persists on refresh and clears on successful publish
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

---

# PR-4 — Quiz Timer
**Branch:** `feat/quiz-timer`

```bash
git checkout main && git pull
git checkout -b feat/quiz-timer
```

---

### COMMIT 4-A
**Commit:** `feat(types): add time_limit to QuizDraft`

---PROMPT---
Update `src/lib/types.ts`. Add `time_limit` to `QuizDraft`:

```ts
export interface QuizDraft {
  id?: string;
  title: string;
  description: string;
  // Supabase: integer, nullable, minutes.
  // Run migration: alter table quizzes add column time_limit integer;
  time_limit?: number | null;
}
```

No other changes in this commit.
---PROMPT---

**Verify:** `npx tsc -b --noEmit` passes. No runtime changes.

---

### COMMIT 4-B
**Commit:** `feat(timer): TimeLimitInput component`

---PROMPT---
Create `src/components/quiz-builder/TimeLimitInput.tsx`:

```tsx
interface TimeLimitInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function TimeLimitInput({ value, onChange }: TimeLimitInputProps) {
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

Wire into `src/pages/CreateQuiz.tsx`. Read the current file after PR-3 lands. Find the `{/* TimeLimitInput placeholder — wired in PR-4 */}` comment and replace it with:
```tsx
import TimeLimitInput from "../components/quiz-builder/TimeLimitInput";
// ...
<TimeLimitInput value={timeLimit} onChange={setTimeLimit} />
```

`timeLimit` and `setTimeLimit` are already exposed by `useCreateQuiz` from PR-1-F.
---PROMPT---

**Verify:** The time limit checkbox and input appear in the create flow. Enabling it and submitting a quiz saves `time_limit` to the Supabase row (check in Supabase dashboard).

---

### COMMIT 4-C
**Commit:** `feat(timer): QuizTimer component`

---PROMPT---
Create `src/components/quiz/QuizTimer.tsx`:

```tsx
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface QuizTimerProps {
  timeLimitSeconds: number;
  onExpire: () => void;
}

export default function QuizTimer({ timeLimitSeconds, onExpire }: QuizTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(timeLimitSeconds);
  const warnedRef = useRef(false);
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
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
  }, [onExpire]);

  const ratio = secondsRemaining / timeLimitSeconds;
  const colorClass =
    ratio > 0.5 ? "text-green-400" : ratio > 0.2 ? "text-yellow-400" : "text-red-400";

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
---PROMPT---

**Verify:** Type-check passes. (Behaviour tests land in 4-F.)

---

### COMMIT 4-D
**Commit:** `feat(timer): elapsed tracking, auto-submit, and isAutoSubmit in useTakeQuiz`

---PROMPT---
Update `src/hooks/useTakeQuiz.ts`. Read the full file before editing.

Add `useRef` to the react import. Add three things:

**1. Start time ref** — set when quiz data loads:
```ts
const startTimeRef = useRef<number>(Date.now());
```
Inside `fetchQuizData`, after `setQuestions(questionsData.map(...))`, add:
```ts
startTimeRef.current = Date.now();
```

**2. `elapsedSeconds` and `isAutoSubmit` state:**
```ts
const [elapsedSeconds, setElapsedSeconds] = useState(0);
const [isAutoSubmit, setIsAutoSubmit] = useState(false);
```

**3. `handleTimerExpire` function:**
```ts
const handleTimerExpire = () => {
  setIsAutoSubmit(true);
  setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
};
```

Update `confirmSubmit` to also capture elapsed time:
```ts
const confirmSubmit = () => {
  setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
  setShowSubmitModal(false);
  setShowResults(true);
  setIsSubmitted(true);
};
```

Add `elapsedSeconds`, `isAutoSubmit`, and `handleTimerExpire` to the return object.

Update `SubmitConfirmationModal` props interface to accept an optional `isAutoSubmit?: boolean`. When true, show "Time's up! Your quiz has been submitted." as the title and hide the Cancel/Submit buttons (the submit already happened). Add this to `src/components/quiz/SubmitConfirmationModal.tsx`.
---PROMPT---

**Verify:** Type-check passes. Create a 1-minute quiz, take it, wait for timer — auto-submit fires and results show.

---

### COMMIT 4-E
**Commit:** `feat(timer): wire QuizTimer into TakeQuiz, show elapsed time on results`

---PROMPT---
**Update `src/pages/TakeQuiz.tsx`.** Read the full file before editing.

Add `handleTimerExpire` and `elapsedSeconds` to the destructured values from `useTakeQuiz`. Import `QuizTimer`.

In the quiz layout JSX, inside the main content column alongside `QuizProgress`, add the timer when `quiz.time_limit` is set and results are not showing:
```tsx
{quiz.time_limit && !showResults && (
  <div className="flex justify-end">
    <QuizTimer
      timeLimitSeconds={quiz.time_limit * 60}
      onExpire={handleTimerExpire}
    />
  </div>
)}
```
Place this just above `<QuizProgress .../>`.

**Update `src/components/quiz/QuizResults.tsx`.** Read the full file before editing.

Add `elapsedSeconds: number`, `isAutoSubmit?: boolean`, and `timeLimit?: number | null` to `QuizResultsProps`. Add a time display inside the score card, below the points line:

```tsx
{/* Time display */}
{(() => {
  const m = Math.floor(elapsedSeconds / 60);
  const s = elapsedSeconds % 60;
  const timeStr = `${m}m ${s}s`;
  if (isAutoSubmit) return <p className="text-red-400 font-medium mt-2">Time's up!</p>;
  if (timeLimit && elapsedSeconds < timeLimit * 60) {
    const remaining = timeLimit * 60 - elapsedSeconds;
    const rm = Math.floor(remaining / 60);
    const rs = remaining % 60;
    return <p className="text-gray-400 mt-2">Completed in {timeStr} · {rm}m {rs}s remaining</p>;
  }
  return <p className="text-gray-400 mt-2">Completed in {timeStr}</p>;
})()}
```

Update the `QuizResults` call in `TakeQuiz.tsx` to pass the new props:
```tsx
<QuizResults
  ...existing props...
  elapsedSeconds={elapsedSeconds}
  isAutoSubmit={isAutoSubmit}
  timeLimit={quiz.time_limit}
/>
```
---PROMPT---

**Verify:** Complete an untimed quiz — elapsed time shows on results. Complete a timed quiz within the limit — time remaining shows. Let a timed quiz expire — "Time's up!" shows.

---

### COMMIT 4-F
**Commit:** `test(timer): QuizTimer unit tests with fake timers`

---PROMPT---
Create `src/components/quiz/QuizTimer.test.tsx`:

```tsx
import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import QuizTimer from "./QuizTimer";

vi.mock("react-hot-toast", () => ({ default: { __esModule: true, default: vi.fn() } }));
// Adjust mock based on how toast is imported — check QuizTimer.tsx import

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("QuizTimer", () => {
  it("displays initial time correctly", () => {
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("decrements every second", () => {
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText("01:59")).toBeInTheDocument();
  });

  it("calls onExpire when reaching zero", () => {
    const onExpire = vi.fn();
    render(<QuizTimer timeLimitSeconds={3} onExpire={onExpire} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("shows green color above 50% remaining", () => {
    const { container } = render(<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />);
    expect(container.firstChild).toHaveClass("text-green-400");
  });

  it("shows yellow color between 20-50% remaining", () => {
    const { container } = render(<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(55000)); // 45s remaining = 45%
    expect(container.firstChild).toHaveClass("text-yellow-400");
  });

  it("shows red color below 20% remaining", () => {
    const { container } = render(<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(85000)); // 15s remaining = 15%
    expect(container.firstChild).toHaveClass("text-red-400");
  });

  it("fires warning toast exactly once at 60 seconds remaining", () => {
    const toastMock = vi.fn();
    vi.mocked(toast).mockImplementation(toastMock);
    render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
    act(() => vi.advanceTimersByTime(60000)); // 60s remaining
    expect(toastMock).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(10000));
    expect(toastMock).toHaveBeenCalledTimes(1); // still 1
  });
});
```
---PROMPT---

**Verify:** `npm test` passes all timer cases.

---

## PR-4 Description

**Summary**
Adds optional per-quiz time limits: a `TimeLimitInput` in the creation flow, a `QuizTimer` countdown component with color-coded urgency and a 1-minute warning toast, auto-submit on expiry via `handleTimerExpire` in `useTakeQuiz`, and elapsed/remaining time display on the results screen.

**Changed files**
- `src/lib/types.ts`
- `src/components/quiz-builder/TimeLimitInput.tsx` (new)
- `src/components/quiz/QuizTimer.tsx` (new)
- `src/hooks/useTakeQuiz.ts`
- `src/components/quiz/SubmitConfirmationModal.tsx`
- `src/pages/TakeQuiz.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/components/quiz/QuizTimer.test.tsx` (new)

**Checklist**
- [ ] `npm test` passes
- [ ] `npx tsc -b --noEmit` passes
- [ ] `npx eslint src/` zero warnings
- [ ] Supabase migration run: `alter table quizzes add column time_limit integer;`
- [ ] Timed quiz auto-submits at zero
- [ ] Untimed quiz shows elapsed time on results
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

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
Create the docs section. Read `src/App.tsx`, `src/components/SideBar.tsx`, and `src/components/DashboardLayout.tsx` before writing — match the dark theme patterns but do not reuse `DashboardLayout` (docs is public).

**Create `src/components/docs/DocsSidebar.tsx`:**
```tsx
import { Link, useParams } from "react-router-dom";

const SECTIONS = [
  { slug: "getting-started", label: "Getting Started" },
  { slug: "csv-guide", label: "CSV Guide" },
  { slug: "troubleshooting", label: "Troubleshooting" },
  { slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsSidebar() {
  const { section = "getting-started" } = useParams();

  return (
    <nav className="w-56 shrink-0">
      <ul className="space-y-1">
        {SECTIONS.map((s) => (
          <li key={s.slug}>
            <Link
              to={`/docs/${s.slug}`}
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                section === s.slug
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {s.label}
            </Link>
          </li>
        ))}
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
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:block">
          <DocsSidebar />
        </div>
        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

**Create `src/pages/Docs.tsx`:**
```tsx
import { useParams } from "react-router-dom";
import DocsLayout from "../components/docs/DocsLayout";
import GettingStarted from "../components/docs/GettingStarted";
import CSVGuide from "../components/docs/CSVGuide";
import Troubleshooting from "../components/docs/Troubleshooting";
import QuestionTips from "../components/docs/QuestionTips";

const CONTENT: Record<string, React.ComponentType> = {
  "getting-started": GettingStarted,
  "csv-guide": CSVGuide,
  "troubleshooting": Troubleshooting,
  "question-tips": QuestionTips,
};

export default function Docs() {
  const { section = "getting-started" } = useParams();
  const Content = CONTENT[section] ?? GettingStarted;

  return (
    <DocsLayout>
      <Content />
    </DocsLayout>
  );
}
```

**Update `src/App.tsx`** — add public docs routes before the catch-all:
```tsx
import Docs from "./pages/Docs";
// ...
<Route path="/docs" element={<Docs />} />
<Route path="/docs/:section" element={<Docs />} />
```
---PROMPT---

**Verify:** Navigating to `/docs`, `/docs/csv-guide`, `/docs/troubleshooting` all render without crashing (content components can be stubs for now). Sidebar active state updates on navigation. Works unauthenticated.

---

### COMMIT 5-B
**Commit:** `feat(docs): content components including interactive CSV validator`

---PROMPT---
Create the four content components. Read `src/utils/csvParser.ts` and `src/utils/csvGenerator.ts` before writing `CSVGuide`.

**`src/components/docs/GettingStarted.tsx`** — prose only, no interactivity:
Cover: what PREP is, three steps (create account, build or upload a quiz, share the link), link to the CSV guide for creators, link to `/take` for quiz takers.

**`src/components/docs/CSVGuide.tsx`** — includes interactive elements:
```tsx
import { useState } from "react";
import { parseAndValidateCSV } from "../../utils/csvParser";
import { generateCSV } from "../../utils/csvGenerator";
import type { AppQuestion } from "../../lib/types";

const EXAMPLE_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is the capital of France?,London,Paris,Berlin,Rome,B,1
What is 2 + 2?,3,4,5,6,B,1`;

const EXAMPLE_QUESTIONS: AppQuestion[] = [
  {
    id: "ex1", quizId: "", questionText: "What is the capital of France?",
    optionA: "London", optionB: "Paris", optionC: "Berlin", optionD: "Rome",
    correctIndex: 1, points: 1, order: 0,
  },
  {
    id: "ex2", quizId: "", questionText: "What is 2 + 2?",
    optionA: "3", optionB: "4", optionC: "5", optionD: "6",
    correctIndex: 1, points: 1, order: 1,
  },
];
```

Sections in the component:
1. Required columns table (Column | Required | Notes)
2. Copyable example block — `<pre>` with a Copy button using `navigator.clipboard.writeText(EXAMPLE_CSV)`
3. Sample download button:
```tsx
const handleDownload = () => {
  const csv = generateCSV(EXAMPLE_QUESTIONS);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "prep-sample.csv"; a.click();
  URL.revokeObjectURL(url);
};
```
4. Mini-validator — textarea + Validate button + result display:
```tsx
const [csvInput, setCsvInput] = useState("");
const [validationResult, setValidationResult] = useState<string | null>(null);

const handleValidate = async () => {
  const file = new File([csvInput], "validate.csv", { type: "text/csv" });
  const result = await parseAndValidateCSV(file);
  setValidationResult(
    result.success
      ? `Valid! ${result.data.length} question${result.data.length !== 1 ? "s" : ""} found.`
      : result.message
  );
};
```

**`src/components/docs/Troubleshooting.tsx`** — covers these exact scenarios:
- CSV upload errors: list each exact error message the parser returns (`"CSV is missing required columns."`, `"Row N has missing values."`, `"Row N: Correct_Answer must be A, B, C, or D."`, `"No data found in CSV."`, `"CSV contains parsing errors."`) with what causes each and how to fix it.
- Quiz not found: wrong or expired link, confirm the quiz hasn't been deleted.
- Progress not saving: localStorage may be blocked in private browsing or by browser settings.
- Timer issues: if auto-submit seems slow, submit manually rather than waiting.

**`src/components/docs/QuestionTips.tsx`** — prose tips:
Cover: keep questions unambiguous, avoid double negatives, make distractors plausible, vary difficulty, use points to weight harder questions.

All components use the same prose styling: `text-white` headings, `text-gray-300` body, `text-gray-400` captions, glassmorphism cards (`backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl`).
---PROMPT---

**Verify:** Mini-validator correctly identifies a valid CSV (shows row count) and an invalid one (shows exact error from the parser). Sample CSV download produces a file with the right columns. All four docs sections render without errors.

---

## PR-5 Description

**Summary**
Adds a public `/docs` section with sidebar navigation, four content pages, and an interactive CSV mini-validator and sample download in the CSV Guide. Contextual "Need help?" link already landed in PR-3.

**Changed files**
- `src/pages/Docs.tsx` (new)
- `src/components/docs/DocsLayout.tsx` (new)
- `src/components/docs/DocsSidebar.tsx` (new)
- `src/components/docs/GettingStarted.tsx` (new)
- `src/components/docs/CSVGuide.tsx` (new)
- `src/components/docs/Troubleshooting.tsx` (new)
- `src/components/docs/QuestionTips.tsx` (new)
- `src/App.tsx`

**Checklist**
- [ ] `npx tsc -b --noEmit` passes
- [ ] `/docs` accessible unauthenticated
- [ ] CSV mini-validator works correctly
- [ ] Sample download produces a valid CSV
- [ ] Sidebar active state correct on all four routes
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

---

# PR-6 — AI Performance Review
**Branch:** `feat/ai-review`

```bash
git checkout main && git pull
git checkout -b feat/ai-review
```

> Prerequisite: `GROQ_API_KEY` must be set in Vercel environment variables before this PR is testable on a deployed preview.

---

### COMMIT 6-A
**Commit:** `feat(api): Groq AI review serverless function`

---PROMPT---
Create `api/ai-review.ts` at the repo root. This is a Vercel Edge Function.

```ts
import type { AppQuestion } from "../src/lib/types";

interface ReviewPayload {
  questions: AppQuestion[];
  selectedAnswers: Record<string, number>;
  score: number;
  totalPoints: number;
}

// In-memory rate limit store (resets on cold start — acceptable for portfolio scale)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT) {
      const minutesLeft = Math.ceil((record.resetAt - now) / 60000);
      return Response.json(
        { error: `Rate limit exceeded. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.` },
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
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questions, selectedAnswers, score, totalPoints } = payload;
  const percentage = Math.round((score / totalPoints) * 100);

  const questionLines = questions.map((q, i) => {
    const userIdx = selectedAnswers[i] ?? -1;
    const options = [q.optionA, q.optionB, q.optionC, q.optionD];
    const userAnswer = userIdx >= 0 ? options[userIdx] : "Not answered";
    const correctAnswer = options[q.correctIndex];
    const correct = userIdx === q.correctIndex;
    return `Q${i + 1}: ${q.questionText}\nUser answered: ${userAnswer} (${correct ? "Correct" : "Wrong"})\nCorrect answer: ${correctAnswer}`;
  }).join("\n\n");

  const prompt = `A student scored ${score}/${totalPoints} (${percentage}%) on a quiz.\n\n${questionLines}\n\nProvide a brief performance review with:\n- 3-5 sentences on what the student did well\n- 3-5 sentences on areas to improve\n- 2-3 specific study suggestions\n\nBe concise and specific to the questions above.`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    });

    if (!groqResponse.ok) {
      return Response.json({ error: "AI review temporarily unavailable." }, { status: 502 });
    }

    const data = await groqResponse.json();
    const review = data.choices?.[0]?.message?.content;

    if (!review) {
      return Response.json({ error: "AI review temporarily unavailable." }, { status: 502 });
    }

    return Response.json({ review });
  } catch {
    return Response.json({ error: "AI review temporarily unavailable." }, { status: 502 });
  }
}
```
---PROMPT---

**Verify:** Deploy to Vercel preview. POST to `/api/ai-review` with a sample payload — confirm a review string is returned. Send 6 requests quickly — confirm the 6th returns 429 with the minutes-remaining message.

---

### COMMIT 6-B
**Commit:** `feat(hooks): useAIReview hook`

---PROMPT---
Create `src/hooks/useAIReview.ts`:

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
          error: "You've used your 5 free reviews this hour. Try again later, or use the export option below.",
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

**Verify:** Type-check passes. (Tests land in 6-D.)

---

### COMMIT 6-C
**Commit:** `feat(results): AI review section in QuizResults`

---PROMPT---
Update `src/components/quiz/QuizResults.tsx`. Read the full file before editing.

Add to `QuizResultsProps`:
```ts
questions: AppQuestion[];
selectedAnswers: Record<number, number>;
elapsedSeconds: number;
isAutoSubmit?: boolean;
timeLimit?: number | null;
```

At the top of the component, call `useAIReview`:
```ts
const { review, loading, error, getReview } = useAIReview();
```

Build the payload inside the component:
```ts
const { correctCount, earnedPoints, totalPoints } = /* already computed */;
const reviewPayload: AIReviewPayload = {
  questions,
  selectedAnswers,
  score: earnedPoints,
  totalPoints,
};
```

Add the AI review section inside the main card, below the score block and above the action buttons:
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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Review</p>
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
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{review}</p>
    </div>
  )}

  <p className="text-xs text-gray-500 mt-3 text-center">
    Or export manually to use with any AI tool
  </p>
</div>
```

Update the `QuizResults` call in `TakeQuiz.tsx` to pass `questions` and `selectedAnswers` (they are already available from `useTakeQuiz`).
---PROMPT---

**Verify:** Complete a quiz. AI review section appears below score. Clicking the button shows loading state then the review text. Copy and Regenerate buttons work. Rate limit message appears after 5 requests.

---

### COMMIT 6-D
**Commit:** `test(hooks): useAIReview with mocked fetch`

---PROMPT---
Create `src/hooks/useAIReview.test.ts`:

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
  it("sets review on successful response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({ review: "Great job!" }, 200)));
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.review).toBe("Great job!");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets rate limit error on 429", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({ error: "Rate limit" }, 429)));
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("5 free reviews");
  });

  it("sets generic error on other failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({ error: "Server error" }, 500)));
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("sets generic error on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const { result } = renderHook(() => useAIReview());
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("loading is true during request and false after", async () => {
    let resolve: (r: Response) => void;
    const pending = new Promise<Response>((res) => (resolve = res));
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));
    const { result } = renderHook(() => useAIReview());
    act(() => { result.current.getReview(PAYLOAD); });
    expect(result.current.loading).toBe(true);
    await act(() => { resolve!(makeResponse({ review: "Done" }, 200)); });
    expect(result.current.loading).toBe(false);
  });

  it("clearReview resets state", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse({ review: "Good" }, 200)));
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
Adds AI-powered quiz performance review: a Vercel Edge Function calling Groq's `llama-3.1-8b-instant` model with in-memory rate limiting (5 reviews/hour/IP), a `useAIReview` hook managing loading and error state, and a review section on the results screen with copy and regenerate actions.

**Changed files**
- `api/ai-review.ts` (new)
- `src/hooks/useAIReview.ts` (new)
- `src/components/quiz/QuizResults.tsx`
- `src/pages/TakeQuiz.tsx`
- `src/hooks/useAIReview.test.ts` (new)

**Checklist**
- [ ] `npm test` passes
- [ ] `npx tsc -b --noEmit` passes
- [ ] `GROQ_API_KEY` set in Vercel environment variables
- [ ] Deployed preview returns a review on POST to `/api/ai-review`
- [ ] Rate limit returns 429 after 5 requests
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

---

# PR-7 — Public Quiz Bank
**Branch:** `feat/quiz-bank`

```bash
git checkout main && git pull
git checkout -b feat/quiz-bank
```

> Prerequisite: run the Supabase migrations documented in `src/lib/types.ts` (from commit 7-A) in the Supabase dashboard before working on commits 7-B onward.

---

### COMMIT 7-A
**Commit:** `feat(types): quiz bank types, visibility, categories, and migration docs`

---PROMPT---
Update `src/lib/types.ts`. Add all quiz bank types and document the required migrations.

Add after existing exports:
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

export type QuizCategory = typeof QUIZ_CATEGORIES[number];

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
// -- RLS
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

**Verify:** `npx tsc -b --noEmit` passes. No runtime changes.

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
import { useState } from "react";
import { usePublishQuiz } from "../../hooks/usePublishQuiz";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type { QuizVisibility, QuizDifficulty, QuizCategory } from "../../lib/types";

interface PublishModalProps {
  quizId: string;
  currentVisibility: QuizVisibility;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VISIBILITY_OPTIONS: { value: QuizVisibility; label: string; desc: string }[] = [
  { value: "private", label: "Private", desc: "Only accessible via direct link" },
  { value: "unlisted", label: "Unlisted", desc: "Shareable but not in the Quiz Bank" },
  { value: "public", label: "Public", desc: "Listed in the Quiz Bank for anyone to discover" },
];

export default function PublishModal({
  quizId, currentVisibility, isOpen, onClose, onSuccess,
}: PublishModalProps) {
  const [visibility, setVisibility] = useState<QuizVisibility>(currentVisibility);
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);

  const { publish, loading } = usePublishQuiz(quizId, () => { onSuccess(); onClose(); });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <h3 className="text-xl font-bold text-white">Quiz Visibility</h3>

        <div className="space-y-2">
          {VISIBILITY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={category ?? ""}
                onChange={(e) => setCategory((e.target.value as QuizCategory) || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              >
                <option value="">No category</option>
                {QUIZ_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
              <select
                value={difficulty ?? ""}
                onChange={(e) => setDifficulty((e.target.value as QuizDifficulty) || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
              >
                <option value="">Not specified</option>
                {(["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium">
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

Wire `PublishModal` into `src/components/QuizCard.tsx`. Read the current file before editing. Add a `PublishModal` state and a "Publish" button in the actions row. The `QuizCard` needs to accept and display a `visibility` prop. Update the `QuizCardProps` interface and the call sites in `src/pages/Quizzes.tsx`.
---PROMPT---

**Verify:** Opening the publish modal, selecting Public + category + difficulty, clicking Save — updates the Supabase row (verify in dashboard). The card shows the new visibility.

---

### COMMIT 7-C
**Commit:** `feat(quiz-bank): useQuizBank hook and QuizBank page`

---PROMPT---
Create the quiz bank browser. Read `src/pages/Home.tsx`, `src/lib/types.ts`, and `src/components/QuizCard.tsx` for patterns before writing.

**Create `src/hooks/useQuizBank.ts`:**
```ts
import { useState, useEffect } from "react";
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
    category: null, difficulty: null, sort: "newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [filters.category, filters.difficulty, filters.sort]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("quizzes")
      .select("id, title, description, category, difficulty, times_taken, average_rating, created_at")
      .eq("visibility", "public");

    if (filters.category) query = query.eq("category", filters.category);
    if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

    switch (filters.sort) {
      case "popular": query = query.order("times_taken", { ascending: false }); break;
      case "rated": query = query.order("average_rating", { ascending: false }); break;
      case "newest": query = query.order("created_at", { ascending: false }); break;
      case "alphabetical": query = query.order("title", { ascending: true }); break;
    }

    const { data, error: fetchError } = await query;
    setLoading(false);

    if (fetchError) { setError(fetchError.message); return; }
    setAllQuizzes(data ?? []);
  };

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFiltersState((prev) => ({ ...prev, [key]: value }));

  const quizzes = searchQuery
    ? allQuizzes.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuizzes;

  return { quizzes, loading, error, filters, setFilter, searchQuery, setSearchQuery };
}
```

**Create `src/components/quiz-bank/QuizBankFilters.tsx`** — category dropdown, difficulty dropdown, sort select, and search input. Uses `setFilter` and `setSearchQuery` from `useQuizBank`. Follow existing input styling.

**Create `src/components/quiz-bank/QuizBankCard.tsx`** — shows title, category badge, difficulty badge, star rating (5 filled/empty stars, round `average_rating` to nearest 0.5), times taken. "Take Quiz" navigates to `/quiz/:id`. "Preview" button fetches first 3 questions from Supabase on click and shows them in a simple modal. Follow the glassmorphism card pattern from `QuizCard.tsx`.

**Create `src/pages/QuizBank.tsx`** — renders `QuizBankFilters` above a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` of `QuizBankCard`. Empty state when no results. Loading skeleton using existing `QuizSkeleton` if available, otherwise a simple "Loading..." text.

**Update `src/App.tsx`** — add public route:
```tsx
import QuizBank from "./pages/QuizBank";
// ...
<Route path="/quiz-bank" element={<QuizBank />} />
```

**Update `src/pages/Home.tsx`** — add a "Browse Quiz Bank" link in the button group:
```tsx
<Link
  to="/quiz-bank"
  className="group w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-semibold backdrop-blur-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
>
  Browse Quiz Bank
</Link>
```
---PROMPT---

**Verify:** Navigate to `/quiz-bank` unauthenticated. Published quizzes appear. Changing category/sort filters updates the list. Search filters by title. Clicking "Preview" shows first 3 questions. "Take Quiz" navigates correctly.

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
      .upsert({ quiz_id: quizId, user_id: user.id, rating }, { onConflict: "quiz_id,user_id" });

    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }

    // Update average_rating on the quiz
    const { data: ratings } = await supabase
      .from("quiz_ratings")
      .select("rating")
      .eq("quiz_id", quizId);

    if (ratings && ratings.length > 0) {
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      await supabase.from("quizzes").update({ average_rating: avg }).eq("id", quizId);
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
import { useState } from "react";
import { useRating } from "../../hooks/useRating";
import { useAuth } from "../../hooks/useAuth";

interface RatingWidgetProps {
  quizId: string;
}

export default function RatingWidget({ quizId }: RatingWidgetProps) {
  const { user } = useAuth();
  const { currentRating, loading, submitRating } = useRating(quizId);
  const [hovered, setHovered] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return <p className="text-sm text-gray-400">Sign in to rate this quiz</p>;
  }

  const handleRate = async (rating: number) => {
    await submitRating(rating);
    setSubmitted(true);
  };

  if (submitted || currentRating !== null) {
    return (
      <p className="text-sm text-gray-400">
        Your rating: {"★".repeat(currentRating ?? 0)}{"☆".repeat(5 - (currentRating ?? 0))} Thanks!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="text-2xl transition disabled:cursor-not-allowed"
        >
          <span className={(hovered ?? currentRating ?? 0) >= star ? "text-yellow-400" : "text-gray-600"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
```

Wire `RatingWidget` into `src/components/quiz/QuizResults.tsx`. Read the file before editing. Add it below the time display, only when `quiz.visibility === 'public'`. `QuizResults` needs to receive `quizVisibility` and `quizId` as props (it already has `quizId`; add `quizVisibility?: string`). Update the call in `TakeQuiz.tsx` to pass `quizVisibility={quiz.visibility}`.
---PROMPT---

**Verify:** Complete a public quiz while authenticated. Rating stars appear. Clicking a star submits the rating. Re-completing the quiz shows "Your rating: ★★★☆☆ Thanks!" (or similar). Private quiz shows no rating widget.

---

### COMMIT 7-E
**Commit:** `feat(dashboard): visibility badges and publish stats on QuizCard`

---PROMPT---
Update `src/components/QuizCard.tsx` and `src/hooks/useQuizzes.ts`. Read both files in full before editing.

**Update `useQuizzes.ts`:**
- Expand the local `Quiz` interface to include: `visibility: QuizVisibility`, `category: QuizCategory | null`, `difficulty: QuizDifficulty | null`, `times_taken: number`, `average_rating: number | null`.
- Import the types from `../lib/types`.
- The Supabase select already uses `*` so no query change needed, but update the interface to match.

**Update `QuizCard.tsx`:**
- Update `QuizCardProps` to accept the new fields.
- Add a visibility badge in the card header, right-aligned next to the title:
  ```tsx
  const VISIBILITY_COLORS: Record<QuizVisibility, string> = {
    private: "text-gray-400 bg-gray-400/10 border-gray-400/20",
    unlisted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    public: "text-green-400 bg-green-400/10 border-green-400/20",
  };
  // Render:
  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${VISIBILITY_COLORS[quiz.visibility ?? "private"]}`}>
    {quiz.visibility ?? "private"}
  </span>
  ```
- For public quizzes, add a stats row below the description:
  ```tsx
  {quiz.visibility === "public" && (
    <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
      <span>{quiz.times_taken} taken</span>
      {quiz.average_rating && <span>★ {quiz.average_rating.toFixed(1)}</span>}
    </div>
  )}
  ```
- Add a "Publish" button in the actions row that opens `PublishModal`. Add `PublishModal` import and state (`isPublishOpen`).
- After `PublishModal.onSuccess`, call `refetch` from `useQuizzes` to refresh the card.
---PROMPT---

**Verify:** Quiz list shows visibility badges. A public quiz shows its times_taken and average_rating. The Publish button opens the modal. Unpublishing via the modal (setting visibility to private) refreshes the card.

---

### COMMIT 7-F
**Commit:** `test(quiz-bank): useQuizBank filters and useRating upsert`

---PROMPT---
Create `src/hooks/useQuizBank.test.ts` and `src/hooks/useRating.test.ts`.

Mock Supabase as a chainable builder:
```ts
const mockQuery = {
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockResolvedValue({ error: null }),
  single: vi.fn().mockResolvedValue({ data: null }),
};

vi.mock("../lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
  },
}));
```

**`useQuizBank.test.ts`** cases:
```ts
it("queries only public quizzes (visibility = public)")
// Verify .eq was called with ("visibility", "public")

it("applies category filter when set")
// Call setFilter("category", "Science"), verify .eq("category", "Science") called

it("orders by times_taken desc for popular sort")
// Default sort is "newest". Change sort to "popular", verify .order("times_taken", { ascending: false })

it("orders by title asc for alphabetical sort")

it("client-side search filters by title substring")
// allQuizzes has [{title: "Math Quiz"}, {title: "Science Quiz"}]
// setSearchQuery("math") → quizzes has length 1
```

**`useRating.test.ts`** cases:
```ts
it("submitRating calls upsert with correct quiz_id, user_id, rating")
it("loading is true during submitRating and false after")
it("error state is set on Supabase upsert failure")
```
---PROMPT---

**Verify:** `npm test` passes all cases.

---

## PR-7 Description

**Summary**
Adds the public quiz bank: creators can publish quizzes with category and difficulty from their dashboard; a public `/quiz-bank` page lets anyone browse, filter, search, and preview published quizzes; post-completion star ratings update the quiz's average; creator dashboard cards show visibility, stats, and a publish/unpublish action.

**Changed files**
- `src/lib/types.ts`
- `src/hooks/usePublishQuiz.ts` (new)
- `src/components/quiz-bank/PublishModal.tsx` (new)
- `src/hooks/useQuizBank.ts` (new)
- `src/components/quiz-bank/QuizBankFilters.tsx` (new)
- `src/components/quiz-bank/QuizBankCard.tsx` (new)
- `src/pages/QuizBank.tsx` (new)
- `src/hooks/useRating.ts` (new)
- `src/components/quiz-bank/RatingWidget.tsx` (new)
- `src/hooks/useQuizzes.ts`
- `src/components/QuizCard.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/pages/TakeQuiz.tsx`
- `src/pages/Home.tsx`
- `src/App.tsx`
- `src/hooks/useQuizBank.test.ts` (new)
- `src/hooks/useRating.test.ts` (new)

**Checklist**
- [ ] Supabase migrations from 7-A run in dashboard
- [ ] `npm test` passes
- [ ] `npx tsc -b --noEmit` passes
- [ ] `/quiz-bank` accessible unauthenticated
- [ ] Publish flow updates Supabase row
- [ ] Rating upsert works and updates average
- [ ] No `console.log` statements
- [ ] Branch is up to date with `main`

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
Create `src/components/ErrorBoundary.tsx`. Error boundaries must be class components in React.

```tsx
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
            <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-gray-400">An unexpected error occurred. Please reload the page.</p>
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

**Update `src/main.tsx`** — wrap `<App />`:
```tsx
import ErrorBoundary from "./components/ErrorBoundary";
// ...
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Update `src/components/quiz/QuizResults.tsx`** — wrap only the AI review section in a tighter boundary:
```tsx
import ErrorBoundary from "../ErrorBoundary";
// ...
<ErrorBoundary fallback={<p className="text-sm text-gray-400 mt-4">AI review unavailable.</p>}>
  {/* AI review section JSX */}
</ErrorBoundary>
```
---PROMPT---

**Verify:** App still loads normally. Temporarily throw inside a component — confirm the fallback renders. Remove the throw. Confirm the AI review boundary doesn't affect the rest of the results page.

---

### COMMIT 8-B
**Commit:** `feat(ux): keyboard shortcuts during quiz taking`

---PROMPT---
Create `src/hooks/useQuizKeyboard.ts`:

```ts
import { useEffect } from "react";

interface QuizKeyboardProps {
  onSelectAnswer: (index: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancelModal: () => void;
  isActive: boolean;
}

export function useQuizKeyboard({
  onSelectAnswer, onNext, onSubmit, onCancelModal, isActive,
}: QuizKeyboardProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case "a": onSelectAnswer(0); break;
        case "b": onSelectAnswer(1); break;
        case "c": onSelectAnswer(2); break;
        case "d": onSelectAnswer(3); break;
        case "enter": onNext(); break;
        case "escape": onCancelModal(); break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onSelectAnswer, onNext, onSubmit, onCancelModal]);
}
```

Wire into `src/pages/TakeQuiz.tsx`. Read the file before editing. Add:
```ts
import { useQuizKeyboard } from "../hooks/useQuizKeyboard";
// ...
useQuizKeyboard({
  onSelectAnswer: handleAnswerSelect,
  onNext: goToNext,
  onSubmit: initiateSubmit,
  onCancelModal: cancelSubmit,
  isActive: !showResults,
});
```
---PROMPT---

**Verify:** During quiz taking — A/B/C/D selects the corresponding option; Enter advances to next question; Escape closes the submit modal when open. Shortcuts do nothing after results are shown. Typing in an input field does not trigger shortcuts.

---

### COMMIT 8-C
**Commit:** `feat(seo): document titles and OG meta tags`

---PROMPT---
**Create `src/hooks/useDocumentTitle.ts`:**
```ts
import { useEffect } from "react";

const DEFAULT_TITLE = "PREP — Quiz Builder & Study Tool";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
    return () => { document.title = DEFAULT_TITLE; };
  }, [title]);
}
```

**Update `index.html`** — set static fallback meta tags:
```html
<title>PREP — Quiz Builder & Study Tool</title>
<meta name="description" content="Create, share, and take quizzes. Build manually or upload a CSV. Get AI-powered performance reviews." />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="PREP" />
<meta property="og:title" content="PREP — Quiz Builder & Study Tool" />
<meta property="og:description" content="Create, share, and take quizzes. Build manually or upload a CSV." />
<!-- og:image: add /og-image.png before launch -->
```

**Update `src/pages/TakeQuiz.tsx`** — after quiz loads, set the title:
```ts
import { useDocumentTitle } from "../hooks/useDocumentTitle";
// ...
useDocumentTitle(quiz ? `${quiz.title} — PREP` : "PREP — Quiz Builder & Study Tool");
```

**Update `src/pages/QuizBank.tsx`:**
```ts
useDocumentTitle("Quiz Bank — PREP");
```

**Update `src/pages/Docs.tsx`** — set per-section titles:
```ts
const SECTION_TITLES: Record<string, string> = {
  "getting-started": "Getting Started — PREP Docs",
  "csv-guide": "CSV Guide — PREP Docs",
  "troubleshooting": "Troubleshooting — PREP Docs",
  "question-tips": "Question Tips — PREP Docs",
};
useDocumentTitle(SECTION_TITLES[section ?? "getting-started"] ?? "PREP Docs");
```
---PROMPT---

**Verify:** Navigating to a quiz URL shows the quiz title in the browser tab. `/quiz-bank` shows "Quiz Bank — PREP". `/docs/csv-guide` shows "CSV Guide — PREP Docs". Navigating away resets to the default.

---

### COMMIT 8-D
**Commit:** `perf: lazy load heavy pages and check bundle size`

---PROMPT---
Update `src/App.tsx`. Read the full file before editing.

Lazy-load `QuizBank`, `Docs`, and `CreateQuiz`. Import `lazy` and `Suspense` from react. Import `LoadingScreen` for the suspense fallback.

```tsx
import { lazy, Suspense } from "react";
import LoadingScreen from "./components/LoadingScreen";

const QuizBank = lazy(() => import("./pages/QuizBank"));
const Docs = lazy(() => import("./pages/Docs"));
const CreateQuiz = lazy(() => import("./pages/CreateQuiz"));
```

Wrap the route tree (or at least the lazy routes) in a `<Suspense fallback={<LoadingScreen />}>`.

The eager imports for `Home`, `TakeQuiz`, `Dashboard`, `MyQuizzes`, `AuthPage`, `TakeQuizInput` stay as-is — they are lightweight or auth-critical.

After updating, run `npm run build` and review the chunk output. If any single chunk exceeds 500kb, identify the cause — likely a large dependency. If so, add a `manualChunks` config to `vite.config.ts`:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom", "react-router-dom"],
      },
    },
  },
},
```
Only add `manualChunks` if the build output shows a chunk over 500kb.
---PROMPT---

**Verify:** `npm run build` completes with zero warnings about chunk size. Navigating to `/quiz-bank` and `/docs` in the browser shows `LoadingScreen` briefly then renders correctly.

---

### COMMIT 8-E
**Commit:** `test: coverage gap fill to 80% across all hooks and utils`

---PROMPT---
Run `npm run coverage` first. Read the full output before writing a single line of test code. Do not write tests for files already at or above 80%.

After reading the report, for each file below 80%:
1. Identify the exact uncovered lines or branches from the report.
2. Write the minimum tests needed to cover them.
3. Add them to the closest existing test file or create a new one if none exists.

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
it("createQuiz with empty title calls toast.error without calling Supabase insert")
it("createQuiz with valid title and auth calls Supabase insert")
it("uploadQuestions with empty questions array calls toast.error")
it("setQuestionsFromCSV with a valid File populates questions state")
```

Do not write tests for UI components — focus on hooks and utils only.
---PROMPT---

**Verify:** `npm run coverage` shows no file in `src/hooks/` or `src/utils/` below 80%.

---

## PR-8 Description

**Summary**
Final polish pass: `ErrorBoundary` wrapping the app and the AI review section specifically; keyboard shortcuts (A/B/C/D, Enter, Escape) during quiz taking; document titles and OG meta tags per route; lazy loading of `QuizBank`, `Docs`, and `CreateQuiz`; and a coverage gap fill pass to bring all hooks and utils to 80%+.

**Changed files**
- `src/components/ErrorBoundary.tsx` (new)
- `src/main.tsx`
- `src/components/quiz/QuizResults.tsx`
- `src/hooks/useQuizKeyboard.ts` (new)
- `src/pages/TakeQuiz.tsx`
- `src/hooks/useDocumentTitle.ts` (new)
- `index.html`
- `src/pages/QuizBank.tsx`
- `src/pages/Docs.tsx`
- `src/App.tsx`
- `vite.config.ts` (if chunk splitting needed)
- Various `*.test.ts` files for coverage gaps

**Checklist**
- [ ] `npm run build` zero warnings
- [ ] `npm run coverage` no file in hooks/ or utils/ below 80%
- [ ] `npx tsc -b --noEmit` passes
- [ ] `npx eslint src/` zero errors, zero warnings
- [ ] Keyboard shortcuts work during quiz taking
- [ ] Document titles correct on all routes
- [ ] No `console.log` statements (except ErrorBoundary's intentional one)
- [ ] Branch is up to date with `main`