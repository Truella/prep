import type { ParseError } from "papaparse";

export interface Question {
	text: string;
	options: string[];
	correctIndex: number;
	points: number;
}

export interface Quiz {
	id?: string;
	created_at?: string;
	title: string;
	questions: Question[];
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
	CorrectOption: string;
	[key: string]: string;
}
export interface ParsedData {
	data: MCQRow[];
	meta: {
		fields?: (keyof MCQRow)[];
	};
	errors: ParseError[];
}

