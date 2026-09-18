"use client";

import QuizBankCard from "./QuizBankCard";
import FadeUp from "@/shared/components/FadeUp";
import type { PublicQuiz } from "@/lib/types";

export default function QuizBankGrid({ quizzes }: { quizzes: PublicQuiz[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {quizzes.map((quiz, i) => (
        <FadeUp key={quiz.id} delay={i * 0.04} className="w-full flex justify-center">
          <QuizBankCard quiz={quiz} />
        </FadeUp>
      ))}
    </div>
  );
}
