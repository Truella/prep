import type { Metadata } from "next";
import QuizBankView from "../../src/views/QuizBankView";

export const metadata: Metadata = {
	title: "Quiz Bank — PREP",
	description:
		"Browse and take public quizzes created by the PREP community.",
};

export default function QuizBankPage() {
	return <QuizBankView />;
}
