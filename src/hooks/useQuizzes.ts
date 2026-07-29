import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../lib/types";

interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  visibility?: QuizVisibility;
  category?: QuizCategory | null;
  difficulty?: QuizDifficulty | null;
  times_taken?: number;
  average_rating?: number | null;
}

async function fetchUserQuizzes(): Promise<Quiz[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useQuizzes() {
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: fetchUserQuizzes,
  });

  const error = queryError ? (queryError as Error).message : null;

  const copyQuizLink = (quizId: string) => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(link);
    toast.success("Quiz link copied!");
  };

  const deleteQuiz = async (quizId: string) => {
    try {
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
    }
  };

  return {
    quizzes,
    loading,
    error,
    copyQuizLink,
    deleteQuiz,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["quizzes"] }),
  };
}
