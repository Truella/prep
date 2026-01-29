import React from "react";
import { handleCreateQuiz } from "../utils/handlers";
import type { QuizDraft } from "../lib/types";
export default function CreateQuizForm({
	quiz,
	setQuiz,
	setIsCreatingQuiz,
	isCreatingQuiz,
}: {
	quiz: QuizDraft;
	setQuiz: React.Dispatch<React.SetStateAction<QuizDraft>>;
	setIsCreatingQuiz: React.Dispatch<React.SetStateAction<boolean>>;
	isCreatingQuiz: boolean;
}) {
	return (
		<form>
			<input
				type="text"
				placeholder="Quiz Title"
				value={quiz.title}
				onChange={(e) =>
					setQuiz((prev) => ({ ...prev, title: e.target.value }))
				}
				disabled={!!quiz.id}
				className="w-full border rounded px-4 py-2"
			/>

			<textarea
				placeholder="Description"
				value={quiz.description}
				onChange={(e) =>
					setQuiz((prev) => ({
						...prev,
						description: e.target.value,
					}))
				}
				disabled={!!quiz.id}
				className="w-full border rounded px-4 py-2"
			/>

			<button
				onClick={() => handleCreateQuiz(quiz, setIsCreatingQuiz, setQuiz)}
				disabled={!!quiz.id || isCreatingQuiz}
				className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
			>
				Create Quiz
			</button>
		</form>
	);
}
