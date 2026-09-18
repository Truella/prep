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
  CircleQuestionMarkIcon,
  Clock01Icon,
  UserGroup02Icon,
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
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (!ok) return;
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  // Guide: Icon → Title → Description → Tags → Quiz stats → Take Quiz
  // Illustration → small icon in compact area, Accuracy/Completion removed, tags kept, stats = questions • time • taken
  return (
    <div
      className="group relative rounded-2xl p-5 flex flex-col w-full h-full min-h-[320px] will-change-transform transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-md border"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
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
          className="w-9 h-9 rounded-full border flex items-center justify-center transition hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          style={{
            backgroundColor: copied ? "var(--color-text-primary)" : "var(--color-surface)",
            color: copied ? "var(--color-bg)" : "var(--color-text-secondary)",
            borderColor: "var(--color-border)",
          }}
        >
          <HugeiconsIcon icon={copied ? Tick02Icon : Share08Icon} size={18} />
        </button>
      </div>

      {/* Title + Description — fixed 2 lines each with line-clamp, not clipped mid-line */}
      <div className="min-h-[3.25rem] mt-4">
        <h3 className="font-semibold text-[15px] leading-snug line-clamp-2" style={{ color: "var(--color-text-primary)" }}>
          {quiz.title || "Untitled Quiz"}
        </h3>
        {quiz.description ? (
          <p className="text-xs line-clamp-2 leading-relaxed mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
            {quiz.description}
          </p>
        ) : (
          <p className="text-xs mt-1.5 invisible" aria-hidden>
            —
          </p>
        )}
      </div>

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

      {/* Quiz stats — with icons, space-between */}
      <div className="flex items-center justify-between gap-2 text-xs pt-4 mt-4 border-t whitespace-nowrap overflow-hidden" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
        <span className="flex items-center gap-1 shrink-0" style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
          <HugeiconsIcon icon={CircleQuestionMarkIcon} size={14} />
          {quiz.question_count != null ? `${quiz.question_count}` : "—"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <HugeiconsIcon icon={Clock01Icon} size={14} />
          {quiz.time_limit ? `${quiz.time_limit}m` : "No time limit"}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <HugeiconsIcon icon={UserGroup02Icon} size={14} />
          {quiz.times_taken.toLocaleString("en-US")} taken
        </span>
      </div>

      {/* Take Quiz — single neutral-dark button across all cards */}
      <Link
        href={`/quiz/${quiz.id}`}
        className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 mt-3"
        style={{
          backgroundColor: "var(--color-text-primary)",
          color: "var(--color-bg)",
        }}
      >
        Take Quiz
      </Link>
    </div>
  );
}
