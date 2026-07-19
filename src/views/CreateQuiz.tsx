import React, { useState } from "react";
import type { QuizDraft, PreviewQuestion } from "../lib/types";
import CreateQuizForm from "../components/CreateQuizForm";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import QuizPreview from "../components/QuizPreview";
import ShareableLink from "../components/ShareableLink";

export default function CreateQuizCSV() {
	const [shareableLink, setShareableLink] = useState<string | null>(null);
	const [quiz, setQuiz] = useState<QuizDraft>({
		title: "",
		description: "",
	});
	const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
	const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
	const [isUploadingQuestions, setIsUploadingQuestions] = useState(false);

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-8 space-y-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
						<p className="text-gray-400 text-sm mb-1">Quiz Status</p>
						<p className="text-xl font-bold text-white">
							{quiz.id ? "Draft Created" : "Not Created"}
						</p>
					</div>
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
						<p className="text-gray-400 text-sm mb-1">Total Questions</p>
						<p className="text-2xl font-bold text-white">{questions.length}</p>
					</div>
				</div>

				{/* Main Form Container */}
				<div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-8">
					<CreateQuizForm
						quiz={quiz}
						setQuiz={setQuiz}
						setIsCreatingQuiz={setIsCreatingQuiz}
						isCreatingQuiz={isCreatingQuiz}
					/>

					{/* Divider */}
					{quiz.id && (
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-white/10" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-black/50 text-gray-400">
									Upload Questions
								</span>
							</div>
						</div>
					)}

					<UploadQuestionsForm
						quiz={quiz}
						questions={questions}
						isUploadingQuestions={isUploadingQuestions}
						setQuestions={setQuestions}
						setIsUploadingQuestions={setIsUploadingQuestions}
						setShareableLink={setShareableLink}
					/>

					{/* Shareable Link - Outside main container for emphasis */}
					{shareableLink && (
						<div className="max-w-3xl mx-auto">
							<ShareableLink shareableLink={shareableLink} />
						</div>
					)}
					{questions.length > 0 && (
						<>
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-white/10" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-black/50 text-gray-400">
										Preview
									</span>
								</div>
							</div>
							<QuizPreview questions={questions} />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
