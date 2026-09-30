"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { BYPASS_AUTH } from "@/features/auth/context/AuthContext";
import {
	createLocalQuiz,
	getLocalQuiz,
	insertLocalQuestions as insertLocalQuestionsStore,
	listLocalQuestions,
	updateLocalQuiz,
} from "@/features/quiz-management/utils/localQuizStore";
import { parseAndValidateCSV } from "@/features/quiz-management/utils/csvParser";
import { appToDBQuestion, dbToAppQuestion } from "@/features/quiz-management/utils/transforms";
import { generateCode } from "@/features/quiz-management/utils/codeGenerator";
import type {
	AppQuestion,
	DBQuestion,
	MCQRow,
	QuizCategory,
	QuizDifficulty,
	QuizDraft,
	QuizVisibility,
} from "@/lib/types";

const QUIZ_META_KEY = "quiz_meta_draft";
const BUILDER_DRAFT_KEY = "quiz_builder_draft";

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
	isSavingMeta: boolean;
	timeLimit: number | null;
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
}

const initialState: CreateQuizState = {
	quiz: { title: "", description: "" },
	questions: [],
	shareableLink: null,
	quizCode: null,
	isCreatingQuiz: false,
	isUploadingQuestions: false,
	isLoadingDraft: false,
	isSavingMeta: false,
	timeLimit: null,
	visibility: "private",
	category: null,
	difficulty: null,
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
			// TEMP (Supabase paused): load draft from localStorage when bypassing auth.
			if (BYPASS_AUTH) {
				if (cancelled) return;
				const quiz = getLocalQuiz(resumeQuizId);
				if (!quiz) {
					toast.error("Draft not found or you do not have access");
					setState((prev) => ({ ...prev, isLoadingDraft: false }));
					return;
				}
				const questions = listLocalQuestions(resumeQuizId);
				if (cancelled) return;
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
					isSavingMeta: false,
					timeLimit: quiz.time_limit,
					visibility: quiz.visibility ?? "private",
					category: quiz.category ?? null,
					difficulty: quiz.difficulty ?? null,
				});
				return;
			}
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
				isSavingMeta: false,
				timeLimit: quiz.time_limit,
				visibility: quiz.visibility ?? "private",
				category: quiz.category ?? null,
				difficulty: quiz.difficulty ?? null,
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

	const setVisibility = (visibility: QuizVisibility) =>
		setState((prev) => ({
			...prev,
			visibility,
			category: visibility === "private" ? null : prev.category,
			quiz: { ...prev.quiz, visibility, category: visibility === "private" ? null : prev.quiz.category },
		}));

	const setCategory = (category: QuizCategory | null) =>
		setState((prev) => ({ ...prev, category, quiz: { ...prev.quiz, category } }));

	const setDifficulty = (difficulty: QuizDifficulty | null) =>
		setState((prev) => ({ ...prev, difficulty, quiz: { ...prev.quiz, difficulty } }));

	const updateQuizMeta = (updates: Partial<QuizDraft>) =>
		setState((prev) => ({ ...prev, quiz: { ...prev.quiz, ...updates } }));

	const persistQuizMeta = async (): Promise<boolean> => {
		if (!state.quiz.id) return false;
		const payload: Record<string, unknown> = {};
		if (state.quiz.title !== undefined) payload.title = state.quiz.title;
		if (state.quiz.description !== undefined) payload.description = state.quiz.description;
		if (state.timeLimit !== undefined) payload.time_limit = state.timeLimit;
		payload.visibility = state.visibility;
		payload.category = state.visibility === "public" ? state.category : null;
		payload.difficulty = state.visibility === "public" ? state.difficulty : null;

		if (!String(payload.title ?? "").trim()) {
			toast.error("Quiz title is required");
			return false;
		}
		if (String(payload.title).length > 60) {
			toast.error("Quiz title must be 60 characters or fewer");
			return false;
		}
		if (String(payload.description ?? "").length > 120) {
			toast.error("Description must be 120 characters or fewer");
			return false;
		}

		setState((prev) => ({ ...prev, isSavingMeta: true }));
		// TEMP (Supabase paused): persist metadata locally when bypassing auth.
		if (BYPASS_AUTH) {
			const updated = updateLocalQuiz(state.quiz.id, payload as Parameters<typeof updateLocalQuiz>[1]);
			setState((prev) => ({ ...prev, isSavingMeta: false }));
			if (!updated) {
				toast.error("Failed to save changes");
				return false;
			}
			toast.success("Changes saved");
			return true;
		}
		const { error } = await supabase.from("quizzes").update(payload).eq("id", state.quiz.id).eq("status", "draft");
		setState((prev) => ({ ...prev, isSavingMeta: false }));
		if (error) {
			toast.error("Failed to save changes");
			return false;
		}
		toast.success("Changes saved");
		return true;
	};

	const createQuiz = async (): Promise<boolean> => {
		if (!state.quiz.title.trim()) {
			toast.error("Quiz title is required");
			return false;
		}
		if (state.quiz.title.length > 60) {
			toast.error("Quiz title must be 60 characters or fewer");
			return false;
		}
		if (state.quiz.description.length > 120) {
			toast.error("Description must be 120 characters or fewer");
			return false;
		}
		setState((prev) => ({ ...prev, isCreatingQuiz: true }));

		// TEMP (Supabase paused): create quiz in localStorage when bypassing auth.
		if (BYPASS_AUTH) {
			const local = createLocalQuiz({
				title: state.quiz.title,
				description: state.quiz.description,
				time_limit: state.timeLimit,
				visibility: state.visibility,
				category: state.visibility === "public" ? state.category : null,
				difficulty: state.visibility === "public" ? state.difficulty : null,
				created_by: "dev-user-id",
			});
			setState((prev) => ({
				...prev,
				isCreatingQuiz: false,
				quiz: { ...prev.quiz, id: local.id, status: "draft", code: null, visibility: prev.visibility, category: prev.category, difficulty: prev.difficulty },
			}));
			toast.success("Quiz created! Add your questions.");
			return true;
		}
		const { data: userData, error: userError } = await supabase.auth.getUser();
		if (userError || !userData.user) {
			toast.error("You must be logged in to create a quiz");
			setState((prev) => ({ ...prev, isCreatingQuiz: false }));
			return false;
		}

		const { data, error } = await supabase
			.from("quizzes")
			.insert({
				title: state.quiz.title,
				description: state.quiz.description,
				created_by: userData.user.id,
				time_limit: state.timeLimit,
				status: "draft",
				visibility: state.visibility,
				category: state.visibility === "public" ? state.category : null,
				difficulty: state.visibility === "public" ? state.difficulty : null,
				code: null,
			})
			.select()
			.single();

		setState((prev) => ({ ...prev, isCreatingQuiz: false }));
		if (error || !data?.id) {
			toast.error("Failed to create quiz");
			return false;
		}

		setState((prev) => ({
			...prev,
			quiz: { ...prev.quiz, id: data.id, status: "draft", code: null, visibility: prev.visibility, category: prev.category, difficulty: prev.difficulty },
		}));
		toast.success("Quiz created! Add your questions.");
		return true;
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

	const isUnsavedQuestion = (question: AppQuestion) =>
		question.id.startsWith("temp-") || question.id.startsWith("draft-");

	const insertQuestions = async (
		questions: AppQuestion[],
		quizId: string,
	): Promise<AppQuestion[] | null> => {
		const unsavedQuestions = questions.filter(isUnsavedQuestion);
		if (unsavedQuestions.length === 0) return questions;

		// TEMP (Supabase paused): save questions to localStorage when bypassing auth.
		if (BYPASS_AUTH) {
			try {
				return insertLocalQuestionsStore(quizId, unsavedQuestions);
			} catch {
				toast.error("Failed to save questions");
				return null;
			}
		}
		const payload = unsavedQuestions.map((question) => ({
			...appToDBQuestion(question),
			quiz_id: quizId,
		}));
		const { data, error: insertError } = await supabase
			.from("questions")
			.insert(payload)
			.select();
		if (insertError) {
			toast.error(`Failed to save questions: ${insertError.message}`);
			return null;
		}

		// Map returned rows back to unsaved questions using order as stable key.
		const savedByTempId = new Map<string, AppQuestion>();
		for (let i = 0; i < (data ?? []).length; i++) {
			const original = unsavedQuestions[i];
			if (!original) continue;
			const saved = dbToAppQuestion(data![i] as DBQuestion, original.order);
			savedByTempId.set(original.id, saved);
		}
		const getSaved = (id: string) => savedByTempId.get(id) ?? undefined;
		return questions.map((question) => getSaved(question.id) ?? question);
	};

	const saveAsDraft = async (
		questionsOverride?: AppQuestion[],
	): Promise<boolean> => {
		const toSave = questionsOverride ?? state.questions;
		if (!state.quiz.id) {
			toast.error("Quiz ID missing");
			return false;
		}

		setState((prev) => ({ ...prev, isUploadingQuestions: true }));
		const savedQuestions = await insertQuestions(toSave, state.quiz.id);
		const ok = savedQuestions !== null;
		setState((prev) => ({
			...prev,
			questions: savedQuestions ?? prev.questions,
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
		const savedQuestions = await insertQuestions(toPublish, state.quiz.id);
		if (!savedQuestions) {
			setState((prev) => ({ ...prev, isUploadingQuestions: false }));
			return false;
		}

		let code = generateCode();
		// TEMP (Supabase paused): publish locally when bypassing auth.
		if (BYPASS_AUTH) {
			const updated = updateLocalQuiz(state.quiz.id, { status: "published", code, ...settings });
			setState((prev) => ({ ...prev, isUploadingQuestions: false }));
			if (!updated) {
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
				questions: savedQuestions,
				shareableLink: quizLink,
				quizCode: updated.code,
				quiz: {
					...prev.quiz,
					...settings,
					status: "published",
					code: updated.code,
				},
			}));
			try {
				await navigator.clipboard.writeText(quizLink);
				toast.success("Quiz published! Link copied to clipboard.");
			} catch {
				toast.success("Quiz published!");
			}
			return true;
		}
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
			questions: savedQuestions,
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
		setVisibility,
		setCategory,
		setDifficulty,
		updateQuizMeta,
		persistQuizMeta,
		createQuiz,
		setQuestionsFromCSV,
		saveAsDraft,
		publishQuiz,
		uploadQuestions,
		reset,
	};
}
