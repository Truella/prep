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
import { useRating } from "@/features/quiz-bank/hooks/useRating";
import toast from "react-hot-toast";

function createChain(resolveValue: object) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const chain: any = {};
	const promise = Promise.resolve(resolveValue);
	chain.select = vi.fn(() => chain);
	chain.eq = vi.fn(() => chain);
	chain.single = vi.fn(() => chain);
	chain.maybeSingle = vi.fn(() => chain);
	chain.upsert = vi.fn(() => chain);
	chain.then = promise.then.bind(promise);
	chain.catch = promise.catch.bind(promise);
	chain.finally = promise.finally.bind(promise);
	return chain;
}

function mockUser() {
	return { id: "user1", app_metadata: {}, user_metadata: {}, aud: "", created_at: "" };
}

function mockAuthContext(overrides: Record<string, unknown> = {}) {
	return {
		user: mockUser(),
		loading: false,
		initializing: false,
		error: null,
		signUp: vi.fn(),
		signIn: vi.fn(),
		signOut: vi.fn(),
		clearError: vi.fn(),
		...overrides,
	};
}

vi.mock("@/lib/supabase", () => ({
	supabase: {
		from: vi.fn(),
	},
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
	useAuth: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useRating", () => {
	it("submitRating succeeds and updates currentRating", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext());

		const { supabase } = await import("@/lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: null, error: null })
		);

		const { result } = renderHook(() => useRating("quiz1"));

		await act(async () => {
			const ok = await result.current.submitRating(4);
			expect(ok).toBe(true);
		});

		await waitFor(() => expect(result.current.currentRating).toBe(4));
		expect(toast.success).toHaveBeenCalledWith("Rating submitted!");
	});

	it("submitRating when not logged in does nothing", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext({ user: null }));

		const { result } = renderHook(() => useRating("quiz1"));

		await act(async () => {
			const ok = await result.current.submitRating(4);
			expect(ok).toBe(undefined);
		});
	});

	it("submitRating with API error sets error state and returns false", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext());

		const { supabase } = await import("@/lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: null, error: new Error("DB error") })
		);

		const { result } = renderHook(() => useRating("quiz1"));

		await act(async () => {
			const ok = await result.current.submitRating(5);
			expect(ok).toBe(false);
		});

		await waitFor(() => {
			expect(result.current.error).toBe("DB error");
		});
	});

	it("loads current rating on mount", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext());

		const { supabase } = await import("@/lib/supabase");
		const chain = createChain({ data: { rating: 3 }, error: null });
		vi.mocked(supabase.from).mockReturnValue(chain);

		const { result } = renderHook(() => useRating("quiz1"));
		await waitFor(() => expect(result.current.currentRating).toBe(3));
	});

	it("sets currentRating to null when supabase returns no data", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext());

		const { supabase } = await import("@/lib/supabase");
		const chain = createChain({ data: null, error: null });
		vi.mocked(supabase.from).mockReturnValue(chain);

		const { result } = renderHook(() => useRating("quiz1"));
		await waitFor(() => expect(result.current.currentRating).toBeNull());
	});

	it("sets currentRating to null when user is not logged in", async () => {
		const { useAuth } = await import("@/features/auth/hooks/useAuth");
		vi.mocked(useAuth).mockReturnValue(mockAuthContext({ user: null }));

		const { result } = renderHook(() => useRating("quiz1"));
		expect(result.current.currentRating).toBeNull();
	});
});
