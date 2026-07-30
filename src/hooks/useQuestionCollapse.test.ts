import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useQuestionCollapse } from "./useQuestionCollapse";
import type { AppQuestion } from "../lib/types";

const completeQuestion: AppQuestion = {
	id: "question-1",
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

describe("useQuestionCollapse", () => {
	it("collapses a default-expanded question on the first toggle", () => {
		const { result } = renderHook(() => useQuestionCollapse(0));

		expect(result.current.isExpanded(0, completeQuestion, false)).toBe(true);
		act(() => result.current.toggle(0));
		expect(result.current.isExpanded(0, completeQuestion, false)).toBe(false);
	});
});
