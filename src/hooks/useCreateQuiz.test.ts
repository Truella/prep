import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useCreateQuiz } from "./useCreateQuiz";
import toast from "react-hot-toast";
import type { MCQRow } from "../lib/types";
import type { AppQuestion } from "../lib/types";

function makeQuestion(overrides: Partial<AppQuestion> = {}): AppQuestion {
	return {
		id: "temp-0",
		quizId: "quiz1",
		questionText: "Q",
		optionA: "A",
		optionB: "B",
		optionC: "C",
		optionD: "D",
		correctIndex: 0 as const,
		points: 1,
		order: 0,
		...overrides,
	};
}

async function mockCreateQuizFlow() {
	const { supabase } = await import("../lib/supabase");
	vi.mocked(supabase.auth.getUser).mockResolvedValue({
		data: { user: { id: "user1" } },
		error: null,
	} as never);
	const insertChain = {
		select: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: { id: "quiz1" }, error: null }),
	};
	vi.mocked(supabase.from).mockReturnValue({
		insert: vi.fn(() => insertChain),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any);
	return { supabase };
}

vi.mock("../lib/supabase", () => ({
	supabase: {
		auth: {
			getUser: vi.fn(),
		},
		from: vi.fn(),
	},
}));

vi.mock("../utils/csvParser", () => ({
	parseAndValidateCSV: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
});

describe("useCreateQuiz", () => {
	it("createQuiz with empty title calls toast.error without calling supabase", async () => {
		const { supabase } = await import("../lib/supabase");
		const { result } = renderHook(() => useCreateQuiz());

		await act(async () => {
			await result.current.createQuiz();
		});

		expect(toast.error).toHaveBeenCalledWith("Quiz title is required");
		expect(supabase.from).not.toHaveBeenCalled();
	});

	it("createQuiz with valid title and authenticated user calls supabase.insert", async () => {
		const { supabase } = await mockCreateQuizFlow();

		const { result } = renderHook(() => useCreateQuiz());

		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		expect(supabase.from).toHaveBeenCalledWith("quizzes");
		expect(toast.success).toHaveBeenCalledWith("Quiz created! Now upload questions.");
	});

	it("createQuiz when not authenticated calls toast.error", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.auth.getUser).mockResolvedValue({
			data: { user: null },
			error: null,
		} as never);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		expect(toast.error).toHaveBeenCalledWith("You must be logged in to create a quiz");
	});

	it("uploadQuestions with empty questions array calls toast.error", async () => {
		await mockCreateQuizFlow();

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		await act(async () => {
			await result.current.uploadQuestions([]);
		});

		expect(toast.error).toHaveBeenCalledWith("Quiz ID missing or no questions to upload");
	});

	it("uploadQuestions with questions succeeds and sets shareableLink", async () => {
		const { supabase } = await mockCreateQuizFlow();

		const fromFn = vi.fn();
		vi.mocked(supabase.from).mockImplementation(fromFn);

		fromFn.mockReturnValue({
			insert: vi.fn(() => ({
				select: vi.fn(() => ({
					single: vi.fn().mockResolvedValue({ data: { id: "quiz1" }, error: null }),
				})),
			})),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		fromFn.mockReset();
		fromFn.mockReturnValue({
			insert: vi.fn().mockResolvedValue({ error: null }),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		await act(async () => {
			const ok = await result.current.uploadQuestions([makeQuestion()]);
			expect(ok).toBe(true);
		});

		expect(result.current.shareableLink).toContain("/quiz/quiz1");
	});

	it("uploadQuestions when already published calls toast.error", async () => {
		const { supabase } = await mockCreateQuizFlow();

		const fromFn = vi.fn();
		vi.mocked(supabase.from).mockImplementation(fromFn);

		fromFn.mockReturnValue({
			insert: vi.fn(() => ({
				select: vi.fn(() => ({
					single: vi.fn().mockResolvedValue({ data: { id: "quiz1" }, error: null }),
				})),
			})),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		fromFn.mockReset();
		fromFn.mockReturnValue({
			insert: vi.fn().mockResolvedValue({ error: null }),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		await act(async () => {
			await result.current.uploadQuestions([makeQuestion()]);
		});

		await act(async () => {
			const ok = await result.current.uploadQuestions([makeQuestion()]);
			expect(ok).toBe(false);
		});
		expect(toast.error).toHaveBeenCalledWith("Quiz already published");
	});

	it("reset clears all state", async () => {
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("Some Title"));
		act(() => result.current.setDescription("Desc"));
		act(() => result.current.setTimeLimit(10));
		act(() => result.current.reset());

		expect(result.current.quiz.title).toBe("");
		expect(result.current.quiz.description).toBe("");
		expect(result.current.timeLimit).toBeNull();
		expect(result.current.questions).toEqual([]);
		expect(result.current.shareableLink).toBeNull();
	});

	it("updateQuizMeta saves to localStorage and updates quiz state", () => {
		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.updateQuizMeta({ title: "Meta Title", description: "Meta Desc" }));
		expect(result.current.quiz.title).toBe("Meta Title");
		expect(result.current.quiz.description).toBe("Meta Desc");
		const saved = JSON.parse(localStorage.getItem("quiz_meta_draft")!);
		expect(saved.title).toBe("Meta Title");
	});

	it("setQuestionsFromCSV parses a CSV file and loads questions", async () => {
		const { parseAndValidateCSV } = await import("../utils/csvParser");
		vi.mocked(parseAndValidateCSV).mockResolvedValue({
			success: true,
			data: [
				{
					Question: "Q1",
					Option_A: "A",
					Option_B: "B",
					Option_C: "C",
					Option_D: "D",
					Correct_Answer: "D",
					Points: "1",
				},
			] as MCQRow[],
		});

		const { supabase } = await mockCreateQuizFlow();
		const fromFn = vi.fn();
		vi.mocked(supabase.from).mockImplementation(fromFn);
		fromFn.mockReturnValue({
			insert: vi.fn(() => ({
				select: vi.fn(() => ({
					single: vi.fn().mockResolvedValue({ data: { id: "quiz1" }, error: null }),
				})),
			})),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));
		await act(async () => { await result.current.createQuiz(); });

		await act(async () => {
			await result.current.setQuestionsFromCSV(new File(["dummy"], "test.csv"));
		});

		expect(result.current.questions).toHaveLength(1);
		expect(result.current.questions[0].questionText).toBe("Q1");
		expect(toast.success).toHaveBeenCalledWith("1 questions loaded");
	});

	it("setQuestionsFromCSV shows toast on parse failure", async () => {
		const { parseAndValidateCSV } = await import("../utils/csvParser");
		vi.mocked(parseAndValidateCSV).mockResolvedValue({
			success: false,
			message: "Invalid CSV format",
		});

		const { result } = renderHook(() => useCreateQuiz());

		await act(async () => {
			await result.current.setQuestionsFromCSV(new File(["bad"], "test.csv"));
		});

		expect(toast.error).toHaveBeenCalledWith("Invalid CSV format");
		expect(result.current.questions).toHaveLength(0);
	});

	it("uploadQuestions returns false when supabase insert fails", async () => {
		const { supabase } = await mockCreateQuizFlow();
		const fromFn = vi.fn();
		vi.mocked(supabase.from).mockImplementation(fromFn);

		fromFn.mockReturnValue({
			insert: vi.fn(() => ({
				select: vi.fn(() => ({
					single: vi.fn().mockResolvedValue({ data: { id: "quiz1" }, error: null }),
				})),
			})),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));
		await act(async () => { await result.current.createQuiz(); });

		fromFn.mockReset();
		fromFn.mockReturnValue({
			insert: vi.fn().mockResolvedValue({ error: { message: "DB Error" } }),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		await act(async () => {
			const ok = await result.current.uploadQuestions([makeQuestion()]);
			expect(ok).toBe(false);
		});
		expect(toast.error).toHaveBeenCalledWith("Failed to save questions: DB Error");
	});

	it("createQuiz handles insert returning no id", async () => {
		const { supabase } = await mockCreateQuizFlow();
		const chain = {
			select: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: null }),
		};
		vi.mocked(supabase.from).mockReturnValue({
			insert: vi.fn(() => chain),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		expect(toast.error).toHaveBeenCalledWith("Failed to create quiz");
	});

	it("createQuiz handles insert error", async () => {
		const { supabase } = await mockCreateQuizFlow();
		const insertChain = {
			select: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: { message: "Insert failed" } }),
		};
		vi.mocked(supabase.from).mockReturnValue({
			insert: vi.fn(() => insertChain),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

		const { result } = renderHook(() => useCreateQuiz());
		act(() => result.current.setTitle("My Quiz"));

		await act(async () => {
			await result.current.createQuiz();
		});

		expect(toast.error).toHaveBeenCalledWith("Failed to create quiz");
	});
});
