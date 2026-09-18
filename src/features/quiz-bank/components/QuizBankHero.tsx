"use client";

import FadeUp from "@/shared/components/FadeUp";

export default function QuizBankHero() {
  return (
    <FadeUp>
      <div className="space-y-1">
        <h1
          className="text-4xl"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          Quiz Bank
        </h1>
        <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--color-text-secondary)" }}>
          Browse and take public quizzes created by the community.
        </p>
      </div>
    </FadeUp>
  );
}
