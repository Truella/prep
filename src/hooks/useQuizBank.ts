import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { PublicQuiz, QuizCategory, QuizDifficulty } from "../lib/types";

type SortOption = "popular" | "rated" | "newest" | "alphabetical";

interface Filters {
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  sort: SortOption;
}

async function fetchPublicQuizzes(filters: Filters): Promise<PublicQuiz[]> {
  let query = supabase
    .from("quizzes")
    .select(
      "id, title, description, category, difficulty, times_taken, average_rating, created_at"
    )
    .eq("visibility", "public")
    .eq("status", "published");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

  switch (filters.sort) {
    case "popular":
      query = query.order("times_taken", { ascending: false });
      break;
    case "rated":
      query = query.order("average_rating", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
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
