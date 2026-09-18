import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { PublicQuiz, QuizCategory, QuizDifficulty } from "@/lib/types";

type SortOption = "popular" | "newest" | "oldest" | "alphabetical";

interface Filters {
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  sort: SortOption;
}

async function fetchPublicQuizzes(filters: Filters): Promise<PublicQuiz[]> {
  let query = supabase
    .from("quizzes")
    .select(
      "id, title, description, category, difficulty, times_taken, average_rating, created_at, time_limit"
    )
    .eq("visibility", "public")
    .eq("status", "published");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

  switch (filters.sort) {
    case "popular":
      query = query.order("times_taken", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  const quizzes = (data ?? []) as PublicQuiz[];

  // Enrich with question counts (live DB doesn't have a stored count column)
  if (quizzes.length > 0) {
    const ids = quizzes.map((q) => q.id);
    const { data: questions } = await supabase
      .from("questions")
      .select("quiz_id")
      .in("quiz_id", ids);
    const counts: Record<string, number> = {};
    (questions ?? []).forEach((row: { quiz_id: string }) => {
      counts[row.quiz_id] = (counts[row.quiz_id] ?? 0) + 1;
    });
    return quizzes.map((q) => ({ ...q, question_count: counts[q.id] ?? 0 }));
  }

  return quizzes;
}

export function useQuizBank() {
  const [filters, setFiltersState] = useState<Filters>({
    category: null,
    difficulty: null,
    sort: "newest",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allQuizzes = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["quizBank", filters.category, filters.difficulty, filters.sort],
    queryFn: () => fetchPublicQuizzes(filters),
    staleTime: 60 * 1000, // Quiz bank data is fine stale for 1 minute
  });

  const error = queryError ? (queryError as Error).message : null;

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFiltersState((prev) => ({ ...prev, [key]: value }));

  const quizzes = searchQuery
    ? allQuizzes.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allQuizzes;

  return {
    quizzes,
    loading,
    error,
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
  };
}
