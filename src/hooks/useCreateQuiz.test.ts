import { act, renderHook, waitFor } from "@testing-library/react";
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
		const questionInsert = vi.fn().mockResolvedValue({
			data: [{ id: "saved-question-1", quiz_id: "quiz-1", Question: "Question?", Option_A: "A", Option_B: "B", Option_C: "C", Option_D: "D", Correct_Answer: "A", Points: 1, created_at: "" }],
			error: null,
		});
		vi.mocked(supabase.from)
			.mockReturnValueOnce(quizSource as never)
			.mockReturnValueOnce({ insert: () => ({ select: () => questionInsert() }) } as never);
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

	it("does not reinsert resumed questions and inserts only new questions", async () => {
		const { supabase } = await import("../lib/supabase");
		const existingQuestion: AppQuestion = { ...question, id: "db-question-1" };
		const newQuestion: AppQuestion = { ...question, id: "draft-new-1", questionText: "New question?", order: 1 };
		const questionInsert = vi.fn().mockResolvedValue({
			data: [{ id: "db-question-2", quiz_id: "quiz-1", Question: "New question?", Option_A: "A", Option_B: "B", Option_C: "C", Option_D: "D", Correct_Answer: "A", Points: 1, created_at: "" }],
			error: null,
		});
		vi.mocked(supabase.from).mockReturnValueOnce(createQuizInsert() as never).mockReturnValueOnce({
			insert: vi.fn(() => ({ select: questionInsert })),
		} as never);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Resumed Quiz"));
		await act(() => result.current.createQuiz());
		await act(async () => {
			await result.current.saveAsDraft([existingQuestion, newQuestion]);
		});

		expect(questionInsert).toHaveBeenCalledOnce();
		expect(questionInsert).toHaveBeenCalledWith();
		expect(result.current.questions.map((item) => item.id)).toEqual([
			"db-question-1",
			"db-question-2",
		]);
	});

	it("publishes unchanged resumed questions without inserting them again", async () => {
		const { supabase } = await import("../lib/supabase");
		const existingQuestion: AppQuestion = { ...question, id: "db-question-1" };
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
			.mockReturnValueOnce(createQuizInsert() as never)
			.mockReturnValueOnce({ update } as never);
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Resumed Quiz"));
		await act(() => result.current.createQuiz());

		await act(async () => {
			await result.current.publishQuiz([existingQuestion], {
				visibility: "private",
				category: null,
				difficulty: null,
			});
		});

		expect(supabase.from).toHaveBeenCalledTimes(2);
		expect(supabase.from).not.toHaveBeenCalledWith("questions");
		expect(update).toHaveBeenCalledOnce();
	});

	it("publishes with settings, a code, and a shareable link", async () => {
		const { supabase } = await import("../lib/supabase");
		const quizSource = createQuizInsert();
		const questionInsert = vi.fn().mockResolvedValue({
			data: [{ id: "saved-question-1", quiz_id: "quiz-1", Question: "Question?", Option_A: "A", Option_B: "B", Option_C: "C", Option_D: "D", Correct_Answer: "A", Points: 1, created_at: "" }],
			error: null,
		});
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
			.mockReturnValueOnce({ insert: vi.fn(() => ({ select: questionInsert })) } as never)
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

	describe("resume", () => {
		it("shows loading state when resumeQuizId is provided", async () => {
			const { supabase } = await import("../lib/supabase");
			const single = vi.fn().mockResolvedValue({ data: null, error: null });
			const eq3 = vi.fn(() => ({ single }));
			const eq2 = vi.fn(() => ({ eq: eq3 }));
			const eq1 = vi.fn(() => ({ eq: eq2 }));
			vi.mocked(supabase.from).mockReturnValue({
				select: vi.fn(() => ({ eq: eq1 })),
			} as never);
			const { result } = renderHook(() => useCreateQuiz("draft-1"));
			expect(result.current.isLoadingDraft).toBe(true);
		});

		it("loads draft quiz metadata and questions", async () => {
			const { supabase } = await import("../lib/supabase");
			const draftData = { id: "draft-1", title: "Resumed", description: "", time_limit: null, visibility: "private", category: null, difficulty: null, status: "draft", code: null };
			const quizSingle = vi.fn().mockResolvedValue({ data: draftData, error: null });
			const quizEq3 = vi.fn(() => ({ single: quizSingle }));
			const quizEq2 = vi.fn(() => ({ eq: quizEq3 }));
			const quizEq1 = vi.fn(() => ({ eq: quizEq2 }));
			const quizSelect = vi.fn(() => ({ eq: quizEq1 }));
			const questionsResult = { data: [], error: null };
			const questionsOrder = vi.fn(() => (questionsResult));
			const questionsEq = vi.fn(() => ({ order: questionsOrder }));
			const questionsSelect = vi.fn(() => ({ eq: questionsEq }));
			vi.mocked(supabase.from)
				.mockReturnValueOnce({ select: quizSelect } as never)
				.mockReturnValueOnce({ select: questionsSelect } as never);

			vi.mocked(supabase.auth.getUser).mockResolvedValue({
				data: { user: { id: "user-1" } },
				error: null,
			} as never);

			const { result } = renderHook(() => useCreateQuiz("draft-1"));

			await waitFor(() => expect(result.current.isLoadingDraft).toBe(false));
			expect(result.current.quiz.title).toBe("Resumed");
			expect(result.current.questions).toEqual([]);
		});

		it("shows error toast on auth failure", async () => {
			const { supabase } = await import("../lib/supabase");
			vi.mocked(supabase.auth.getUser).mockResolvedValue({
				data: { user: null },
				error: { message: "Not authenticated" },
			} as never);

			const { result } = renderHook(() => useCreateQuiz("draft-1"));

			await waitFor(() => expect(result.current.isLoadingDraft).toBe(false));
			expect(toast.error).toHaveBeenCalledWith("You must be logged in to resume a draft");
		});

		it("shows error toast when draft not found", async () => {
			const { supabase } = await import("../lib/supabase");
			vi.mocked(supabase.auth.getUser).mockResolvedValue({
				data: { user: { id: "user-1" } },
				error: null,
			} as never);
			const single = vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } });
			const quizEq = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ single })) })) }));
			vi.mocked(supabase.from).mockReturnValueOnce({
				select: vi.fn(() => ({ eq: quizEq })),
			} as never);

			const { result } = renderHook(() => useCreateQuiz("draft-1"));

			await waitFor(() => expect(result.current.isLoadingDraft).toBe(false));
			expect(toast.error).toHaveBeenCalledWith("Draft not found or you do not have access");
		});
	});
});
