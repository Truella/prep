import { describe, it, expect } from "vitest";
import { letterToIndex, dbToAppQuestion, appToDBQuestion } from "./transforms";
import type { DBQuestion, AppQuestion } from "../lib/types";

const DB_Q: DBQuestion = {
	id: "q1",
	quiz_id: "quiz1",
	Question: "What is 2+2?",
	Option_A: "1",
	Option_B: "2",
	Option_C: "3",
	Option_D: "4",
	Correct_Answer: "D",
	Points: 1,
	created_at: "2024-01-01T00:00:00Z",
};

const APP_Q: AppQuestion = {
	id: "q1",
	quizId: "quiz1",
	questionText: "What is 2+2?",
	optionA: "1",
	optionB: "2",
	optionC: "3",
	optionD: "4",
	correctIndex: 3,
	points: 1,
	order: 0,
};

describe("letterToIndex", () => {
	it("maps A to 0, B to 1, C to 2, D to 3", () => {
		expect(letterToIndex("A")).toBe(0);
		expect(letterToIndex("B")).toBe(1);
		expect(letterToIndex("C")).toBe(2);
		expect(letterToIndex("D")).toBe(3);
	});

	it("returns -1 for unrecognised letter", () => {
		expect(letterToIndex("E")).toBe(-1);
		expect(letterToIndex("")).toBe(-1);
	});

	it("handles lowercase input", () => {
		expect(letterToIndex("a")).toBe(0);
		expect(letterToIndex("d")).toBe(3);
	});
});

describe("dbToAppQuestion", () => {
	it("maps all fields correctly including correctIndex 3 for Correct_Answer D", () => {
		const result = dbToAppQuestion(DB_Q, 0);
		expect(result.id).toBe("q1");
		expect(result.quizId).toBe("quiz1");
		expect(result.questionText).toBe("What is 2+2?");
		expect(result.optionA).toBe("1");
		expect(result.optionB).toBe("2");
		expect(result.optionC).toBe("3");
		expect(result.optionD).toBe("4");
		expect(result.correctIndex).toBe(3);
		expect(result.points).toBe(1);
		expect(result.order).toBe(0);
	});
});

describe("appToDBQuestion", () => {
	it("maps all fields back correctly including Correct_Answer D for correctIndex 3", () => {
		const result = appToDBQuestion(APP_Q);
		expect(result.quiz_id).toBe("quiz1");
		expect(result.Question).toBe("What is 2+2?");
		expect(result.Option_A).toBe("1");
		expect(result.Option_B).toBe("2");
		expect(result.Option_C).toBe("3");
		expect(result.Option_D).toBe("4");
		expect(result.Correct_Answer).toBe("D");
		expect(result.Points).toBe(1);
	});
});

describe("round-trip", () => {
	it("appToDBQuestion(dbToAppQuestion(q)) matches original DB field values", () => {
		const app = dbToAppQuestion(DB_Q, 0);
		const back = appToDBQuestion(app);
		expect(back.Question).toBe(DB_Q.Question);
		expect(back.Option_A).toBe(DB_Q.Option_A);
		expect(back.Option_B).toBe(DB_Q.Option_B);
		expect(back.Option_C).toBe(DB_Q.Option_C);
		expect(back.Option_D).toBe(DB_Q.Option_D);
		expect(back.Correct_Answer).toBe(DB_Q.Correct_Answer);
		expect(back.Points).toBe(DB_Q.Points);
	});
});
