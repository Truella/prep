import QuizDetailView from "../../../../src/views/QuizDetailView";
import type { Metadata } from "next";

interface PageProps {
	params: Promise<{ quizId: string }>;
}

export const metadata: Metadata = {
	title: "Quiz Details",
};

export default async function QuizDetailPage({ params }: PageProps) {
	const { quizId } = await params;
	return <QuizDetailView quizId={quizId} />;
}
