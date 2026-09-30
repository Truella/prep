import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BYPASS_AUTH } from "@/features/auth/context/AuthContext";
import {
	countLocalQuestions,
	deleteLocalQuiz,
	listLocalQuestions,
	listLocalQuizzes,
	updateLocalQuiz,
} from "@/features/quiz-management/utils/localQuizStore";
import { useAuth } from "@/features/auth/hooks/useAuth";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "@/lib/types";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  status: "draft" | "published";
  visibility?: QuizVisibility;
  category?: QuizCategory | null;
  difficulty?: QuizDifficulty | null;
  times_taken?: number;
  average_rating?: number | null;
  code?: string | null;
  question_count?: number;
}

async function fetchUserQuizzes(userId: string): Promise<Quiz[]> {
  // TEMP (Supabase paused): read from localStorage when bypassing auth.
  if (BYPASS_AUTH) {
    void userId;
    void countLocalQuestions;
    return listLocalQuizzes().map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      created_at: quiz.created_at,
      status: quiz.status,
      visibility: quiz.visibility,
      category: quiz.category,
      difficulty: quiz.difficulty,
      code: quiz.code,
      question_count: listLocalQuestions(quiz.id).length,
    }));
  }
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, questions(count)")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(({ questions, ...quiz }) => ({
    ...quiz,
    question_count: questions?.[0]?.count ?? 0,
  })) as Quiz[];
}

export function useQuizzes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: allQuizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizzes", user?.id],
    queryFn: () => fetchUserQuizzes(user!.id),
    enabled: !!user,
  });

  const drafts = allQuizzes.filter((q) => q.status === "draft");
  const published = allQuizzes.filter((q) => q.status === "published");
  const error = queryError ? (queryError as Error).message : null;

  const copyQuizLink = (quizId: string) => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link);
    toast.success("Quiz link copied!");
  };

	const unpublishQuiz = async (quizId: string) => {
		try {
			// TEMP (Supabase paused): unpublish locally when bypassing auth.
			if (BYPASS_AUTH) {
				updateLocalQuiz(quizId, { status: "draft", code: null, visibility: "private" });
				queryClient.invalidateQueries({ queryKey: ["quizzes"] });
				toast.success("Quiz unpublished and moved to drafts");
				return;
			}
			const { error } = await supabase
				.from("quizzes")
				.update({ status: "draft", code: null, visibility: "private" })
				.eq("id", quizId);
			if (error) throw error;
			queryClient.invalidateQueries({ queryKey: ["quizzes"] });
			toast.success("Quiz unpublished and moved to drafts");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to unpublish: ${message}`);
			throw err;
		}
	};

	const deleteQuiz = async (quizId: string) => {
    try {
      // TEMP (Supabase paused): delete locally when bypassing auth.
      if (BYPASS_AUTH) {
        deleteLocalQuiz(quizId);
        queryClient.setQueryData<Quiz[]>(["quizzes"], (prev) =>
          prev ? prev.filter((q) => q.id !== quizId) : []
        );
        queryClient.invalidateQueries({ queryKey: ["stats"] });
        toast.success("Quiz deleted");
        return;
      }
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
      // Optimistic update — remove from cache immediately
      queryClient.setQueryData<Quiz[]>(["quizzes"], (prev) =>
        prev ? prev.filter((q) => q.id !== quizId) : []
      );
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Quiz deleted");
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			toast.error(`Failed to delete quiz: ${message}`);
			// Revert by invalidating
			queryClient.invalidateQueries({ queryKey: ["quizzes"] });
			throw err;
		}
  };

	return {
		quizzes: allQuizzes,
		drafts,
		published,
		loading,
		error,
		copyQuizLink,
		deleteQuiz,
		unpublishQuiz,
		refetch: () => queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
	};
}
