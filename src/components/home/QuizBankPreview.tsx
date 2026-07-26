"use client";

import Link from "next/link";
import FadeUp from "./FadeUp";

const SAMPLE_QUIZZES = [
  { title: "Cell Biology — Chapter 3", category: "Biology", difficulty: "Intermediate", taken: 142 },
  { title: "WAEC Mathematics 2023", category: "Mathematics", difficulty: "Advanced", taken: 891 },
  { title: "Introduction to Microeconomics", category: "Economics", difficulty: "Beginner", taken: 204 },
];

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 bg-green-500/10 border-green-500/20",
  Intermediate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Advanced: "text-red-500 bg-red-500/10 border-red-500/20",
};

export default function QuizBankPreview() {
  return (
    <section
      className="py-24 px-6 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-6xl mx-auto">
        <FadeUp className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="text-3xl mb-2"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              From the Quiz Bank
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Practice with quizzes shared by other students.
            </p>
          </div>
          <Link
            href="/quiz-bank"
            className="text-sm font-medium hidden sm:block"
            style={{ color: "var(--color-accent)" }}
          >
            Browse all →
          </Link>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_QUIZZES.map((quiz, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              <div
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="font-semibold text-sm leading-snug"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {quiz.title}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[quiz.difficulty]}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded font-mono"
                  style={{
                    backgroundColor: "var(--color-surface-raised)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {quiz.category}
                </span>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {quiz.taken.toLocaleString()} taken
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/quiz-bank"
            className="text-sm font-medium"
            style={{ color: "var(--color-accent)" }}
          >
            Browse all →
          </Link>
        </div>
      </div>
    </section>
  );
}