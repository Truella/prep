"use client";

import { SORT_OPTIONS, DIFFICULTY_OPTIONS } from "@/features/quiz-bank/constants/quizBank";
import type { SortOption } from "@/features/quiz-bank/constants/quizBank";
import type { QuizCategory, QuizDifficulty } from "@/lib/types";
import Dropdown from "@/shared/ui/Dropdown";
import { QUIZ_CATEGORIES } from "@/lib/types";

interface QuizBankFiltersProps {
  category: QuizCategory | null;
  difficulty: QuizDifficulty | null;
  sort: SortOption;
  searchQuery: string;
  onCategoryChange: (v: QuizCategory | null) => void;
  onDifficultyChange: (v: QuizDifficulty | null) => void;
  onSortChange: (v: SortOption) => void;
  onSearchChange: (v: string) => void;
}

export default function QuizBankFilters({
  category,
  difficulty,
  sort,
  searchQuery,
  onCategoryChange,
  onDifficultyChange,
  onSortChange,
  onSearchChange,
}: QuizBankFiltersProps) {
    return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <input
        type="text"
        placeholder="Search quizzes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:w-56 sm:flex-none px-4 py-2.5 rounded-xl text-sm focus:outline-none transition shrink-0"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />

      <Dropdown
        ariaLabel="Filter by category"
        value={category ?? ""}
        onChange={(v) => onCategoryChange((v as QuizCategory) || null)}
        options={[{ value: "", label: "All Categories" }, ...QUIZ_CATEGORIES.map((c) => ({ value: c, label: c }))]}
        placeholder="All Categories"
        className="min-w-[170px]"
      />

      <Dropdown
        ariaLabel="Filter by difficulty"
        value={difficulty ?? ""}
        onChange={(v) => onDifficultyChange((v as QuizDifficulty) || null)}
        options={[{ value: "", label: "All Difficulties" }, ...DIFFICULTY_OPTIONS.map((d) => ({ value: d as string, label: d as string }))]}
        placeholder="All Difficulties"
        className="flex-1 min-w-[150px]"
      />

      <Dropdown
        ariaLabel="Sort quizzes"
        value={sort}
        onChange={(v) => onSortChange(v as SortOption)}
        options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        placeholder="Sort"
        className="flex-1 min-w-[150px]"
      />
    </div>
  );
}
