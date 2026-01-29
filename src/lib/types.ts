import type { ParseError } from "papaparse";

export interface QuizDraft {
	id?: string;
	title: string;
	description: string;
}

export interface Question {
	text: string;
	options: string[];
	answer: string;
	points?: number;
}

export interface QuizSubmission {
	quizId: string;
	answers: number[];
	score?: number;
	totalPoints?: number;
}
export interface MCQRow {
	Question: string;
	Option_A: string;
	Option_B: string;
	Option_C: string;
	Option_D: string;
	Correct_Answer: string;
	Points: string;
}
export interface ParsedData {
	data: MCQRow[];
	meta: {
		fields?: (keyof MCQRow)[];
	};
	errors: ParseError[];
}

