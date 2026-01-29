import React from "react";
import { handleCSVUpload, handleUploadQuestions } from "../utils/handlers";
import type { QuizDraft, Question } from "../lib/types";
export default function UploadQuestionsForm({
	quiz,
	questions,
	isUploadingQuestions,
	setQuestions,
	setIsUploadingQuestions,
	setShareableLink,
}: {
	quiz: QuizDraft;
	questions: Question[];
	isUploadingQuestions: boolean;
	setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
	setIsUploadingQuestions: React.Dispatch<React.SetStateAction<boolean>>;
	setShareableLink: React.Dispatch<React.SetStateAction<string | null>>;
}) {
	return (
		<form>
			<label className="block mb-2 font-medium text-gray-700">Upload CSV</label>
			<input
				type="file"
				accept=".csv"
				onChange={(e) => handleCSVUpload(e, setQuestions)}
				disabled={!quiz.id}
				className="border rounded px-3 py-2"
			/>

			<button
				onClick={() =>
					handleUploadQuestions(
						quiz,
						questions,
						setIsUploadingQuestions,
						setShareableLink,
					)
				}
				disabled={!quiz.id || questions.length === 0 || isUploadingQuestions}
				className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
			>
				Publish Quiz
			</button>
		</form>
	);
}
