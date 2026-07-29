import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import { useCreateQuiz } from "./useCreateQuiz";
import type { AppQuestion } from "../lib/types";

vi.mock("../lib/supabase", () => ({
	supabase: {
		auth: { getUser: vi.fn() },
		from: vi.fn(),
	},
}));

vi.mock("../utils/csvParser", () => ({
	parseAndValidateCSV: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

const question: AppQuestion = {
	id: "temp-0",
	quizId: "quiz-1",
	questionText: "Question?",
	optionA: "A",
	optionB: "B",
	optionC: "C",
	optionD: "D",
	correctIndex: 0,
	points: 1,
	order: 0,
};

function createQuizInsert(data = { id: "quiz-1", code: null }) {
	return {
		insert: vi.fn(() => ({
			select: vi.fn(() => ({
				single: vi.fn().mockResolvedValue({ data, error: null }),
			})),
		})),
	};
}

describe("useCreateQuiz", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		localStorage.clear();
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.auth.getUser).mockResolvedValue({
			data: { user: { id: "user-1" } },
			error: null,
		} as never);
	});

	it("always starts with blank metadata", () => {
		localStorage.setItem("quiz_meta_draft", JSON.stringify({ title: "Stale" }));
		const { result } = renderHook(() => useCreateQuiz());
		expect(result.current.quiz).toEqual({ title: "", description: "" });
	});

	it("creates a draft without a code", async () => {
		const { supabase } = await import("../lib/supabase");
		const source = createQuizInsert();
		vi.mocked(supabase.from).mockReturnValue(source as never);
		const { result } = renderHook(() => useCreateQuiz());

		act(() => result.current.setTitle("Lifecycle Quiz"));
		await act(() => result.current.createQuiz());

		expect(source.insert).toHaveBeenCalledWith(expect.objectContaining({
			title: "Lifecycle Quiz",
			status: "draft",
			code: null,
		}));
		expect(result.current.quiz.status).toBe("draft");
		expect(result.current.quizCode).toBeNull();
	});

	it("rejects creation without a title", async () => {
		const { supabase } = await import("../lib/supabase");
		const { result } = renderHook(() => useCreateQuiz());
		await act(() => result.current.createQuiz());
		expect(toast.error).toHaveBeenCalledWith("Quiz title is required");
		expect(supabase.from).not.toHaveBeenCalled();
	});

	it("saves questions while keeping the quiz as a draft", async () => {
		const { supabase } = await import("../lib/supabase");
		const quizSource = createQuizInsert();
		const questionInsert = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabase.from)
			.mockReturnValueOnce(quizSource as never)
			.mockReturnValueOnce({ insert: questionInsert } as never);
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Draft Quiz"));
		await act(() => result.current.createQuiz());

		let saved = false;
		await act(async () => {
			saved = await result.current.saveAsDraft([question]);
		});

		expect(saved).toBe(true);
		expect(questionInsert).toHaveBeenCalledOnce();
		expect(result.current.shareableLink).toBeNull();
		expect(result.current.quizCode).toBeNull();
	});

	it("publishes with settings, a code, and a shareable link", async () => {
		const { supabase } = await import("../lib/supabase");
		const quizSource = createQuizInsert();
		const questionInsert = vi.fn().mockResolvedValue({ error: null });
		const update = vi.fn(() => ({
			eq: vi.fn(() => ({
				eq: vi.fn(() => ({
					select: vi.fn(() => ({
						single: vi.fn().mockResolvedValue({
							data: { id: "quiz-1", code: "ABC234" },
							error: null,
						}),
					})),
				})),
			})),
		}));
		vi.mocked(supabase.from)
			.mockReturnValueOnce(quizSource as never)
			.mockReturnValueOnce({ insert: questionInsert } as never)
			.mockReturnValueOnce({ update } as never);
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Published Quiz"));
		await act(() => result.current.createQuiz());

		let published = false;
		await act(async () => {
			published = await result.current.publishQuiz([question], {
				visibility: "public",
				category: "Science",
				difficulty: "Beginner",
			});
		});

		expect(published).toBe(true);
		expect(update).toHaveBeenCalledWith(expect.objectContaining({
			status: "published",
			visibility: "public",
			category: "Science",
			difficulty: "Beginner",
		}));
		expect(result.current.quizCode).toBe("ABC234");
		expect(result.current.shareableLink).toContain("/quiz/quiz-1");
	});

	it("reset clears lifecycle state and stale drafts", () => {
		localStorage.setItem("quiz_meta_draft", "stale");
		localStorage.setItem("quiz_builder_draft", "stale");
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Changed"));
		act(() => result.current.reset());
		expect(result.current.quiz).toEqual({ title: "", description: "" });
		expect(localStorage.getItem("quiz_meta_draft")).toBeNull();
		expect(localStorage.getItem("quiz_builder_draft")).toBeNull();
	});
});
