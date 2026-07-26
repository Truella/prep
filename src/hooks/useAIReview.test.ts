import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useAIReview } from "./useAIReview";

const makeResponse = (body: object, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => vi.restoreAllMocks());

const PAYLOAD = {
  questions: [],
  selectedAnswers: {},
  score: 5,
  totalPoints: 10,
};

describe("useAIReview", () => {
  it("sets review on 200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ review: "Great job!" }, 200))
    );
    const { result } = renderHook(() => useAIReview("quiz1"));
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.review).toBe("Great job!");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets rate limit error message on 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ error: "Rate limit" }, 429))
    );
    const { result } = renderHook(() => useAIReview("quiz1"));
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("5 free reviews");
  });

  it("sets generic error on non-429 failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ error: "Server error" }, 500))
    );
    const { result } = renderHook(() => useAIReview("quiz1"));
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("sets generic error on network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network")));
    const { result } = renderHook(() => useAIReview("quiz1"));
    await act(() => result.current.getReview(PAYLOAD));
    expect(result.current.error).toContain("temporarily unavailable");
  });

  it("loading is true during request and false after", async () => {
    let resolve: (r: Response) => void;
    const pending = new Promise<Response>((res) => (resolve = res));
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));
    const { result } = renderHook(() => useAIReview("quiz1"));
    act(() => {
      result.current.getReview(PAYLOAD);
    });
    expect(result.current.loading).toBe(true);
    await act(async () => {
      resolve!(makeResponse({ review: "Done" }, 200));
    });
    expect(result.current.loading).toBe(false);
  });

  it("clearReview resets review and error to null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse({ review: "Good" }, 200))
    );
    const { result } = renderHook(() => useAIReview("quiz1"));
    await act(() => result.current.getReview(PAYLOAD));
    act(() => result.current.clearReview());
    expect(result.current.review).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
