import type { ParseError } from "papaparse";
import { PostgrestError } from "@supabase/supabase-js";
export interface QuizDraft {
	id?: string;
	title: string;
	description: string;
}

export interface PreviewQuestion {
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
export type SupabaseError = PostgrestError | null;

export interface QuizQuestion {
	id: string;
	quiz_id: string;
	Question: string;
	Option_A: string;
	Option_B: string;
	Option_C: string;
	Option_D: string;
	created_at: string;
	Correct_Answer: "A" | "B" | "C" | "D";
	Points: number;
}
