import TakeQuizClient from "../../../src/components/quiz/TakeQuizClient";

interface PageProps {
	params: Promise<{ quizId: string }>;
}

export default async function TakeQuizPage({ params }: PageProps) {
	const { quizId } = await params;
	return <TakeQuizClient quizId={quizId} />;
}
