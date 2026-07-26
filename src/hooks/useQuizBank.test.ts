import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useQuizBank } from "./useQuizBank";

function createQueryChain(resolveValue: object) {
	const promise = Promise.resolve(resolveValue);
	const chain: {
		select: ReturnType<typeof vi.fn>;
		eq: ReturnType<typeof vi.fn>;
		order: ReturnType<typeof vi.fn>;
		then: Promise<object>["then"];
		catch: Promise<object>["catch"];
		finally: Promise<object>["finally"];
	} = {
		select: vi.fn(() => chain),
		eq: vi.fn(() => chain),
		order: vi.fn(() => chain),
		then: promise.then.bind(promise),
		catch: promise.catch.bind(promise),
		finally: promise.finally.bind(promise),
	};
	return chain as any;
}

vi.mock("../lib/supabase", () => ({
	supabase: { from: vi.fn() },
}));

const MOCK_QUIZZES = [
	{
		id: "1",
		title: "Math Quiz",
		description: "",
		category: "Mathematics",
		difficulty: "Beginner",
		times_taken: 10,
		average_rating: 4.5,
		created_at: "2024-01-01T00:00:00Z",
	},
	{
		id: "2",
		title: "Science Quiz",
		description: "",
		category: "Science",
		difficulty: "Advanced",
		times_taken: 5,
		average_rating: 3.0,
		created_at: "2024-01-02T00:00:00Z",
	},
];

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useQuizBank", () => {
	it("includes visibility = public filter in every query", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(
			createQueryChain({ data: [], error: null })
		);
		renderHook(() => useQuizBank());
		await act(async () => {});
		const chain = vi.mocked(supabase.from).mock.results[0].value;
		expect(chain.eq).toHaveBeenCalledWith("visibility", "public");
	});

	it("adds category filter when category is set", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(
			createQueryChain({ data: [], error: null })
		);
		const { result } = renderHook(() => useQuizBank());
		await act(async () => {});
		act(() => {
			result.current.setFilter("category", "Science");
		});
		await act(async () => {});
		const chain = vi.mocked(supabase.from).mock.results[0].value;
		expect(chain.eq).toHaveBeenCalledWith("category", "Science");
	});

	it("orders by times_taken descending for popular sort", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(
			createQueryChain({ data: [], error: null })
		);
		const { result } = renderHook(() => useQuizBank());
		await act(async () => {});
		act(() => {
			result.current.setFilter("sort", "popular");
		});
		await act(async () => {});
		const chain = vi.mocked(supabase.from).mock.results[0].value;
		expect(chain.order).toHaveBeenCalledWith("times_taken", {
			ascending: false,
		});
	});

	it("orders by title ascending for alphabetical sort", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(
			createQueryChain({ data: [], error: null })
		);
		const { result } = renderHook(() => useQuizBank());
		await act(async () => {});
		act(() => {
			result.current.setFilter("sort", "alphabetical");
		});
		await act(async () => {});
		const chain = vi.mocked(supabase.from).mock.results[0].value;
		expect(chain.order).toHaveBeenCalledWith("title", {
			ascending: true,
		});
	});

	it("client-side search returns only quizzes matching the query substring", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(
			createQueryChain({ data: MOCK_QUIZZES, error: null })
		);
		const { result } = renderHook(() => useQuizBank());
		await act(async () => {});
		act(() => {
			result.current.setSearchQuery("math");
		});
		expect(result.current.quizzes).toHaveLength(1);
		expect(result.current.quizzes[0].title).toBe("Math Quiz");
	});
});
