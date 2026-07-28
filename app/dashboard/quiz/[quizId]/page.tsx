import QuizDetailView from "../../../../src/views/QuizDetailView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Quiz Details",
};

export default function QuizDetailPage({
	params,
}: {
	params: { quizId: string };
}) {
	return <QuizDetailView quizId={params.quizId} />;
}
