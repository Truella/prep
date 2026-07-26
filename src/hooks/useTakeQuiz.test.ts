import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useTakeQuiz } from "./useTakeQuiz";
import toast from "react-hot-toast";

const { mockQuizData, mockQuestionsData } = vi.hoisted(() => ({
	mockQuizData: { id: "quiz1", title: "Test Quiz", description: "" },
	mockQuestionsData: [
		{ id: "q1", quiz_id: "quiz1", Question: "What is 2+2?", Option_A: "1", Option_B: "2", Option_C: "3", Option_D: "4", Correct_Answer: "D", Points: 1, created_at: "" },
		{ id: "q2", quiz_id: "quiz1", Question: "Capital of France?", Option_A: "Berlin", Option_B: "Paris", Option_C: "Rome", Option_D: "Madrid", Correct_Answer: "B", Points: 2, created_at: "" },
	],
}));

function createChain(resolveValue: object) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const chain: any = {};
	const promise = Promise.resolve(resolveValue);
	chain.select = vi.fn(() => chain);
	chain.eq = vi.fn(() => chain);
	chain.single = vi.fn(() => chain);
	chain.order = vi.fn(() => chain);
	chain.then = promise.then.bind(promise);
	chain.catch = promise.catch.bind(promise);
	chain.finally = promise.finally.bind(promise);
	return chain;
}

