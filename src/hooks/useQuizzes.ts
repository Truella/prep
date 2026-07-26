import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

import type { QuizVisibility } from "../lib/types";

interface Quiz {
	id: string;
	title: string;
	description: string;
	created_at: string;
	visibility?: QuizVisibility;
}

export function useQuizzes() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchQuizzes = async () => {
		try {
			setLoading(true);
			setError(null);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setError("Not authenticated");
				setLoading(false);
				return;
			}

			const { data, error: fetchError } = await supabase
				.from("quizzes")
				.select("*")
				.eq("created_by", user.id)
				.order("created_at", { ascending: false });

			if (fetchError) {
				setError(fetchError.message);
				toast.error("Failed to fetch quizzes");
				console.error(fetchError);
				return;
			}

			setQuizzes(data || []);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			setError(message);
			toast.error("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchQuizzes();
	}, []);

	const copyQuizLink = (quizId: string) => {
		const link = `${window.location.origin}/quiz/${quizId}`;
		navigator.clipboard.writeText(link);
		toast.success("Quiz link copied!");
	};

	const deleteQuiz = async (quizId: string) => {
		try {
			const { error } = await supabase
				.from("quizzes")
				.delete()
				.eq("id", quizId);

			if (error) throw error;

			setQuizzes(quizzes.filter((q) => q.id !== quizId));
			toast.success("Quiz deleted");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to delete quiz: ${message}`);
		}
	};

	return {
		quizzes,
		loading,
		error,
		copyQuizLink,
		deleteQuiz,
		refetch: fetchQuizzes,
	};
}
