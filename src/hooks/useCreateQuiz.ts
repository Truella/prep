"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { parseAndValidateCSV } from "../utils/csvParser";
import { appToDBQuestion } from "../utils/transforms";
import type { QuizDraft, MCQRow, AppQuestion } from "../lib/types";

const QUIZ_META_KEY = "quiz_meta_draft";

function generateCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

function loadSavedQuizMeta(): QuizDraft {
	try {
		const raw = localStorage.getItem(QUIZ_META_KEY);
		if (raw) return JSON.parse(raw) as QuizDraft;
	} catch {}
	return { title: "", description: "" };
}

interface CreateQuizState {
	quiz: QuizDraft;
	questions: AppQuestion[];
	shareableLink: string | null;
	isCreatingQuiz: boolean;
	isUploadingQuestions: boolean;
	timeLimit: number | null;
}

export function useCreateQuiz() {
	const [state, setState] = useState<CreateQuizState>(() => ({
		quiz: loadSavedQuizMeta(),
		questions: [],
		shareableLink: null,
		isCreatingQuiz: false,
		isUploadingQuestions: false,
		timeLimit: null,
	}));

	const setTitle = (title: string) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, title } }));

	const setDescription = (description: string) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, description } }));

	const setTimeLimit = (timeLimit: number | null) =>
		setState((prev) => ({ ...prev, timeLimit }));

	const updateQuizMeta = (updates: Partial<QuizDraft>) => {
		setState((prev) => {
			const updatedQuiz = { ...prev.quiz, ...updates };
			try {
				localStorage.setItem(QUIZ_META_KEY, JSON.stringify(updatedQuiz));
			} catch {}
			return { ...prev, quiz: updatedQuiz };
		});
	};

	const createQuiz = async () => {
		if (!state.quiz.title.trim()) {
			toast.error("Quiz title is required");
			return;
		}
		setState((prev) => ({ ...prev, isCreatingQuiz: true }));

		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError || !userData?.user?.id) {
			toast.error("You must be logged in to create a quiz");
			setState((prev) => ({ ...prev, isCreatingQuiz: false }));
			return;
		}

		let code = generateCode();

		const { data, error } = await supabase
			.from("quizzes")
			.insert({
				title: state.quiz.title,
				description: state.quiz.description,
				created_by: userData.user.id,
				time_limit: state.timeLimit,
				code,
			})
			.select()
			.single();

		if (error?.message?.includes("duplicate key") || error?.message?.includes("idx_quizzes_code")) {
			code = generateCode();
			const { data: retry, error: retryError } = await supabase
				.from("quizzes")
				.insert({
					title: state.quiz.title,
					description: state.quiz.description,
					created_by: userData.user.id,
					time_limit: state.timeLimit,
					code,
				})
				.select()
				.single();
			if (retryError || !retry?.id) {
				toast.error("Failed to create quiz");
				setState((prev) => ({ ...prev, isCreatingQuiz: false }));
				return;
			}
			const updatedQuiz = { ...state.quiz, id: retry.id, code: retry.code };
			try {
				localStorage.setItem(QUIZ_META_KEY, JSON.stringify(updatedQuiz));
			} catch {}
			setState((prev) => ({ ...prev, quiz: updatedQuiz }));
			toast.success("Quiz created! Now upload questions.");
			return;
		}

		setState((prev) => ({ ...prev, isCreatingQuiz: false }));

		if (error || !data?.id) {
			toast.error("Failed to create quiz");
			return;
		}

		const updatedQuiz = { ...state.quiz, id: data.id, code: data.code };
		try {
			localStorage.setItem(QUIZ_META_KEY, JSON.stringify(updatedQuiz));
		} catch {}
		setState((prev) => ({ ...prev, quiz: updatedQuiz }));
		toast.success("Quiz created! Now upload questions.");
	};

	const setQuestionsFromCSV = async (file: File) => {
		const result = await parseAndValidateCSV(file);
		if (!result.success) {
			toast.error(result.message);
			return;
		}
		const parsed: AppQuestion[] = result.data.map((row: MCQRow, i: number) => ({
			id: `temp-${i}`,
			quizId: state.quiz.id ?? "",
			questionText: row.Question.trim(),
			optionA: row.Option_A.trim(),
			optionB: row.Option_B.trim(),
			optionC: row.Option_C.trim(),
			optionD: row.Option_D.trim(),
			correctIndex: ["A", "B", "C", "D"].indexOf(
				row.Correct_Answer.trim().toUpperCase()
			) as 0 | 1 | 2 | 3,
			points: parseInt(row.Points) || 1,
			order: i,
		}));
		setState((prev) => ({ ...prev, questions: parsed }));
		toast.success(`${parsed.length} questions loaded`);
	};

	const uploadQuestions = async (questionsOverride?: AppQuestion[]): Promise<boolean> => {
		if (state.shareableLink) {
			toast.error("Quiz already published");
			return false;
		}
		const toUpload = questionsOverride ?? state.questions;
		if (!state.quiz.id || toUpload.length === 0) {
			toast.error("Quiz ID missing or no questions to upload");
			return false;
		}
		setState((prev) => ({ ...prev, isUploadingQuestions: true }));

		const payload = toUpload.map((q) => ({
			...appToDBQuestion(q),
			quiz_id: state.quiz.id,
		}));

		const { error } = await supabase.from("questions").insert(payload);
		setState((prev) => ({ ...prev, isUploadingQuestions: false }));

		if (error) {
			toast.error(`Failed to save questions: ${error.message}`);
			return false;
		}

		const quizLink = `${window.location.origin}/quiz/${state.quiz.id}`;
		try {
			localStorage.removeItem(QUIZ_META_KEY);
		} catch {}
		setState((prev) => ({ ...prev, shareableLink: quizLink }));
		try {
			await navigator.clipboard.writeText(quizLink);
		} catch {
			toast.success("Quiz published!");
			return true;
		}
		toast.success("Quiz published! Link copied to clipboard.");
		return true;
	};

	const reset = () => {
		try {
			localStorage.removeItem(QUIZ_META_KEY);
		} catch {}
		setState({
			quiz: { title: "", description: "" },
			questions: [],
			shareableLink: null,
			isCreatingQuiz: false,
			isUploadingQuestions: false,
			timeLimit: null,
		});
	};

	return {
		...state,
		setTitle,
		setDescription,
		setTimeLimit,
		createQuiz,
		setQuestionsFromCSV,
		uploadQuestions,
		reset,
		updateQuizMeta,
	};
}
