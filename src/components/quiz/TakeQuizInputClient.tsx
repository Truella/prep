"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ExternalNav from "../ExternalNav";

export default function TakeQuizInputClient() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a quiz link or ID");
      return;
    }

    let quizId = input.trim();

    if (input.includes("/quiz/")) {
      const parts = input.split("/quiz/");
      quizId = parts[1].split("?")[0];
    }

    if (!quizId) {
      toast.error("Invalid quiz link or ID");
      return;
    }

    router.push(`/quiz/${quizId}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <ExternalNav />

      <div className="flex-1 flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-sm space-y-8">
          {/* Wordmark */}
          <div className="text-center space-y-2">
            <p
              className="text-xs font-mono font-semibold tracking-widest uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              PREP
            </p>
            <h1
              className="text-3xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Take a quiz
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Paste a quiz link or enter an ID to start.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://prep.app/quiz/..."
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="submit"
              className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0A0A0F",
              }}
            >
              Start Quiz
            </button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              or
            </p>
            <Link
              href="/quiz-bank"
              className="text-sm font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Browse public quizzes →
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs transition"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}