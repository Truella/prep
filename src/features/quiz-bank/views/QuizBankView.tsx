"use client";

import { useQuizBank } from "@/features/quiz-bank/hooks/useQuizBank";
import QuizBankFilters from "@/features/quiz-bank/components/QuizBankFilters";
import QuizBankGrid from "@/features/quiz-bank/components/QuizBankGrid";
import QuizBankEmpty from "@/features/quiz-bank/components/QuizBankEmpty";
import QuizBankLoading from "@/features/quiz-bank/components/QuizBankLoading";
import QuizBankError from "@/features/quiz-bank/components/QuizBankError";
import QuizBankHero from "@/features/quiz-bank/components/QuizBankHero";
import QuizBankTakeInput from "@/features/quiz-bank/components/QuizBankTakeInput";
import { MOCK_QUIZZES } from "@/features/quiz-bank/mocks/mockQuizzes";
import { CATEGORY_HUE } from "@/features/quiz-bank/constants/quizBank";
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

  // Dev preview: merge mock quizzes with real data so you can see all category/difficulty hues live.
  // Remove this block when DB is seeded with diverse public quizzes.
  const isDevPreview = process.env.NODE_ENV !== "production";
  const rawDisplay =
    isDevPreview && !loading && !error && quizzes.length < 10 ? [...quizzes, ...MOCK_QUIZZES].slice(0, 12) : quizzes;
  const displayIsMock = isDevPreview && rawDisplay !== quizzes;

  // Visual grouping by hue — keeps existing sort logic (popular/newest etc.) in useQuizBank,
  // but re-orders the current result set for display so amber/sage/sky blocks read together
  const HUE_ORDER: Record<string, number> = { sage: 0, coral: 1, sky: 2, amber: 3, magenta: 4, teal: 5 };
  const displayQuizzes = [...rawDisplay].sort((a, b) => {
    const ha = a.category ? CATEGORY_HUE[a.category] ?? "teal" : "teal";
    const hb = b.category ? CATEGORY_HUE[b.category] ?? "teal" : "teal";
    return (HUE_ORDER[ha] ?? 99) - (HUE_ORDER[hb] ?? 99);
  });

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

              {displayIsMock && !loading && !error && (
                <div
                  className="text-xs px-3 py-2 rounded-xl border"
                  style={{
                    backgroundColor: "var(--color-amber-surface)",
                    borderColor: "color-mix(in srgb, var(--color-amber-accent) 20%, transparent)",
                    color: "var(--color-amber-accent)",
                  }}
                >
                  Previewing mock quizzes — real DB has only {quizzes.length} public quizzes. Remove <code>MOCK_QUIZZES</code> merge in <code>QuizBankView.tsx</code> when seeded.
                </div>
              )}
              {loading && <QuizBankLoading />}
              {error && <QuizBankError />}
              {!loading && !error && displayQuizzes.length === 0 && <QuizBankEmpty />}
              {!loading && !error && displayQuizzes.length > 0 && (
                <FadeUp>
                  <QuizBankGrid quizzes={displayQuizzes} />
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
