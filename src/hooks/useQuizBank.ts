import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getAttemptCounts } from "../utils/attempts";
import type { PublicQuiz, QuizCategory, QuizDifficulty } from "../lib/types";

type SortOption = "popular" | "rated" | "newest" | "alphabetical";

interface Filters {
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
	sort: SortOption;
}

export function useQuizBank() {
	const [allQuizzes, setAllQuizzes] = useState<PublicQuiz[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFiltersState] = useState<Filters>({
		category: null,
		difficulty: null,
		sort: "newest",
	});
	const [searchQuery, setSearchQuery] = useState("");

	const requestGenRef = useRef(0);

	const fetchQuizzes = useCallback(async () => {
		const currentGen = ++requestGenRef.current;
		setLoading(true);
		setError(null);

		let query = supabase
			.from("quizzes")
			.select(
				"id, title, description, category, difficulty, times_taken, average_rating, created_at"
			)
			.eq("visibility", "public");

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

		const { data, error: fetchError } = await query;
		
		if (currentGen !== requestGenRef.current) return;

		setLoading(false);

		if (fetchError) {
			setError(fetchError.message);
			return;
		}

		const quizzes = data ?? [];
		const ids = quizzes.map((q) => q.id);
		let counts: Record<string, number>;
		try {
			counts = await getAttemptCounts(ids);
		} catch {
			counts = {};
		}
		for (const q of quizzes) {
			q.times_taken = counts[q.id] ?? 0;
		}
		setAllQuizzes(quizzes);
		setLoading(false);
	}, [filters.category, filters.difficulty, filters.sort]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		fetchQuizzes();
	}, [fetchQuizzes]);

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
