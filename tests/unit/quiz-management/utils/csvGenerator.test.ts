import { describe, it, expect } from "vitest";
import { generateCSV } from "@/features/quiz-management/utils/csvGenerator";
import { parseAndValidateCSV } from "@/features/quiz-management/utils/csvParser";
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
		points: 1,
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
		points: 2,
		order: 1,
	},
];

describe("generateCSV", () => {
	it("round-trip: generateCSV output is parseable by parseAndValidateCSV", async () => {
		const csv = generateCSV(QUESTIONS);
		const file = new File([csv], "test.csv", { type: "text/csv" });
		const result = await parseAndValidateCSV(file);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data).toHaveLength(2);
			expect(result.data[0].Correct_Answer).toBe("D");
			expect(result.data[1].Correct_Answer).toBe("B");
		}
	});

	it("handles fields containing commas without breaking CSV structure", async () => {
		const q = { ...QUESTIONS[0], questionText: "One, two, or three?" };
		const csv = generateCSV([q]);
		const file = new File([csv], "test.csv", { type: "text/csv" });
		const result = await parseAndValidateCSV(file);
		expect(result.success).toBe(true);
	});

	it("handles fields containing double quotes", async () => {
		const q = { ...QUESTIONS[0], questionText: 'He said "hello"' };
		const csv = generateCSV([q]);
		expect(csv).toContain('"He said ""hello"""');
		const file = new File([csv], "test.csv", { type: "text/csv" });
		const result = await parseAndValidateCSV(file);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data[0].Question).toBe('He said "hello"');
		}
	});

	it("handles fields containing newlines", async () => {
		const q = { ...QUESTIONS[0], questionText: "Line1\nLine2" };
		const csv = generateCSV([q]);
		const file = new File([csv], "test.csv", { type: "text/csv" });
		const result = await parseAndValidateCSV(file);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data[0].Question).toBe("Line1\nLine2");
		}
	});

	it("generates header row correctly", () => {
		const csv = generateCSV([]);
		expect(csv).toBe("Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points");
	});
});
