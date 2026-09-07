"use client";

import Link from "next/link";
import type { PublicQuiz } from "@/lib/types";
import { DIFFICULTY_STYLES } from "@/features/quiz-bank/constants/quizBank";

export default function QuizBankCard({ quiz }: { quiz: PublicQuiz }) {
  const stars = Math.round(quiz.average_rating ?? 0);

  return (
    <div
      className="group rounded-2xl p-5 space-y-4 flex flex-col transition-all duration-150 hover:scale-[1.02]"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-2 flex-1">
        <div className="space-y-2 flex-1">
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
            {quiz.category && (
              <span
                className="text-xs px-2 py-0.5 rounded font-mono"
                style={{
                  backgroundColor: "var(--color-surface-raised)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {quiz.category}
              </span>
            )}
            {quiz.difficulty && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[quiz.difficulty] ?? ""}`}
              >
                {quiz.difficulty}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between text-xs pt-2 border-t"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span>
          {"★".repeat(stars)}{"☆".repeat(5 - stars)}{" "}
          {quiz.average_rating !== null ? quiz.average_rating.toFixed(1) : "—"}
        </span>
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
