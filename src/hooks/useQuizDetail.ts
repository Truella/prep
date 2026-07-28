import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { dbToAppQuestion, appToDBQuestion } from "../utils/transforms";
import type {
	QuizDraft,
	AppQuestion,
	QuizVisibility,
	QuizCategory,
	QuizDifficulty,
	QuizAttempt,
} from "../lib/types";

interface QuizDetailState {
	quiz: (QuizDraft & {
		id: string;
		created_at: string;
		visibility: QuizVisibility;
		category: QuizCategory | null;
		difficulty: QuizDifficulty | null;
		times_taken: number;
		average_rating: number | null;
	}) | null;
	questions: AppQuestion[];
	attempts: Pick<
		QuizAttempt,
		"score" | "total_points" | "elapsed_seconds" | "completed_at"
	>[];
	loading: boolean;
	error: string | null;
}

export function useQuizDetail(quizId: string) {
	const [state, setState] = useState<QuizDetailState>({
		quiz: null,
		questions: [],
		attempts: [],
		loading: true,
		error: null,
	});
	const [saving, setSaving] = useState(false);

	const fetchQuizDetail = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));

		const { data: quizData, error: quizError } = await supabase
			.from("quizzes")
			.select("*")
			.eq("id", quizId)
			.single();

		if (quizError || !quizData) {
			setState((prev) => ({
				...prev,
				loading: false,
				error: "Quiz not found",
			}));
			return;
		}

		const { data: questionsData } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quizId)
			.order("created_at", { ascending: true });

		const { data: attemptsData } = await supabase
			.from("quiz_attempts")
			.select("score, total_points, elapsed_seconds, completed_at")
			.eq("quiz_id", quizId)
			.order("completed_at", { ascending: false });

		setState({
			quiz: quizData,
			questions: (questionsData ?? []).map((q, i) => dbToAppQuestion(q, i)),
			attempts: attemptsData ?? [],
			loading: false,
			error: null,
		});
	}, [quizId]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchQuizDetail();
	}, [fetchQuizDetail]);

	// Update quiz metadata
	const updateQuizMeta = async (updates: Partial<Pick<
		QuizDetailState["quiz"] & object,
		"title" | "description" | "time_limit" | "visibility" | "category" | "difficulty"
	>>) => {
		setSaving(true);
		const { error } = await supabase
			.from("quizzes")
			.update(updates)
			.eq("id", quizId);
		setSaving(false);

		if (error) {
			toast.error("Failed to save changes");
			return false;
		}

		setState((prev) => ({
			...prev,
			quiz: prev.quiz ? { ...prev.quiz, ...updates } : prev.quiz,
		}));
		toast.success("Saved");
		return true;
	};

	// Update a single question
	const updateQuestion = async (question: AppQuestion) => {
		setSaving(true);
		const payload = appToDBQuestion(question);
		const { error } = await supabase
			.from("questions")
			.update(payload)
			.eq("id", question.id);
		setSaving(false);

		if (error) {
			toast.error("Failed to update question");
			return false;
		}

		setState((prev) => ({
			...prev,
			questions: prev.questions.map((q) =>
				q.id === question.id ? question : q
			),
		}));
		toast.success("Question updated");
		return true;
	};

	// Delete a single question
	const deleteQuestion = async (questionId: string) => {
		const { error } = await supabase
			.from("questions")
			.delete()
			.eq("id", questionId);

		if (error) {
			toast.error("Failed to delete question");
			return false;
		}

		setState((prev) => ({
			...prev,
			questions: prev.questions.filter((q) => q.id !== questionId),
		}));
		toast.success("Question deleted");
		return true;
	};

	// Delete the entire quiz
	const deleteQuiz = async () => {
		const { error } = await supabase
			.from("quizzes")
			.delete()
			.eq("id", quizId);

		if (error) {
			toast.error("Failed to delete quiz");
			return false;
		}

		toast.success("Quiz deleted");
		return true;
	};

	// Copy shareable link
	const copyLink = () => {
		const link = `${window.location.origin}/quiz/${quizId}`;
		navigator.clipboard
			.writeText(link)
			.then(() => toast.success("Link copied!"))
			.catch(() => toast.error("Failed to copy link"));
	};

	return {
		...state,
		saving,
		refetch: fetchQuizDetail,
		updateQuizMeta,
		updateQuestion,
		deleteQuestion,
		deleteQuiz,
		copyLink,
	};
}
