import React from "react";
import { handleCSVUpload, handleUploadQuestions } from "../utils/handlers";
import type { QuizDraft, PreviewQuestion } from "../lib/types";

export default function UploadQuestionsForm({
	quiz,
	questions,
	isUploadingQuestions,
	setQuestions,
	setIsUploadingQuestions,
	setShareableLink,
}: {
	quiz: QuizDraft;
	questions: PreviewQuestion[];
	isUploadingQuestions: boolean;
	setQuestions: React.Dispatch<React.SetStateAction<PreviewQuestion[]>>;
	setIsUploadingQuestions: React.Dispatch<React.SetStateAction<boolean>>;
	setShareableLink: React.Dispatch<React.SetStateAction<string | null>>;
}) {
	return (
		<form className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Upload Questions (CSV)
				</label>
				<div className="relative">
					<input
						type="file"
						accept=".csv"
						onChange={(e) => handleCSVUpload(e, setQuestions)}
						disabled={!quiz.id}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-gray-100 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
					/>
				</div>
				<p className="mt-2 text-xs text-gray-400">
					Format: Question, Option_A, Option_B, Option_C, Option_D,
					Correct_Answer, Points
				</p>
			</div>

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
				type="button"
				className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
			>
				{isUploadingQuestions ? (
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
						Publishing...
					</span>
				) : (
					"Publish Quiz"
				)}
			</button>
		</form>
	);
}
