import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { dbToAppQuestion, appToDBQuestion } from "../utils/transforms";
import type {
  AppQuestion,
  QuizVisibility,
  QuizCategory,
  QuizDifficulty,
  QuizStatus,
  QuizAttempt,
  QuizDraft,
} from "../lib/types";

type QuizMeta = QuizDraft & {
  id: string;
  created_at: string;
  visibility: QuizVisibility;
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  times_taken: number;
  average_rating: number | null;
  status: QuizStatus;
  code: string | null;
};

type AttemptRow = Pick<
  QuizAttempt,
  "id" | "score" | "total_points" | "elapsed_seconds" | "completed_at"
>;

async function fetchQuiz(quizId: string): Promise<QuizMeta> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();
  if (error || !data) throw new Error("Quiz not found");
  return data;
}

async function fetchQuestions(quizId: string): Promise<AppQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((q, i) => dbToAppQuestion(q, i));
}

async function fetchAttempts(quizId: string): Promise<AttemptRow[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, score, total_points, elapsed_seconds, completed_at")
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function useQuizDetail(quizId: string) {
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => fetchQuiz(quizId),
    enabled: !!quizId,
  });

  const questionsQuery = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: () => fetchQuestions(quizId),
    enabled: !!quizId,
  });

  const attemptsQuery = useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: () => fetchAttempts(quizId),
    enabled: !!quizId,
    refetchInterval: 30 * 1000, // Poll attempts every 30 seconds
    staleTime: 20 * 1000,
  });

  const updateMetaMutation = useMutation({
    mutationFn: async (
      updates: Partial<
        Pick<
          QuizMeta,
          "title" | "description" | "time_limit" | "visibility" | "category" | "difficulty"
        >
      >
    ) => {
      const { error } = await supabase
        .from("quizzes")
        .update(updates)
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Saved");
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (question: AppQuestion) => {
      const payload = appToDBQuestion(question);
      const { error } = await supabase
        .from("questions")
        .update(payload)
        .eq("id", question.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast.success("Question updated");
    },
    onError: () => toast.error("Failed to update question"),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast.success("Question deleted");
    },
    onError: () => toast.error("Failed to delete question"),
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Quiz deleted");
    },
    onError: () => toast.error("Failed to delete quiz"),
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("quizzes")
        .update({ status: "draft", code: null, visibility: "private" })
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz unpublished and moved to drafts");
    },
    onError: () => toast.error("Failed to unpublish quiz"),
  });

  const republishMutation = useMutation({
    mutationFn: async (settings: {
      visibility: "private" | "public";
      category: QuizCategory | null;
      difficulty: QuizDifficulty | null;
    }) => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      const { error } = await supabase
        .from("quizzes")
        .update({ status: "published", code, ...settings })
        .eq("id", quizId);
      if (error) throw error;
      return code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast.success("Quiz republished with a new link and code");
    },
    onError: () => toast.error("Failed to republish quiz"),
  });

  const copyLink = () => {
    const link = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.success("Link copied!"))
      .catch(() => toast.error("Failed to copy link"));
  };

  const loading =
    quizQuery.isLoading || questionsQuery.isLoading || attemptsQuery.isLoading;
  const error =
    quizQuery.error
      ? (quizQuery.error as Error).message
      : questionsQuery.error
        ? (questionsQuery.error as Error).message
        : attemptsQuery.error
          ? (attemptsQuery.error as Error).message
          : null;

  return {
    quiz: quizQuery.data ?? null,
    questions: questionsQuery.data ?? [],
    attempts: attemptsQuery.data ?? [],
    loading,
    error,
    saving:
      updateMetaMutation.isPending ||
      updateQuestionMutation.isPending ||
      deleteQuestionMutation.isPending ||
      deleteQuizMutation.isPending ||
      unpublishMutation.isPending ||
      republishMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
    },
    updateQuizMeta: async (updates: Parameters<typeof updateMetaMutation.mutateAsync>[0]) => {
      try {
        await updateMetaMutation.mutateAsync(updates);
        return true;
      } catch {
        return false;
      }
    },
    updateQuestion: async (question: AppQuestion) => {
      try {
        await updateQuestionMutation.mutateAsync(question);
        return true;
      } catch {
        return false;
      }
    },
    deleteQuestion: async (questionId: string) => {
      try {
        await deleteQuestionMutation.mutateAsync(questionId);
        return true;
      } catch {
        return false;
      }
    },
    deleteQuiz: async () => {
      try {
        await deleteQuizMutation.mutateAsync();
        return true;
      } catch {
        return false;
      }
    },
    unpublish: async () => {
      try {
        await unpublishMutation.mutateAsync();
        return true;
      } catch {
        return false;
      }
    },
    republish: async (
      settings: Parameters<typeof republishMutation.mutateAsync>[0]
    ) => {
      try {
        return await republishMutation.mutateAsync(settings);
      } catch {
        return null;
      }
    },
    copyLink,
  };
}
