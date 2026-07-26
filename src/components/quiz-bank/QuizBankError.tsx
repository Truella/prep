"use client";

export default function QuizBankError() {
  return (
    <div
      className="text-center py-16 text-sm"
      style={{ color: "var(--color-text-secondary)" }}
    >
      Failed to load quizzes. Try refreshing.
    </div>
  );
}