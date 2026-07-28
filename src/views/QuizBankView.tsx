"use client";

import { useQuizBank } from "../hooks/useQuizBank";
import QuizBankFilters from "../components/quiz-bank/QuizBankFilters";
import QuizBankGrid from "../components/quiz-bank/QuizBankGrid";
import QuizBankEmpty from "../components/quiz-bank/QuizBankEmpty";
import QuizBankLoading from "../components/quiz-bank/QuizBankLoading";
import QuizBankError from "../components/quiz-bank/QuizBankError";
import QuizBankHero from "../components/quiz-bank/QuizBankHero";
import ExternalNav from "../components/ExternalNav";
import FadeUp from "../components/home/FadeUp";
import type { QuizCategory, QuizDifficulty } from "../lib/types";

export default function QuizBankView() {
  const {
    quizzes,
    loading,
    error,
    filters,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useQuizBank();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <ExternalNav />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-10">
        <QuizBankHero />

        <FadeUp delay={0.1}>
          <QuizBankFilters
            category={filters.category}
            difficulty={filters.difficulty}
            sort={filters.sort}
            searchQuery={searchQuery}
            onCategoryChange={(v) => setFilter("category", v as QuizCategory | null)}
            onDifficultyChange={(v) => setFilter("difficulty", v as QuizDifficulty | null)}
            onSortChange={(v) => setFilter("sort", v)}
            onSearchChange={setSearchQuery}
          />
        </FadeUp>

        {loading && <QuizBankLoading />}
        {error && <QuizBankError />}
        {!loading && !error && quizzes.length === 0 && <QuizBankEmpty />}
        {!loading && !error && quizzes.length > 0 && (
          <FadeUp>
            <QuizBankGrid quizzes={quizzes} />
          </FadeUp>
        )}
      </div>
    </div>
  );
}