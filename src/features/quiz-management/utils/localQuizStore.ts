"use client";

// TEMPORARY (Supabase paused): localStorage-backed quiz store used only when
// NEXT_PUBLIC_BYPASS_AUTH=true. See docs/TEMP_AUTH_BYPASS.md. Delete this file on revert.

import type {
	AppQuestion,
	QuizCategory,
	QuizDifficulty,
	QuizStatus,
	QuizVisibility,
} from "@/lib/types";

export interface LocalQuiz {
	id: string;
	title: string;
	description: string;
	time_limit: number | null;
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
	status: QuizStatus;
	code: string | null;
	created_by: string;
	created_at: string;
}

const QUIZZES_KEY = "prep.local.quizzes.v1";
const QUESTIONS_KEY = "prep.local.questions.v1";

function isBrowser(): boolean {
	return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
	if (!isBrowser()) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function writeJSON(key: string, value: unknown): void {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// storage full / unavailable — creation flow will still work in-memory for the session
	}
}

export function newLocalId(prefix = "local"): string {
	try {
		if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
			return `${prefix}-${crypto.randomUUID()}`;
		}
	} catch {}
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

// --- Quizzes ---

export function listLocalQuizzes(): LocalQuiz[] {
	const quizzes = readJSON<LocalQuiz[]>(QUIZZES_KEY, []);
	return [...quizzes].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function getLocalQuiz(quizId: string): LocalQuiz | null {
	return listLocalQuizzes().find((q) => q.id === quizId) ?? null;
}

export function createLocalQuiz(input: {
	title: string;
	description: string;
	time_limit: number | null;
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
	created_by: string;
}): LocalQuiz {
	const quiz: LocalQuiz = {
		id: newLocalId("quiz"),
		title: input.title,
		description: input.description,
		time_limit: input.time_limit,
		visibility: input.visibility,
		category: input.visibility === "public" ? input.category : null,
		difficulty: input.visibility === "public" ? input.difficulty : null,
		status: "draft",
		code: null,
		created_by: input.created_by,
		created_at: new Date().toISOString(),
	};
	const quizzes = readJSON<LocalQuiz[]>(QUIZZES_KEY, []);
	quizzes.push(quiz);
	writeJSON(QUIZZES_KEY, quizzes);
	return quiz;
}

export function updateLocalQuiz(
	quizId: string,
	patch: Partial<
		Pick<
			LocalQuiz,
			| "title"
			| "description"
			| "time_limit"
			| "visibility"
			| "category"
			| "difficulty"
			| "status"
			| "code"
		>
	>,
): LocalQuiz | null {
	const quizzes = readJSON<LocalQuiz[]>(QUIZZES_KEY, []);
	const idx = quizzes.findIndex((q) => q.id === quizId);
	if (idx === -1) return null;
	const next = { ...quizzes[idx]!, ...patch };
	if (next.visibility === "private") {
		next.category = null;
		next.difficulty = null;
	}
	quizzes[idx] = next;
	writeJSON(QUIZZES_KEY, quizzes);
	return next;
}

export function deleteLocalQuiz(quizId: string): void {
	writeJSON(
		QUIZZES_KEY,
		readJSON<LocalQuiz[]>(QUIZZES_KEY, []).filter((q) => q.id !== quizId),
	);
	writeJSON(
		QUESTIONS_KEY,
		readJSON<AppQuestion[]>(QUESTIONS_KEY, []).filter(
			(q) => q.quizId !== quizId,
		),
	);
}

// --- Questions (stored as AppQuestion, already in app shape) ---

export function listLocalQuestions(quizId: string): AppQuestion[] {
	return readJSON<AppQuestion[]>(QUESTIONS_KEY, [])
		.filter((q) => q.quizId === quizId)
		.sort((a, b) => a.order - b.order)
		.map((q, i) => ({ ...q, order: i }));
}

function persistAllQuestions(all: AppQuestion[]): void {
	writeJSON(QUESTIONS_KEY, all);
}

export function insertLocalQuestions(
	quizId: string,
	questions: AppQuestion[],
): AppQuestion[] {
	const all = readJSON<AppQuestion[]>(QUESTIONS_KEY, []);
	const existing = all.filter((q) => q.quizId === quizId);
	const baseOrder = existing.length;
	const toAdd = questions.map((q, i) => ({
		...q,
		id: q.id.startsWith("temp-") || q.id.startsWith("draft-") ? newLocalId("q") : q.id,
		quizId,
		order: baseOrder + i,
	}));
	persistAllQuestions([...all, ...toAdd]);
	return listLocalQuestions(quizId);
}

export function updateLocalQuestion(question: AppQuestion): void {
	const all = readJSON<AppQuestion[]>(QUESTIONS_KEY, []);
	const idx = all.findIndex((q) => q.id === question.id);
	if (idx === -1) return;
	all[idx] = question;
	persistAllQuestions(all);
}

export function deleteLocalQuestion(questionId: string): void {
	persistAllQuestions(
		readJSON<AppQuestion[]>(QUESTIONS_KEY, []).filter((q) => q.id !== questionId),
	);
}

export function countLocalQuestions(): number {
	return readJSON<AppQuestion[]>(QUESTIONS_KEY, []).length;
}
