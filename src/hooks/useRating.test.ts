import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRating } from "./useRating";

function createQueryChain(resolveValue: object) {
	const promise = Promise.resolve(resolveValue);
	const chain: {
		select: ReturnType<typeof vi.fn>;
		eq: ReturnType<typeof vi.fn>;
		single: ReturnType<typeof vi.fn>;
		maybeSingle: ReturnType<typeof vi.fn>;
		upsert: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		then: Promise<object>["then"];
		catch: Promise<object>["catch"];
		finally: Promise<object>["finally"];
	} = {
		select: vi.fn(() => chain),
		eq: vi.fn(() => chain),
		single: vi.fn(() => chain),
		maybeSingle: vi.fn(() => chain),
		upsert: vi.fn(() => chain),
		update: vi.fn(() => chain),
		then: promise.then.bind(promise),
		catch: promise.catch.bind(promise),
		finally: promise.finally.bind(promise),
	};
	return chain as any;
}

vi.mock("../lib/supabase", () => ({
	supabase: { from: vi.fn() },
}));

vi.mock("./useAuth", () => ({
	useAuth: vi.fn(() => ({ user: { id: "u1" } })),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

const defaultChain = createQueryChain({ data: null, error: null });

describe("useRating", () => {
	it("submitRating calls upsert with correct quiz_id, user_id, and rating", async () => {
		const supabase = (await import("../lib/supabase")).supabase;
		vi.mocked(supabase.from).mockReturnValue(defaultChain);

		const { result } = renderHook(() => useRating("quiz1"));
		await act(async () => {});

		let success = false;
		await act(async () => {
			success = await result.current.submitRating(4) as unknown as boolean;
		});

		expect(defaultChain.upsert).toHaveBeenCalledWith(
			{ quiz_id: "quiz1", user_id: "u1", rating: 4 },
			{ onConflict: "quiz_id,user_id" }
		);
		expect(success).toBe(true);
	});

	it("loading is true during submitRating and false after", async () => {
		const supabase = (await import("../lib/supabase")).supabase;

		let resolveUpsert!: (v: object) => void;
		const upsertDeferred = new Promise<object>((res) => {
			resolveUpsert = res;
		});

		const chain = createQueryChain({ data: [], error: null });
		chain.upsert.mockReturnValue(upsertDeferred);

		vi.mocked(supabase.from).mockReturnValue(chain);

		const { result } = renderHook(() => useRating("quiz1"));
		await act(async () => {});

		result.current.submitRating(3);
		await waitFor(() => expect(result.current.loading).toBe(true));

		await act(async () => {
			resolveUpsert!({ error: null });
		});
		await waitFor(() => expect(result.current.loading).toBe(false));
	});

	it("sets error state on Supabase upsert failure", async () => {
		const supabase = (await import("../lib/supabase")).supabase;

		const failChain = createQueryChain({ data: null, error: null });
		failChain.upsert.mockResolvedValue({ error: new Error("DB error") });

		vi.mocked(supabase.from).mockReturnValue(failChain);

		const { result } = renderHook(() => useRating("quiz1"));
		await act(async () => {});

		let success = true;
		await act(async () => {
			success = await result.current.submitRating(5) as unknown as boolean;
		});
		expect(result.current.error).toBe("DB error");
		expect(result.current.loading).toBe(false);
		expect(success).toBe(false);
	});
});
