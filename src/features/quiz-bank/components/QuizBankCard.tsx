"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Idea01Icon,
  Atom01Icon,
  Book02Icon,
  Calculator01Icon,
  BookOpen02Icon,
  PaintBoardIcon,
  Globe02Icon,
  MedicalFileIcon,
  ChartUpIcon,
  AiComputerIcon,
} from "@hugeicons/core-free-icons";
import type { PublicQuiz } from "@/lib/types";
import {
  DIFFICULTY_HUE,
  HUE_TOKENS,
  CATEGORY_HUE,
} from "@/features/quiz-bank/constants/quizBank";

const CATEGORY_ICON: Record<string, typeof Idea01Icon> = {
  "General Knowledge": Idea01Icon,
  Science: Atom01Icon,
  History: Book02Icon,
  Mathematics: Calculator01Icon,
  "Language & Literature": BookOpen02Icon,
  Technology: AiComputerIcon,
  "Arts & Culture": PaintBoardIcon,
  Geography: Globe02Icon,
  "Health & Medicine": MedicalFileIcon,
  "Business & Economics": ChartUpIcon,
};

export default function QuizBankCard({ quiz }: { quiz: PublicQuiz }) {
  const categoryHue = quiz.category ? CATEGORY_HUE[quiz.category] ?? "teal" : null;
  const categoryTokens = categoryHue ? HUE_TOKENS[categoryHue] : null;
  const difficultyHue = quiz.difficulty ? DIFFICULTY_HUE[quiz.difficulty] ?? null : null;
  const difficultyTokens = difficultyHue ? HUE_TOKENS[difficultyHue] : null;
  const Icon = quiz.category ? CATEGORY_ICON[quiz.category] : null;

  return (
    <div
      className="group rounded-2xl p-5 space-y-4 flex flex-col transition-all duration-150 hover:scale-[1.02] border overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: categoryTokens ? `color-mix(in srgb, ${categoryTokens.accent} 18%, var(--color-border))` : "var(--color-border)",
        borderTopColor: categoryTokens ? `color-mix(in srgb, ${categoryTokens.accent} 35%, transparent)` : undefined,
        borderTopWidth: categoryTokens ? 2 : undefined,
      }}
    >
      <div className="flex items-start gap-3 flex-1">
        {Icon && categoryTokens && (
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: categoryTokens.surface,
              color: categoryTokens.accent,
            }}
          >
            <HugeiconsIcon icon={Icon} size={18} />
          </div>
        )}
        <div className="space-y-2 flex-1 min-w-0">
          <h3
            className="font-semibold text-sm leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            {quiz.title}
          </h3>

          {quiz.description && (
            <p
              className="text-xs line-clamp-2 leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {quiz.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {quiz.category && categoryTokens && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono border"
                style={{
                  backgroundColor: categoryTokens.surface,
                  color: categoryTokens.accent,
                  borderColor: `color-mix(in srgb, ${categoryTokens.accent} 22%, transparent)`,
                }}
              >
                {quiz.category}
              </span>
            )}
            {quiz.difficulty && difficultyTokens && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: difficultyTokens.surface,
                  color: difficultyTokens.accent,
                  borderColor: `color-mix(in srgb, ${difficultyTokens.accent} 22%, transparent)`,
                }}
              >
                {quiz.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center text-xs pt-2 border-t"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span>{quiz.times_taken.toLocaleString("en-US")} taken</span>
      </div>

      <Link
        href={`/quiz/${quiz.id}`}
        className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#0A0A0F",
        }}
      >
        Take Quiz
      </Link>
    </div>
  );
}
