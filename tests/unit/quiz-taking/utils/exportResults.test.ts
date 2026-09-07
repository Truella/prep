import { describe, it, expect } from "vitest";
import {
	buildExportRows,
	generateResultsCSV,
	generateResultsJSON,
	getExportFilename,
} from "@/features/quiz-taking/utils/exportResults";
import type { AppQuestion } from "@/lib/types";

const QUESTIONS: AppQuestion[] = [
	{
		id: "1",
		quizId: "q1",
		questionText: "What is 2+2?",
		optionA: "1",
		optionB: "2",
		optionC: "3",
		optionD: "4",
		correctIndex: 3,
		points: 2,
		order: 0,
	},
	{
		id: "2",
		quizId: "q1",
		questionText: "Capital of France?",
		optionA: "Berlin",
		optionB: "Paris",
		optionC: "Rome",
		optionD: "Madrid",
		correctIndex: 1,
		points: 3,
		order: 1,
	},
];

describe("buildExportRows", () => {
	it("marks correct and incorrect answers with points", () => {
		const rows = buildExportRows(QUESTIONS, { 0: 3, 1: 0 });
		expect(rows).toHaveLength(2);
		expect(rows[0].isCorrect).toBe(true);
		expect(rows[0].pointsEarned).toBe(2);
		expect(rows[1].isCorrect).toBe(false);
		expect(rows[1].pointsEarned).toBe(0);
		expect(rows[1].yourAnswer).toContain("A");
	});

	it("labels unanswered questions", () => {
		const rows = buildExportRows(QUESTIONS, { 0: 3 });
		expect(rows[1].yourAnswer).toBe("Unanswered");
		expect(rows[1].isCorrect).toBe(false);
	});
});

describe("generateResultsCSV", () => {
	it("generates header plus one row per question", () => {
		const csv = generateResultsCSV(QUESTIONS, { 0: 3, 1: 1 });
		const lines = csv.split("\n");
		expect(lines[0]).toBe(
			"Question_Number,Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Your_Answer,Is_Correct,Points_Earned,Points_Possible"
		);
		expect(lines).toHaveLength(3);
	});

	it("escapes commas, quotes, and newlines", () => {
		const tricky: AppQuestion = {
			...QUESTIONS[0],
			questionText: 'Say "hi", then\nbye',
		};
		const csv = generateResultsCSV([tricky], { 0: 3 });
		expect(csv).toContain('"Say ""hi"", then\nbye"');
	});
});

describe("generateResultsJSON", () => {
	it("includes metadata and per-question detail", () => {
		const json = generateResultsJSON("My Quiz", QUESTIONS, { 0: 3, 1: 1 });
		const parsed = JSON.parse(json);
		expect(parsed.quizTitle).toBe("My Quiz");
		expect(parsed.totalQuestions).toBe(2);
		expect(parsed.correctCount).toBe(2);
		expect(parsed.earnedPoints).toBe(5);
		expect(parsed.totalPoints).toBe(5);
		expect(parsed.questions).toHaveLength(2);
		expect(parsed.questions[0].yourAnswer).toContain("D");
		expect(typeof parsed.exportedAt).toBe("string");
	});
});

describe("getExportFilename", () => {
	it("slugifies the quiz title", () => {
		expect(getExportFilename("My Great Quiz!", "csv")).toBe("my-great-quiz-results.csv");
		expect(getExportFilename("My Great Quiz!", "json")).toBe("my-great-quiz-results.json");
	});

	it("falls back to quiz for empty titles", () => {
		expect(getExportFilename("!!!", "csv")).toBe("quiz-results.csv");
	});
});
