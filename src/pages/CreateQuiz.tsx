import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { QuizDraft, Question } from "../lib/types";
import CreateQuizForm from "../components/CreateQuizForm";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import QuizPreview from "../components/QuizPreview";
import ShareableLink from "../components/ShareableLink";
export default function CreateQuizCSV() {
	const { signOut } = useAuth();
	const [shareableLink, setShareableLink] = useState<string | null>(null);
	const [quiz, setQuiz] = useState<QuizDraft>({
		title: "",
		description: "",
	});
	const [questions, setQuestions] = useState<Question[]>([]);
	const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
	const [isUploadingQuestions, setIsUploadingQuestions] = useState(false);
	return (
		<div className="container mx-auto px-4 py-8 space-y-8">
			<div className="flex justify-end">
				<button
					onClick={signOut}
					className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
				>
					Log out
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 max-w-md">
				<div className="p-4 bg-blue-100 rounded text-center">
					<p className="text-gray-700">Quiz Status</p>
					<p className="text-xl font-bold">
						{quiz.id ? "Draft Created" : "Not Created"}
					</p>
				</div>
				<div className="p-4 bg-green-100 rounded text-center">
					<p className="text-gray-700">Total Questions</p>
					<p className="text-2xl font-bold">{questions.length}</p>
				</div>
			</div>

			<div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow space-y-4">
				<h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>

				<CreateQuizForm
					quiz={quiz}
					setQuiz={setQuiz}
					setIsCreatingQuiz={setIsCreatingQuiz}
					isCreatingQuiz={isCreatingQuiz}
				/>
				<UploadQuestionsForm
					quiz={quiz}
					questions={questions}
					isUploadingQuestions={isUploadingQuestions}
					setQuestions={setQuestions}
					setIsUploadingQuestions={setIsUploadingQuestions}
					setShareableLink={setShareableLink}
				/>

				{questions.length > 0 && (
					<QuizPreview questions={questions} />
				)}
				{shareableLink && (
					<ShareableLink shareableLink={shareableLink} />
				)}
			</div>
		</div>
	);
}
