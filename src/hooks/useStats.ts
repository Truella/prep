import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
}

async function fetchStats(): Promise<Stats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 };

  const { data: userQuizzes } = await supabase
    .from("quizzes")
    .select("id")
    .eq("created_by", user.id);

  const quizIds = userQuizzes?.map((q) => q.id) ?? [];
  const quizCount = quizIds.length;

  let questionCount = 0;
  let attemptCount = 0;

  if (quizIds.length > 0) {
    const [{ count: qCount }, { count: aCount }] = await Promise.all([
      supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .in("quiz_id", quizIds),
      supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .in("quiz_id", quizIds),
    ]);
    questionCount = qCount ?? 0;
    attemptCount = aCount ?? 0;
  }

  return {
    totalQuizzes: quizCount,
    totalQuestions: questionCount,
    totalAttempts: attemptCount,
  };
}

export function useAnalyticsStats() {
  const { data: stats = { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 }, isLoading: loading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    staleTime: 20 * 1000,       // Consider stale after 20 seconds
  });

  return { stats, loading };
}