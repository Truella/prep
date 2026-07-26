import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { usePublishQuiz } from "./usePublishQuiz";
import toast from "react-hot-toast";
import { createChain } from "../test-utils/chain";

vi.mock("../lib/supabase", () => ({
	supabase: {
		from: vi.fn(),
	},
}));

vi.mock("react-hot-toast", () => ({
	default: { error: vi.fn(), success: vi.fn() },
}));

beforeEach(() => {
	vi.clearAllMocks();
});

describe("usePublishQuiz", () => {
	it("publish with public visibility calls supabase.update and calls onSuccess", async () => {
		const onSuccess = vi.fn();
		const { supabase } = await import("../lib/supabase");
		const chain = createChain({ data: null, error: null });
		vi.mocked(supabase.from).mockReturnValue(chain);

		const { result } = renderHook(() => usePublishQuiz("quiz1", onSuccess));

		await act(async () => {
			await result.current.publish({
				visibility: "public",
				category: "Mathematics",
				difficulty: "Beginner",
			});
		});

		expect(supabase.from).toHaveBeenCalledWith("quizzes");
		expect(chain.update).toHaveBeenCalledWith({
			visibility: "public",
			category: "Mathematics",
			difficulty: "Beginner",
		});
		expect(chain.eq).toHaveBeenCalledWith("id", "quiz1");
		expect(toast.success).toHaveBeenCalledWith("Quiz published to the Quiz Bank!");
		expect(onSuccess).toHaveBeenCalled();
	});

	it("publish with private visibility shows generic toast", async () => {
		const onSuccess = vi.fn();
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(createChain({ data: null, error: null }));

		const { result } = renderHook(() => usePublishQuiz("quiz1", onSuccess));

		await act(async () => {
			await result.current.publish({
				visibility: "private",
				category: null,
				difficulty: null,
			});
		});

		expect(toast.success).toHaveBeenCalledWith("Quiz visibility updated");
		expect(onSuccess).toHaveBeenCalled();
	});

	it("publish with API error sets error state and calls toast.error", async () => {
		const onSuccess = vi.fn();
		const { supabase } = await import("../lib/supabase");
		vi.mocked(supabase.from).mockReturnValue(
			createChain({ data: null, error: { message: "Update failed", code: "", details: "", hint: "" } })
		);

		const { result } = renderHook(() => usePublishQuiz("quiz1", onSuccess));

		await act(async () => {
			await result.current.publish({
				visibility: "public",
				category: null,
				difficulty: null,
			});
		});

		expect(result.current.error).toBe("Update failed");
		expect(toast.error).toHaveBeenCalledWith("Failed to update quiz visibility");
		expect(onSuccess).not.toHaveBeenCalled();
	});
});
