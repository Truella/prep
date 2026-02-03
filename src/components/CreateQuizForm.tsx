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
		<form className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Quiz Title
				</label>
				<input
					type="text"
					placeholder="Enter quiz title"
					value={quiz.title}
					onChange={(e) =>
						setQuiz((prev) => ({ ...prev, title: e.target.value }))
					}
					disabled={!!quiz.id}
					className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Description
				</label>
				<textarea
					placeholder="Enter quiz description"
					value={quiz.description}
					onChange={(e) =>
						setQuiz((prev) => ({
							...prev,
							description: e.target.value,
						}))
					}
					disabled={!!quiz.id}
					rows={3}
					className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
				/>
			</div>

			<button
				onClick={() => handleCreateQuiz(quiz, setIsCreatingQuiz, setQuiz)}
				disabled={!!quiz.id || isCreatingQuiz}
				type="button"
				className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
			>
				{isCreatingQuiz ? (
					<span className="flex items-center justify-center gap-2">
						<svg
							className="animate-spin h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Creating...
					</span>
				) : (
					"Create Quiz"
				)}
			</button>
		</form>
	);
}
