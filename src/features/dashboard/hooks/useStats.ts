import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
}

async function fetchStats(userId: string): Promise<Stats> {
  const [
    { count: quizCount, error: quizError },
    questionResult,
    attemptResult,
  ] = await Promise.all([
    supabase
      .from("quizzes")
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId),
    supabase
      .from("questions")
      .select("*, quizzes!inner(created_by)", { count: "exact", head: true })
      .eq("quizzes.created_by", userId),
    supabase
      .from("quiz_attempts")
      .select("*, quizzes!inner(created_by)", { count: "exact", head: true })
      .eq("quizzes.created_by", userId),
  ]);

  if (quizError) throw quizError;
  if (questionResult.error) throw questionResult.error;
  if (attemptResult.error) throw attemptResult.error;

  return {
    totalQuizzes: quizCount ?? 0,
    totalQuestions: questionResult.count ?? 0,
    totalAttempts: attemptResult.count ?? 0,
  };
}

export function useAnalyticsStats() {
  const { user } = useAuth();

  const { data: stats = { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 }, isLoading: loading } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: () => fetchStats(user!.id),
    enabled: !!user,
    refetchInterval: 30 * 1000,
    staleTime: 20 * 1000,
  });

  return { stats, loading };
}
