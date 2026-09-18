export type CategoryHue = "sage" | "coral" | "sky" | "amber" | "magenta" | "teal";

export const CATEGORY_HUE: Record<string, CategoryHue> = {
  "General Knowledge": "amber",
  Science: "sage",
  History: "sky",
  Mathematics: "coral",
  "Language & Literature": "magenta",
  Technology: "sage",
  "Arts & Culture": "teal",
  Geography: "sky",
  "Health & Medicine": "teal",
  "Business & Economics": "amber",
};

export const CATEGORY_ICON_KEY: Record<string, string> = {
  "General Knowledge": "Idea01",
  Science: "Atom01",
  History: "Book02",
  Mathematics: "Calculator01",
  "Language & Literature": "BookOpen02",
  Technology: "AiComputer",
  "Arts & Culture": "PaintBoard",
  Geography: "Globe02",
  "Health & Medicine": "MedicalFile",
  "Business & Economics": "ChartUp",
};

export const HUE_TOKENS: Record<CategoryHue, { surface: string; accent: string }> = {
  sage: { surface: "var(--color-sage-surface)", accent: "var(--color-sage-accent)" },
  coral: { surface: "var(--color-coral-surface)", accent: "var(--color-coral-accent)" },
  sky: { surface: "var(--color-sky-surface)", accent: "var(--color-sky-accent)" },
  amber: { surface: "var(--color-amber-surface)", accent: "var(--color-amber-accent)" },
  magenta: { surface: "var(--color-magenta-surface)", accent: "var(--color-magenta-accent)" },
  teal: { surface: "var(--color-teal-surface)", accent: "var(--color-teal-accent)" },
};

export const DIFFICULTY_HUE: Record<string, CategoryHue> = {
  Beginner: "sage",
  Intermediate: "amber",
  Advanced: "coral",
};

export const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "border",
  Intermediate: "border",
  Advanced: "border",
};

export const SORT_OPTIONS = [
  { value: "popular", label: "Most Taken" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const DIFFICULTY_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;

export type QuizDifficulty = (typeof DIFFICULTY_OPTIONS)[number];
