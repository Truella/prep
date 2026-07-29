import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

interface Stats {
  totalQuizzes: number;
  totalQuestions: number;
  totalAttempts: number;
}

async function fetchAllQuizIds(userId: string): Promise<string[]> {
  const allIds: string[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id")
      .eq("created_by", userId)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    allIds.push(...data.map((q) => q.id));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allIds;
}

async function fetchStats(): Promise<Stats> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 };

  const quizIds = await fetchAllQuizIds(user.id);

  if (quizIds.length === 0) {
    return { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 };
  }

  const [questionResult, attemptResult] = await Promise.all([
    supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .in("quiz_id", quizIds),
    supabase
      .from("quiz_attempts")
      .select("*", { count: "exact", head: true })
      .in("quiz_id", quizIds),
  ]);

  if (questionResult.error) throw questionResult.error;
  if (attemptResult.error) throw attemptResult.error;

  return {
    totalQuizzes: quizIds.length,
    totalQuestions: questionResult.count ?? 0,
    totalAttempts: attemptResult.count ?? 0,
  };
}

export function useAnalyticsStats() {
  const { user } = useAuth();

  const { data: stats = { totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0 }, isLoading: loading } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: fetchStats,
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    staleTime: 20 * 1000,       // Consider stale after 20 seconds
  });

  return { stats, loading };
}