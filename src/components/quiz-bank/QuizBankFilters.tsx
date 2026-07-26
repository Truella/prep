"use client";

import { SORT_OPTIONS, DIFFICULTY_OPTIONS } from "../../constants/quizBank";
import type { SortOption } from "../../constants/quizBank";
import type { QuizCategory, QuizDifficulty } from "../../lib/types";

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
        className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />

      <select
        value={category ?? ""}
        onChange={(e) =>
          onCategoryChange((e.target.value as QuizCategory) || null)
        }
        className="px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        <option value="">All Categories</option>
        <option value="General Knowledge">General Knowledge</option>
        <option value="Science">Science</option>
        <option value="History">History</option>
        <option value="Mathematics">Mathematics</option>
        <option value="Language & Literature">Language & Literature</option>
        <option value="Technology">Technology</option>
        <option value="Arts & Culture">Arts & Culture</option>
        <option value="Geography">Geography</option>
        <option value="Health & Medicine">Health & Medicine</option>
        <option value="Business & Economics">Business & Economics</option>
      </select>

      <select
        value={difficulty ?? ""}
        onChange={(e) =>
          onDifficultyChange((e.target.value as QuizDifficulty) || null)
        }
        className="px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        <option value="">All Difficulties</option>
        {DIFFICULTY_OPTIONS.map((d: QuizDifficulty) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="px-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}