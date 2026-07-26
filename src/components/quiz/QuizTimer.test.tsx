import { render, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import QuizTimer from "./QuizTimer";

vi.mock("react-hot-toast", () => ({ default: vi.fn() }));

import toast from "react-hot-toast";

beforeEach(() => {
	vi.useFakeTimers();
	(toast as unknown as ReturnType<typeof vi.fn>).mockClear();
});
afterEach(() => vi.useRealTimers());

describe("QuizTimer", () => {
	it("displays initial time in mm:ss format", () => {
		const { container } = render(
			<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />,
		);
		expect(container.textContent).toContain("02:00");
	});

	it("decrements by 1 every second", () => {
		const { container } = render(
			<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />,
		);
		act(() => vi.advanceTimersByTime(1000));
		expect(container.textContent).toContain("01:59");
	});

	it("calls onExpire exactly once when reaching zero", () => {
		const onExpire = vi.fn();
		render(<QuizTimer timeLimitSeconds={3} onExpire={onExpire} />);
		act(() => vi.advanceTimersByTime(3000));
		expect(onExpire).toHaveBeenCalledTimes(1);
	});

	it("shows green text above 50% remaining", () => {
		const { container } = render(
			<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />,
		);
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("text-green-400");
	});

	it("shows yellow text between 20-50% remaining", () => {
		const { container } = render(
			<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />,
		);
		act(() => vi.advanceTimersByTime(55000));
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("text-yellow-400");
	});

	it("shows red text below 20% remaining", () => {
		const { container } = render(
			<QuizTimer timeLimitSeconds={100} onExpire={vi.fn()} />,
		);
		act(() => vi.advanceTimersByTime(85000));
		const el = container.firstChild as HTMLElement;
		expect(el.className).toContain("text-red-400");
	});

	it("fires warning toast exactly once at 60 seconds remaining", () => {
		render(<QuizTimer timeLimitSeconds={120} onExpire={vi.fn()} />);
		act(() => vi.advanceTimersByTime(60000));
		expect(toast).toHaveBeenCalledTimes(1);
		act(() => vi.advanceTimersByTime(10000));
		expect(toast).toHaveBeenCalledTimes(1);
	});
});
