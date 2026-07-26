"use client";

import { QUIZ_CATEGORIES } from "../../lib/types";
import type { QuizCategory, QuizDifficulty } from "../../lib/types";

type SortOption = "popular" | "rated" | "newest" | "alphabetical";

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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
	{ value: "newest", label: "Newest" },
	{ value: "popular", label: "Most Taken" },
	{ value: "rated", label: "Highest Rated" },
	{ value: "alphabetical", label: "Alphabetical" },
];

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
		<div className="flex flex-wrap gap-3">
			<input
				type="text"
				aria-label="Search quizzes"
				placeholder="Search quizzes..."
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition text-sm"
			/>
			<select
				aria-label="Filter by category"
				value={category ?? ""}
				onChange={(e) =>
					onCategoryChange((e.target.value as QuizCategory) || null)
				}
				className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition text-sm"
			>
				<option value="">All Categories</option>
				{QUIZ_CATEGORIES.map((c) => (
					<option key={c} value={c}>
						{c}
					</option>
				))}
			</select>
			<select
				aria-label="Filter by difficulty"
				value={difficulty ?? ""}
				onChange={(e) =>
					onDifficultyChange(
						(e.target.value as QuizDifficulty) || null
					)
				}
				className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition text-sm"
			>
				<option value="">All Difficulties</option>
				{(
					["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]
				).map((d) => (
					<option key={d} value={d}>
						{d}
					</option>
				))}
			</select>
			<select
				aria-label="Sort quizzes"
				value={sort}
				onChange={(e) => onSortChange(e.target.value as SortOption)}
				className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition text-sm"
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
