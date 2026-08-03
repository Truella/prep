import type { Metadata } from "next";
import QuizBankView from "@/features/quiz-bank/views/QuizBankView";

export const metadata: Metadata = {
  title: "Quiz Bank",
  description: "Browse and take public quizzes created by the community.",
};

export default function QuizBankPage() {
  return <QuizBankView />;
}
