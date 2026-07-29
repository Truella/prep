"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { parseAndValidateCSV } from "../utils/csvParser";
import { appToDBQuestion, dbToAppQuestion } from "../utils/transforms";
import type {
	AppQuestion,
	DBQuestion,
	MCQRow,
	QuizCategory,
	QuizDifficulty,
	QuizDraft,
	QuizVisibility,
} from "../lib/types";

const QUIZ_META_KEY = "quiz_meta_draft";
const BUILDER_DRAFT_KEY = "quiz_builder_draft";

function generateCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}

export interface PublishSettings {
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
}

interface CreateQuizState {
	quiz: QuizDraft;
	questions: AppQuestion[];
	shareableLink: string | null;
	quizCode: string | null;
	isCreatingQuiz: boolean;
	isUploadingQuestions: boolean;
	isLoadingDraft: boolean;
	timeLimit: number | null;
}

const initialState: CreateQuizState = {
	quiz: { title: "", description: "" },
	questions: [],
	shareableLink: null,
	quizCode: null,
	isCreatingQuiz: false,
	isUploadingQuestions: false,
	isLoadingDraft: false,
	timeLimit: null,
};

function isCodeConflict(message?: string): boolean {
	return Boolean(
		message?.includes("duplicate key") || message?.includes("idx_quizzes_code"),
	);
}