vi.mock("../lib/supabase", () => ({
	supabase: {
		from: vi.fn(),
	},
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(async () => {
	vi.clearAllMocks();
	localStorage.clear();

	const { supabase } = await import("../lib/supabase");
	// First call to from("quizzes") returns quiz data, second call from("questions") returns questions data
	vi.mocked(supabase.from)
		.mockReturnValueOnce(createChain({ data: mockQuizData, error: null }))
		.mockReturnValueOnce(createChain({ data: mockQuestionsData, error: null }));
});

describe("useTakeQuiz", () => {
	it("calculateScore returns full points when all answers match correctIndex", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.goToNext());
		act(() => result.current.handleAnswerSelect(1));

		const score = result.current.calculateScore();
		expect(score.correctCount).toBe(2);
		expect(score.earnedPoints).toBe(3);
		expect(score.totalPoints).toBe(3);
	});

	it("calculateScore returns zero when all answers are wrong", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(0));
		act(() => result.current.goToNext());
		act(() => result.current.handleAnswerSelect(0));

		const score = result.current.calculateScore();
		expect(score.correctCount).toBe(0);
		expect(score.earnedPoints).toBe(0);
		expect(score.totalPoints).toBe(3);
	});

	it("calculateScore returns partial score for mixed answers", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.goToNext());
		act(() => result.current.handleAnswerSelect(0));

		const score = result.current.calculateScore();
		expect(score.correctCount).toBe(1);
		expect(score.earnedPoints).toBe(1);
		expect(score.totalPoints).toBe(3);
	});

	it("answeredCount reflects number of selected answers", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.answeredCount).toBe(0);

		act(() => result.current.handleAnswerSelect(3));
		expect(result.current.answeredCount).toBe(1);

		act(() => result.current.goToNext());
		act(() => result.current.handleAnswerSelect(1));
		expect(result.current.answeredCount).toBe(2);
	});

	it("unansweredCount equals total questions minus answeredCount", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.unansweredCount).toBe(2);

		act(() => result.current.handleAnswerSelect(3));
		expect(result.current.unansweredCount).toBe(1);
	});

	it("initiateSubmit with zero answers calls toast.error and does not set showSubmitModal to true", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.initiateSubmit());
		expect(toast.error).toHaveBeenCalledWith("Answer at least one question before submitting");
		expect(result.current.showSubmitModal).toBe(false);
	});

	it("confirmSubmit sets showResults true", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.initiateSubmit());
		expect(result.current.showSubmitModal).toBe(true);

		act(() => result.current.confirmSubmit());
		expect(result.current.showResults).toBe(true);
	});

	it("cancelSubmit sets showSubmitModal false", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.initiateSubmit());
		expect(result.current.showSubmitModal).toBe(true);

		act(() => result.current.cancelSubmit());
		expect(result.current.showSubmitModal).toBe(false);
	});

	it("resetQuiz clears selectedAnswers, resets currentQuestionIndex to 0, sets showResults false, and clears progress", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));

		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));

		localStorage.setItem("quiz_progress_quiz1", "should-be-removed");

		act(() => result.current.resetQuiz());
		expect(result.current.showResults).toBe(false);
		expect(result.current.currentQuestionIndex).toBe(0);
		expect(result.current.selectedAnswers).toEqual({});
		expect(localStorage.getItem("quiz_progress_quiz1")).toBeNull();
	});

	it("returns error when quizId is undefined", async () => {
		const { result } = renderHook(() => useTakeQuiz(undefined));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe("No quiz ID provided");
	});

	it("handles fetch error from supabase", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReset();
		vi.mocked(supabase.from)
			.mockReturnValueOnce(createChain({ data: null, error: new Error("DB error") }))
			.mockReturnValueOnce(createChain({ data: mockQuestionsData, error: null }));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe("DB error");
		expect(toast.error).toHaveBeenCalledWith("DB error");
	});

	it("handles quiz with no questions", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReset();
		vi.mocked(supabase.from)
			.mockReturnValueOnce(createChain({ data: mockQuizData, error: null }))
			.mockReturnValueOnce(createChain({ data: [], error: null }));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe("This quiz has no questions");
	});

	it("restores saved results from localStorage on load", async () => {
		const savedResults = {
			answers: { 0: 3 },
			elapsedSeconds: 42,
			isAutoSubmit: false,
		};
		localStorage.setItem("quiz_results_quiz1", JSON.stringify(savedResults));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.showResults).toBe(true);
		expect(result.current.selectedAnswers).toEqual({ 0: 3 });
		expect(result.current.elapsedSeconds).toBe(42);
	});

	it("sets timer when quiz has time_limit", async () => {
		const quizWithTimer = { ...mockQuizData, time_limit: 10 };
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReset();
		vi.mocked(supabase.from)
			.mockReturnValueOnce(createChain({ data: quizWithTimer, error: null }))
			.mockReturnValueOnce(createChain({ data: mockQuestionsData, error: null }));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.timerSeconds).toBeGreaterThan(0);
	});

	it("resets deadline when stored deadline is in the past", async () => {
		const quizWithTimer = { ...mockQuizData, time_limit: 10 };

		localStorage.setItem("quiz_deadline_quiz1", "1");

		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReset();
		vi.mocked(supabase.from)
			.mockReturnValueOnce(createChain({ data: quizWithTimer, error: null }))
			.mockReturnValueOnce(createChain({ data: mockQuestionsData, error: null }));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.timerSeconds).toBeGreaterThan(0);
		expect(result.current.showResults).toBe(false);
	});

	it("handleTimerExpire saves results and shows results screen", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.handleTimerExpire());

		expect(result.current.showResults).toBe(true);
		expect(result.current.isAutoSubmit).toBe(true);
		expect(result.current.elapsedSeconds).toBeGreaterThanOrEqual(0);

		const saved = JSON.parse(localStorage.getItem("quiz_results_quiz1")!);
		expect(saved.answers).toEqual({ 0: 3 });
		expect(saved.isAutoSubmit).toBe(true);
	});

	it("resetQuiz with time_limit resets timerSeconds", async () => {
		const quizWithTimer = { ...mockQuizData, time_limit: 10 };
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReset();
		vi.mocked(supabase.from)
			.mockReturnValueOnce(createChain({ data: quizWithTimer, error: null }))
			.mockReturnValueOnce(createChain({ data: mockQuestionsData, error: null }));

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.timerSeconds).toBeGreaterThan(0);

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.handleTimerExpire());
		expect(result.current.showResults).toBe(true);

		act(() => result.current.resetQuiz());
		expect(result.current.showResults).toBe(false);
		expect(result.current.timerSeconds).toBeGreaterThan(0);
		expect(result.current.timerSeconds).toEqual(600);
	});

	it("goToPrevious does not go before first question", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.currentQuestionIndex).toBe(0);
		act(() => result.current.goToPrevious());
		expect(result.current.currentQuestionIndex).toBe(0);
	});

	it("goToNext does not advance past last question", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.goToNext());
		act(() => result.current.goToNext());
		act(() => result.current.goToNext());
		expect(result.current.currentQuestionIndex).toBe(1);
	});

	it("goToQuestion navigates to the specified index", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.goToQuestion(1));
		expect(result.current.currentQuestionIndex).toBe(1);
	});

	it("goToPrevious goes back one question when not at start", async () => {
		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.goToNext());
		expect(result.current.currentQuestionIndex).toBe(1);
		act(() => result.current.goToPrevious());
		expect(result.current.currentQuestionIndex).toBe(0);
	});

	it("confirmSubmit handles localStorage.setItem failure gracefully", async () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
			throw new Error("Storage full");
		});

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.initiateSubmit());
		act(() => result.current.confirmSubmit());

		expect(result.current.showResults).toBe(true);
	});

	it("handleTimerExpire handles localStorage.setItem failure gracefully", async () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
			throw new Error("Storage full");
		});

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => result.current.handleAnswerSelect(3));
		act(() => result.current.handleTimerExpire());

		expect(result.current.showResults).toBe(true);
	});

	it("restores progress from localStorage on second useEffect", async () => {
		localStorage.setItem(
			"quiz_progress_quiz1",
			JSON.stringify({ answers: { 0: 3 }, currentIndex: 0, timestamp: Date.now() })
		);

		const { result } = renderHook(() => useTakeQuiz("quiz1"));
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.selectedAnswers).toEqual({ 0: 3 });
		expect(toast.success).toHaveBeenCalledWith("Progress restored!");
	});
});
