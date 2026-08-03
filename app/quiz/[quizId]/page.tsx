import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import TakeQuizClient from "@/features/quiz-taking/components/TakeQuizClient";

interface PageProps {
	params: Promise<{ quizId: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { quizId } = await params;
	const { data } = await supabase
		.from("quizzes")
		.select("title")
		.eq("id", quizId)
		.single();

	return {
		title: data?.title ?? "Quiz",
	};
}

export default async function TakeQuizPage({ params }: PageProps) {
	const { quizId } = await params;
	return <TakeQuizClient quizId={quizId} />;
}
