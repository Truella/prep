import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import useQuizProgress from "./useQuizProgress";

beforeEach(() => {
	localStorage.clear();
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useQuizProgress", () => {
	it("loadProgress returns null when nothing is saved", () => {
		const { result } = renderHook(() =>
			useQuizProgress("quiz1", {}, 0, false)
		);
		expect(result.current.loadProgress()).toBeNull();
	});

	it("saveProgress writes answers, currentIndex, and timestamp to localStorage after markHydrated", () => {
		const { result, rerender } = renderHook(
			({ sa, ci }) => useQuizProgress("quiz1", sa, ci, false),
			{ initialProps: { sa: {}, ci: 0 } }
		);

		act(() => result.current.markHydrated());

		rerender({ sa: { 0: 2 }, ci: 1 });

		act(() => vi.advanceTimersByTime(0));

		const stored = JSON.parse(localStorage.getItem("quiz_progress_quiz1")!);
		expect(stored.timestamp).toBeGreaterThan(0);

		const loaded = result.current.loadProgress();
		expect(loaded).not.toBeNull();
		expect(loaded!.answers).toEqual({ 0: 2 });
		expect(loaded!.currentIndex).toBe(1);
	});

	it("loadProgress returns saved answers and currentIndex when fresh", () => {
		const { result } = renderHook(() =>
			useQuizProgress("quiz1", {}, 0, false)
		);

		act(() => result.current.markHydrated());
		act(() => {
			localStorage.setItem(
				"quiz_progress_quiz1",
				JSON.stringify({ answers: { 0: 2 }, currentIndex: 1, timestamp: Date.now() })
			);
		});

		const loaded = result.current.loadProgress();
		expect(loaded).not.toBeNull();
		expect(loaded!.answers).toEqual({ 0: 2 });
		expect(loaded!.currentIndex).toBe(1);
	});

	it("loadProgress returns null when saved data is older than 24 hours", () => {
		vi.setSystemTime(1000 * 60 * 60 * 24 * 2);
		const { result } = renderHook(() =>
			useQuizProgress("quiz1", {}, 0, false)
		);

		act(() => {
			localStorage.setItem(
				"quiz_progress_quiz1",
				JSON.stringify({ answers: { 0: 2 }, currentIndex: 1, timestamp: 0 })
			);
		});

		expect(result.current.loadProgress()).toBeNull();
		expect(localStorage.getItem("quiz_progress_quiz1")).toBeNull();
	});

	it("clearProgress removes the storage key", () => {
		const { result } = renderHook(() =>
			useQuizProgress("quiz1", {}, 0, false)
		);

		act(() => {
			localStorage.setItem("quiz_progress_quiz1", "some data");
		});
		expect(localStorage.getItem("quiz_progress_quiz1")).toBe("some data");

		act(() => result.current.clearProgress());
		expect(localStorage.getItem("quiz_progress_quiz1")).toBeNull();
	});

	it("saveProgress does nothing before markHydrated is called", () => {
		const { result, rerender } = renderHook(
			({ sa, ci }) => useQuizProgress("quiz1", sa, ci, false),
			{ initialProps: { sa: {}, ci: 0 } }
		);

		rerender({ sa: { 0: 2 }, ci: 1 });
		act(() => vi.advanceTimersByTime(0));

		expect(result.current.loadProgress()).toBeNull();
	});

	it("saveProgress does nothing when isSubmitted is true", () => {
		const { result, rerender } = renderHook(
			({ sa, ci, sub }) => useQuizProgress("quiz1", sa, ci, sub),
			{ initialProps: { sa: {}, ci: 0, sub: true } }
		);

		act(() => result.current.markHydrated());

		rerender({ sa: { 0: 2 }, ci: 1, sub: true });
		act(() => vi.advanceTimersByTime(0));

		expect(result.current.loadProgress()).toBeNull();
	});
});
