"use client";

export default function QuizBankLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-2xl animate-pulse"
          style={{ backgroundColor: "var(--color-surface)" }}
        />
      ))}
    </div>
  );
}