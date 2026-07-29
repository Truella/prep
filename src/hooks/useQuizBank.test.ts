import { renderHook as originalRenderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

function createWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	function Wrapper({ children }: { children: React.ReactNode }) {
		return React.createElement(QueryClientProvider, { client: queryClient }, children);
	}
	return Wrapper;
}

const renderHook = <T, P>(hook: (props: P) => T) => originalRenderHook(hook, { wrapper: createWrapper() });
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useQuizBank } from "./useQuizBank";
import { createChain } from "../test-utils/chain";

vi.mock("../lib/supabase", () => ({
	supabase: { from: vi.fn(), rpc: vi.fn() },
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

beforeEach(async () => {
	vi.clearAllMocks();
	const { supabase } = await import("../lib/supabase");
	vi.mocked(supabase.from).mockReset();
	vi.mocked(supabase.rpc).mockReset();
	vi.mocked(supabase.rpc).mockReturnValue(
		createChain({ data: [], error: null })
	);
});

describe("useQuizBank", () => {
	it("includes visibility = public filter in every query", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: [], error: null })
		);
		renderHook(() => useQuizBank());
		await act(async () => {});
		const chain = vi.mocked(supabase.from).mock.results[0].value;
		expect(chain.eq).toHaveBeenCalledWith("visibility", "public");
	});

	it("adds category filter when category is set", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: [], error: null })
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
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: [], error: null })
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
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: [], error: null })
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

	it("orders by average_rating descending for rated sort", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: [], error: null })
		);
		const { result } = renderHook(() => useQuizBank());
		await act(async () => {});
		act(() => {
			result.current.setFilter("sort", "rated");
		});
		await act(async () => {});
		const results = vi.mocked(supabase.from).mock.results;
		const chain = results[results.length - 1].value;
		expect(chain.order).toHaveBeenCalledWith("average_rating", {
			ascending: false,
			nullsFirst: false,
		});
	});

	it("sets error state when supabase query fails", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: null, error: { message: "Network error" } })
		);
		const { result } = renderHook(() => useQuizBank());
		await waitFor(() => expect(result.current.error).toBe("Network error"));
	});

	it("client-side search returns only quizzes matching the query substring", async () => {
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: MOCK_QUIZZES, error: null })
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
