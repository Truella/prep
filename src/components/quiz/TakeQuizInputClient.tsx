"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import ExternalNav from "../ExternalNav";

const CODE_REGEX = /^[A-Z0-9]{6}$/;

export default function TakeQuizInputClient() {
  const [input, setInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (CODE_REGEX.test(quizId)) {
      setResolving(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id")
        .eq("code", quizId)
        .maybeSingle();
      setResolving(false);

      if (error || !data) {
        toast.error("No quiz found with that code");
        return;
      }
      router.push(`/quiz/${data.id}`);
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
              placeholder="https://prep.app/quiz/... or code"
              className="w-full px-4 py-3.5 rounded-xl text-sm focus:outline-none transition"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={resolving}
              className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0A0A0F",
              }}
            >
              {resolving ? "Looking up..." : "Start Quiz"}
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