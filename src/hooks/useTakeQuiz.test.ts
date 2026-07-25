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

vi.mock("../lib/supabase", () => ({
	supabase: {
		from: vi.fn((table: string) => {
			if (table === "quizzes") {
				return {
					select: vi.fn().mockReturnThis(),
					eq: vi.fn().mockReturnThis(),
					single: vi.fn().mockResolvedValue({ data: mockQuizData, error: null }),
				};
			}
			return {
				select: vi.fn().mockReturnThis(),
				eq: vi.fn().mockResolvedValue({ data: mockQuestionsData, error: null }),
			};
		}),
	},
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
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
});
