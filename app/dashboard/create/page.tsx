import { Suspense } from "react";
import CreateQuizCSV from "../../../src/views/CreateQuiz";

export default function CreateQuizPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
			<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
		</div>}>
			<CreateQuizCSV />
		</Suspense>
	);
}
