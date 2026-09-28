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
  const filteredMocks = MOCK_QUIZZES.filter(
    (m) =>
      (!filters.category || m.category === filters.category) &&
      (!filters.difficulty || m.difficulty === filters.difficulty) &&
      (!searchQuery || m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const rawDisplay =
    isDevPreview && !loading && !error && quizzes.length < 10 ? [...quizzes, ...filteredMocks].slice(0, 12) : quizzes;
  // Re-sort the combined (real + mock) set so alphabetical/popular etc. include mocks — otherwise mocks were appended unsorted
  const displayQuizzes = (() => {
    const arr = [...rawDisplay];
    switch (filters.sort) {
      case "alphabetical":
        return arr.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
      case "popular":
        return arr.sort((a, b) => (b.times_taken ?? 0) - (a.times_taken ?? 0));
      case "newest":
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "oldest":
        return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return arr;
    }
  })();
  const displayIsMock = isDevPreview && rawDisplay !== quizzes;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <ExternalNav />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
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

          {/* Right — small card — sticky on scroll on lg+ */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 lg:self-start">
            {/* Mobile: static below grid */}
            <div className="lg:hidden">
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
            {/* Desktop: sticky within grid — stays visible while left scrolls, no overlap */}
            <div className="hidden lg:block lg:z-10">
              <div
                className="rounded-2xl p-5 sm:p-6 space-y-3 shadow-lg border"
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
