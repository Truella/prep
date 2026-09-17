"use client";

import { useQuizBank } from "@/features/quiz-bank/hooks/useQuizBank";
import QuizBankFilters from "@/features/quiz-bank/components/QuizBankFilters";
import QuizBankGrid from "@/features/quiz-bank/components/QuizBankGrid";
import QuizBankEmpty from "@/features/quiz-bank/components/QuizBankEmpty";
import QuizBankLoading from "@/features/quiz-bank/components/QuizBankLoading";
import QuizBankError from "@/features/quiz-bank/components/QuizBankError";
import QuizBankHero from "@/features/quiz-bank/components/QuizBankHero";
import QuizBankTakeInput from "@/features/quiz-bank/components/QuizBankTakeInput";
import ExternalNav from "@/shared/navigation/ExternalNav";
import FadeUp from "@/shared/components/FadeUp";
import type { QuizCategory, QuizDifficulty } from "@/lib/types";

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

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left — public quizzes container */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="space-y-8">
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

          {/* Right — small card */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div
                className="rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm border"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Got a quiz code or link?
                  </h2>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    Paste it to jump straight to the quiz.
                  </p>
                </div>
                <QuizBankTakeInput />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
