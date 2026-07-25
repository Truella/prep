import { describe, it, expect } from "vitest";
import { validateQuestion, validateQuizForSubmit } from "./questionValidation";
import type { AppQuestion } from "../lib/types";

const VALID_Q: AppQuestion = {
	id: "1",
	quizId: "q1",
	questionText: "What?",
	optionA: "One",
	optionB: "Two",
	optionC: "Three",
	optionD: "Four",
	correctIndex: 0,
	points: 1,
	order: 0,
};

describe("validateQuestion", () => {
	it("returns empty array for valid question", () => {
		expect(validateQuestion(VALID_Q)).toEqual([]);
	});

	it("returns error for empty questionText", () => {
		const errs = validateQuestion({ ...VALID_Q, questionText: "" });
		expect(errs).toContain("Question text is required");
	});

	it("returns error for empty optionA", () => {
		const errs = validateQuestion({ ...VALID_Q, optionA: "" });
		expect(errs).toContain("Option A is required");
	});

	it("returns error for duplicate options", () => {
		const errs = validateQuestion({
			...VALID_Q,
			optionA: "Same",
			optionB: "Same",
		});
		expect(errs).toContain("Options must be unique");
	});

	it("returns error for correctIndex of -1", () => {
		const errs = validateQuestion({
			...VALID_Q,
			correctIndex: -1 as unknown as 0 | 1 | 2 | 3,
		});
		expect(errs).toContain("Correct answer must be A, B, C, or D");
	});

	it("returns error for correctIndex of 4", () => {
		const errs = validateQuestion({
			...VALID_Q,
			correctIndex: 4 as unknown as 0 | 1 | 2 | 3,
		});
		expect(errs).toContain("Correct answer must be A, B, C, or D");
	});
});

describe("validateQuizForSubmit", () => {
	it("returns empty Map for all-valid questions", () => {
		const result = validateQuizForSubmit([VALID_Q, VALID_Q]);
		expect(result.size).toBe(0);
	});

	it("returns Map entry for each invalid question", () => {
		const invalid = { ...VALID_Q, questionText: "" };
		const result = validateQuizForSubmit([VALID_Q, invalid, VALID_Q]);
		expect(result.size).toBe(1);
		expect(result.get(1)).toBeDefined();
	});
});
