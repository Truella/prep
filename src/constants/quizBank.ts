export const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 border-green-500/20 bg-green-500/10",
  Intermediate: "text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
  Advanced: "text-red-500 border-red-500/20 bg-red-500/10",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Taken" },
  { value: "rated", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "Alphabetical" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

export type QuizDifficulty = (typeof DIFFICULTY_OPTIONS)[number];