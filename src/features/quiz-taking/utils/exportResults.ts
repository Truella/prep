import type { AppQuestion } from "@/lib/types";
import { indexToLetter } from "@/features/quiz-management/utils/transforms";

export interface ResultsExportRow {
	questionNumber: number;
	question: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	correctAnswer: string;
	yourAnswer: string;
	isCorrect: boolean;
	pointsEarned: number;
	pointsPossible: number;
}

export interface ResultsExportMeta {
	quizTitle: string;
	exportedAt: string;
	correctCount: number;
	totalQuestions: number;
	earnedPoints: number;
	totalPoints: number;
}

function answerLabel(index: number | undefined, options: string[]): string {
	if (index === undefined || index < 0 || index > 3) return "Unanswered";
	return `${indexToLetter(index)} - ${options[index]}`;
}

export function buildExportRows(
	questions: AppQuestion[],
	userAnswers: Record<number, number>
): ResultsExportRow[] {
	return questions.map((q, i) => {
		const options = [q.optionA, q.optionB, q.optionC, q.optionD];
		const selected = userAnswers[i];
		const isCorrect = selected === q.correctIndex;
		return {
			questionNumber: i + 1,
			question: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD,
			correctAnswer: `${indexToLetter(q.correctIndex)} - ${options[q.correctIndex]}`,
			yourAnswer: answerLabel(selected, options),
			isCorrect,
			pointsEarned: isCorrect ? q.points : 0,
			pointsPossible: q.points,
		};
	});
}

function escapeCSVField(value: string | number | boolean): string {
	const str = String(value);
	if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export function generateResultsCSV(
	questions: AppQuestion[],
	userAnswers: Record<number, number>
): string {
	const header =
		"Question_Number,Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Your_Answer,Is_Correct,Points_Earned,Points_Possible";
	const rows = buildExportRows(questions, userAnswers).map((r) =>
		[
			r.questionNumber,
			r.question,
			r.optionA,
			r.optionB,
			r.optionC,
			r.optionD,
			r.correctAnswer,
			r.yourAnswer,
			r.isCorrect ? "Yes" : "No",
			r.pointsEarned,
			r.pointsPossible,
		]
			.map(escapeCSVField)
			.join(",")
	);
	return [header, ...rows].join("\n");
}

export function generateResultsJSON(
	quizTitle: string,
	questions: AppQuestion[],
	userAnswers: Record<number, number>,
	meta?: Partial<ResultsExportMeta>
): string {
	const rows = buildExportRows(questions, userAnswers);
	const payload = {
		quizTitle,
		exportedAt: new Date().toISOString(),
		correctCount: rows.filter((r) => r.isCorrect).length,
		totalQuestions: questions.length,
		earnedPoints: rows.reduce((sum, r) => sum + r.pointsEarned, 0),
		totalPoints: rows.reduce((sum, r) => sum + r.pointsPossible, 0),
		...meta,
		questions: rows,
	};
	return JSON.stringify(payload, null, 2);
}

export function getExportFilename(quizTitle: string, ext: "csv" | "json"): string {
	const slug =
		quizTitle
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 50) || "quiz";
	return `${slug}-results.${ext}`;
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
	const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
