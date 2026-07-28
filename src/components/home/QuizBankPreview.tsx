"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import FadeUp from "./FadeUp";
import type { PublicQuiz } from "../../lib/types";

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "text-green-500 bg-green-500/10 border-green-500/20",
  Intermediate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  Advanced: "text-red-500 bg-red-500/10 border-red-500/20",
};

export default function QuizBankPreview() {
  const [preview, setPreview] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("quizzes")
      .select("id, title, description, category, difficulty, times_taken, average_rating, created_at")
      .eq("visibility", "public")
      .order("times_taken", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setPreview(data);
        setLoading(false);
      });
  }, []);

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border animate-pulse"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="h-4 w-3/4 rounded mb-3" style={{ backgroundColor: "var(--color-surface-raised)" }} />
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: "var(--color-surface-raised)" }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {preview.map((quiz, i) => (
              <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                <FadeUp delay={i * 0.1}>
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
                      {quiz.difficulty && (
                        <span
                          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${DIFFICULTY_STYLES[quiz.difficulty] || ""}`}
                        >
                          {quiz.difficulty}
                        </span>
                      )}
                    </div>
                    {quiz.category && (
                      <span
                        className="inline-block text-xs px-2 py-0.5 rounded font-mono"
                        style={{
                          backgroundColor: "var(--color-surface-raised)",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {quiz.category}
                      </span>
                    )}
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {quiz.times_taken.toLocaleString()} taken
                    </p>
                  </div>
                </FadeUp>
              </Link>
            ))}
          </div>
        )}

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
