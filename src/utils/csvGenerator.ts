import type { AppQuestion } from "../lib/types";
import { indexToLetter } from "./transforms";

function escapeCSVField(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export function generateCSV(questions: AppQuestion[]): string {
	const header =
		"Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points";
	const rows = questions.map((q) =>
		[
			q.questionText,
			q.optionA,
			q.optionB,
			q.optionC,
			q.optionD,
			indexToLetter(q.correctIndex),
			String(q.points),
		]
			.map(escapeCSVField)
			.join(",")
	);
	return [header, ...rows].join("\n");
}
