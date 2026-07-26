"use client";

import QuizBankCard from "./QuizBankCard";
import FadeUp from "../home/FadeUp";

export default function QuizBankGrid({ quizzes }: { quizzes: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map((quiz, i) => (
        <FadeUp key={quiz.id} delay={i * 0.04}>
          <QuizBankCard quiz={quiz} />
        </FadeUp>
      ))}
    </div>
  );
}