export function useCreateQuiz(resumeQuizId?: string | null) {
	const [state, setState] = useState<CreateQuizState>(() => ({
		...initialState,
		isLoadingDraft: Boolean(resumeQuizId),
	}));

	useEffect(() => {
		if (!resumeQuizId) return;

		let cancelled = false;
		const loadDraft = async () => {
			setState((prev) => ({ ...prev, isLoadingDraft: true }));
			const { data: userData, error: userError } = await supabase.auth.getUser();
			if (cancelled) return;
			if (userError || !userData.user) {
				toast.error("You must be logged in to resume a draft");
				setState((prev) => ({ ...prev, isLoadingDraft: false }));
				return;
			}

			const { data: quiz, error: quizError } = await supabase
				.from("quizzes")
				.select("id,title,description,time_limit,visibility,category,difficulty,status,code")
				.eq("id", resumeQuizId)
				.eq("created_by", userData.user.id)
				.eq("status", "draft")
				.single();

			if (cancelled) return;
			if (quizError || !quiz) {
				toast.error("Draft not found or you do not have access");
				setState((prev) => ({ ...prev, isLoadingDraft: false }));
				return;
			}

			const { data: questionRows, error: questionsError } = await supabase
				.from("questions")
				.select("*")
				.eq("quiz_id", resumeQuizId)
				.order("created_at", { ascending: true });

			if (cancelled) return;
			if (questionsError) {
				toast.error("Failed to load draft questions");
				setState((prev) => ({ ...prev, isLoadingDraft: false }));
				return;
			}

			const questions = (questionRows ?? []).map((question, index) =>
				dbToAppQuestion(question as DBQuestion, index),
			);
			setState({
				quiz: {
					id: quiz.id,
					title: quiz.title,
					description: quiz.description ?? "",
					time_limit: quiz.time_limit,
					visibility: quiz.visibility,
					category: quiz.category,
					difficulty: quiz.difficulty,
					status: "draft",
					code: null,
				},
				questions,
				shareableLink: null,
				quizCode: null,
				isCreatingQuiz: false,
				isUploadingQuestions: false,
				isLoadingDraft: false,
				timeLimit: quiz.time_limit,
			});
		};

		void loadDraft();
		return () => {
			cancelled = true;
		};
	}, [resumeQuizId]);

	const setTitle = (title: string) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, title } }));

	const setDescription = (description: string) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, description } }));

	const setTimeLimit = (timeLimit: number | null) =>
		setState((prev) => ({ ...prev, timeLimit }));

	const updateQuizMeta = (updates: Partial<QuizDraft>) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, ...updates } }));

	const createQuiz = async () => {
		if (!state.quiz.title.trim()) {
			toast.error("Quiz title is required");
			return;
		}
		setState((prev) => ({ ...prev, isCreatingQuiz: true }));

		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError || !userData.user) {
			toast.error("You must be logged in to create a quiz");
			setState((prev) => ({ ...prev, isCreatingQuiz: false }));
			return;
		}

		const { data, error } = await supabase
			.from("quizzes")
			.insert({
				title: state.quiz.title,
				description: state.quiz.description,
				created_by: userData.user.id,
				time_limit: state.timeLimit,
				status: "draft",
				code: null,
			})
			.select()
			.single();

		setState((prev) => ({ ...prev, isCreatingQuiz: false }));
		if (error || !data?.id) {
			toast.error("Failed to create quiz");
			return;
		}

		setState((prev) => ({
			...prev,
			quiz: { ...prev.quiz, id: data.id, status: "draft", code: null },
		}));
		toast.success("Quiz created! Add your questions.");
	};

	const setQuestionsFromCSV = async (file: File) => {
		const result = await parseAndValidateCSV(file);
		if (!result.success) {
			toast.error(result.message);
			return;
		}
		const parsed: AppQuestion[] = result.data.map((row: MCQRow, index: number) => ({
			id: `temp-${index}`,
			quizId: state.quiz.id ?? "",
			questionText: row.Question.trim(),
			optionA: row.Option_A.trim(),
			optionB: row.Option_B.trim(),
			optionC: row.Option_C.trim(),
			optionD: row.Option_D.trim(),
			correctIndex: ["A", "B", "C", "D"].indexOf(
				row.Correct_Answer.trim().toUpperCase(),
			) as 0 | 1 | 2 | 3,
			points: parseInt(row.Points) || 1,
			order: index,
		}));
		setState((prev) => ({ ...prev, questions: parsed }));
		toast.success(`${parsed.length} questions loaded`);
	};

	const insertQuestions = async (
		questions: AppQuestion[],
		quizId: string,
	): Promise<boolean> => {
		const payload = questions.map((question) => ({
			...appToDBQuestion(question),
			quiz_id: quizId,
		}));
		const { error: insertError } = await supabase.from("questions").insert(payload);
		if (insertError) {
			toast.error(`Failed to save questions: ${insertError.message}`);
			return false;
		}
		return true;
	};

	const saveAsDraft = async (
		questionsOverride?: AppQuestion[],
	): Promise<boolean> => {
		const toSave = questionsOverride ?? state.questions;
		if (!state.quiz.id || toSave.length === 0) {
			toast.error("Quiz ID missing or no questions to save");
			return false;
		}

		setState((prev) => ({ ...prev, isUploadingQuestions: true }));
		const ok = await insertQuestions(toSave, state.quiz.id);
		setState((prev) => ({
			...prev,
			questions: ok ? toSave : prev.questions,
			isUploadingQuestions: false,
		}));
		if (ok) {
			toast.success("Saved as draft");
			try {
				localStorage.removeItem(BUILDER_DRAFT_KEY);
			} catch {}
		}
		return ok;
	};

	const publishQuiz = async (
		questionsOverride: AppQuestion[] | undefined,
		settings: PublishSettings,
	): Promise<boolean> => {
		const toPublish = questionsOverride ?? state.questions;
		if (!state.quiz.id || toPublish.length === 0) {
			toast.error("Quiz ID missing or no questions to publish");
			return false;
		}

		setState((prev) => ({ ...prev, isUploadingQuestions: true }));
		const questionsOk = await insertQuestions(toPublish, state.quiz.id);
		if (!questionsOk) {
			setState((prev) => ({ ...prev, isUploadingQuestions: false }));
			return false;
		}

		let code = generateCode();
		let result = await supabase
			.from("quizzes")
			.update({ status: "published", code, ...settings })
			.eq("id", state.quiz.id)
			.eq("status", "draft")
			.select()
			.single();

		if (isCodeConflict(result.error?.message)) {
			code = generateCode();
			result = await supabase
				.from("quizzes")
				.update({ status: "published", code, ...settings })
				.eq("id", state.quiz.id)
				.eq("status", "draft")
				.select()
				.single();
		}

		setState((prev) => ({ ...prev, isUploadingQuestions: false }));
		if (result.error || !result.data) {
			toast.error("Failed to publish quiz");
			return false;
		}

		const quizLink = `${window.location.origin}/quiz/${state.quiz.id}`;
		try {
			localStorage.removeItem(QUIZ_META_KEY);
			localStorage.removeItem(BUILDER_DRAFT_KEY);
		} catch {}
		setState((prev) => ({
			...prev,
			questions: toPublish,
			shareableLink: quizLink,
			quizCode: result.data.code,
			quiz: {
				...prev.quiz,
				...settings,
				status: "published",
				code: result.data.code,
			},
		}));

		try {
			await navigator.clipboard.writeText(quizLink);
			toast.success("Quiz published! Link copied to clipboard.");
		} catch {
			toast.success("Quiz published!");
		}
		return true;
	};

	const uploadQuestions = (questionsOverride?: AppQuestion[]) =>
		publishQuiz(questionsOverride, {
			visibility: "private",
			category: null,
			difficulty: null,
		});

	const reset = () => {
		try {
			localStorage.removeItem(QUIZ_META_KEY);
			localStorage.removeItem(BUILDER_DRAFT_KEY);
		} catch {}
		setState(initialState);
	};

	return {
		...state,
		setTitle,
		setDescription,
		setTimeLimit,
		updateQuizMeta,
		createQuiz,
		setQuestionsFromCSV,
		saveAsDraft,
		publishQuiz,
		uploadQuestions,
		reset,
	};
}
