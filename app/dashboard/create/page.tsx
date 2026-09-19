import { Suspense } from "react";
import CreateQuizCSV from "@/features/quiz-management/views/CreateQuiz";
import CreateQuizSkeleton from "@/features/quiz-management/components/create/CreateQuizSkeleton";

export default function CreateQuizPage() {
	return (
		<Suspense fallback={<CreateQuizSkeleton />}>
			<CreateQuizCSV />
		</Suspense>
	);
}
