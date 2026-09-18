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
  Tick02Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/quiz/${quiz.id}` : `/quiz/${quiz.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  // Guide: Icon → Title → Description → Tags → Quiz stats → Take Quiz
  // Illustration → small icon in compact area, Accuracy/Completion removed, tags kept, stats = questions • time • taken
  return (
    <div
      className="group relative rounded-2xl p-5 flex flex-col transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg border overflow-hidden w-full max-w-[380px] mx-auto h-[320px] min-h-[320px] will-change-transform"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: categoryTokens ? `color-mix(in srgb, ${categoryTokens.accent} 18%, var(--color-border))` : "var(--color-border)",
        borderTopColor: categoryTokens ? `color-mix(in srgb, ${categoryTokens.accent} 35%, transparent)` : undefined,
        borderTopWidth: categoryTokens ? 2 : undefined,
      }}
    >
      {/* Top: icon left, more menu right — mirrors image's header without illustration */}
      <div className="flex items-start justify-between gap-3">
        {Icon && categoryTokens ? (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: categoryTokens.surface, color: categoryTokens.accent }}
          >
            <HugeiconsIcon icon={Icon} size={18} />
          </div>
        ) : (
          <div className="w-10 h-10" />
        )}
        <button
          type="button"
          onClick={handleShare}
          aria-label={copied ? "Link copied" : "Copy quiz link"}
          title={copied ? "Copied!" : "Copy link"}
          className="w-9 h-9 rounded-full border flex items-center justify-center transition hover:scale-105 active:scale-95 shrink-0"
          style={{
            backgroundColor: copied ? "var(--color-text-primary)" : "var(--color-surface)",
            color: copied ? "var(--color-bg)" : "var(--color-text-secondary)",
            borderColor: "var(--color-border)",
          }}
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Share08Icon} size={18} />
        </button>
      </div>

      {/* Title + Description */}
      <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 mt-4" style={{ color: "var(--color-text-primary)" }}>
        {quiz.title}
      </h3>
      {quiz.description && (
        <p className="text-xs line-clamp-2 leading-relaxed mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          {quiz.description}
        </p>
      )}

      {/* Tags — like UI/UX + Not Urgent, but with Technology + Beginner */}
      <div className="flex items-center gap-2 flex-wrap mt-4">
        {quiz.category && categoryTokens && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: "var(--color-surface-raised)",
              color: "var(--color-text-secondary)",
              borderColor: "var(--color-border)",
            }}
          >
            {quiz.category}
          </span>
        )}
        {quiz.difficulty && difficultyTokens && (
          <span
            className="text-xs px-2.5 py-1 rounded-full border"
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

      <div className="flex-1" />

      {/* Quiz stats — like 10 Question row, but with 24 questions • 25 min • 412 taken */}
      <div className="flex items-center gap-2 text-xs pt-4 mt-4 border-t flex-wrap" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
        <span style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          {quiz.question_count != null ? `${quiz.question_count} question${quiz.question_count === 1 ? "" : "s"}` : "— questions"}
        </span>
        <span className="opacity-40">•</span>
        <span>{quiz.time_limit ? `${quiz.time_limit} min` : "No time limit"}</span>
        <span className="opacity-40">•</span>
        <span>{quiz.times_taken.toLocaleString("en-US")} taken</span>
      </div>

      {/* Take Quiz — per-category color */}
      <Link
        href={`/quiz/${quiz.id}`}
        className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 border mt-3"
        style={
          categoryTokens
            ? {
                backgroundColor: categoryTokens.surface,
                color: categoryTokens.accent,
                borderColor: `color-mix(in srgb, ${categoryTokens.accent} 22%, transparent)`,
              }
            : {
                backgroundColor: "var(--color-text-primary)",
                color: "var(--color-bg)",
                borderColor: "transparent",
              }
        }
      >
        Take Quiz
      </Link>
    </div>
  );
}
