"use client";

import Link from "next/link";

export default function QuizBankEmpty() {
  return (
    <div className="text-center py-16 space-y-3">
      <p className="text-2xl">◎</p>
      <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>
        No quizzes found
      </p>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Try adjusting your filters, or{" "}
        <Link href="/auth" style={{ color: "var(--color-accent)" }}>
          create the first one
        </Link>
        .
      </p>
    </div>
  );
}