"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const CODE_REGEX = /^[A-Z0-9]{6}$/;

export default function QuizBankTakeInput() {
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
    const candidateCode = quizId.toUpperCase();
    if (CODE_REGEX.test(candidateCode)) {
      setResolving(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("id")
        .eq("code", candidateCode)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste link or code"
        className="w-full px-4 py-3 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-text-primary/10 transition"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
        }}
      />
      <button
        type="submit"
        disabled={resolving}
        className="w-full px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:opacity-90 disabled:opacity-50"
        style={{
          backgroundColor: "var(--color-text-primary)",
          color: "var(--color-bg)",
        }}
      >
        {resolving ? "Looking up..." : "Start Quiz"}
      </button>
    </form>
  );
}
