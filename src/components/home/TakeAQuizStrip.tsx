"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import FadeUp from "./FadeUp";

const CODE_REGEX = /^[A-Z0-9]{6}$/;

export default function TakeAQuizStrip() {
  const [input, setInput] = useState("");
  const [resolving, setResolving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Paste a quiz link or code");
      return;
    }

    let quizId = input.trim();

    if (input.includes("/quiz/")) {
      const parts = input.split("/quiz/");
      quizId = parts[1].split("?")[0];
    }

    if (!quizId) {
      toast.error("Invalid quiz link or code");
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
    <section
      className="py-24 px-6 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeUp>
          <h2
            className="text-3xl mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Take a quiz
          </h2>
          <p
            className="text-sm mb-10"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Paste a quiz link or enter a code to start.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://prep.app/quiz/... or code"
              autoFocus
              className="flex-1 px-4 py-3.5 rounded-xl text-sm focus:outline-none transition"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={resolving}
              className="shrink-0 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "#0A0A0F",
              }}
            >
              {resolving ? "..." : "Start"}
            </button>
          </form>
        </FadeUp>
      </div>
    </section>
  );
}
