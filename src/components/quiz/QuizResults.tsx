"use client";

import { useState } from "react";
import QuizReview from "./QuizReview";
import { AppQuestion } from "../../lib/types";
import { useAIReview } from "../../hooks/useAIReview";
import type { AIReviewPayload } from "../../lib/types";

interface QuizResultsProps {
	quizTitle: string;
	correctCount: number;
	totalQuestions: number;
	earnedPoints: number;
	totalPoints: number;
	onRetake: () => void;
	quizId: string;
	questions: AppQuestion[];
	userAnswers: { [key: number]: number };
	elapsedSeconds: number;
	isAutoSubmit?: boolean;
	timeLimit?: number | null;
	quizVisibility?: string;
}

export default function QuizResults({
	quizTitle,
	correctCount,
	totalQuestions,
	earnedPoints,
	totalPoints,
	userAnswers,
	questions,
	onRetake,
	elapsedSeconds,
	isAutoSubmit,
	timeLimit,
	quizVisibility,
}: QuizResultsProps) {
	const [showReview, setShowReview] = useState(false);
	const { review, loading, error, getReview } = useAIReview();
	const percentage = Math.round((earnedPoints / totalPoints) * 100);

	const reviewPayload: AIReviewPayload = {
		questions,
		selectedAnswers: userAnswers,
		score: earnedPoints,
		totalPoints,
	};
	const passed = percentage >= 70;

	if (showReview) {
		return (
			<QuizReview
				questions={questions}
				userAnswers={userAnswers}
				onBack={() => setShowReview(false)}
			/>
		);
	}
	return (
		<div className="max-w-2xl mx-auto">
			<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
				{/* Icon */}
				<div
					className={`mx-auto w-20 h-20 rounded-2xl ${
						passed ? "bg-green-500/20" : "bg-yellow-500/20"
					} flex items-center justify-center mb-6`}
				>
					{passed ? (
						<svg
							className="w-10 h-10 text-green-400"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M20 6L9 17L4 12"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg
							className="w-10 h-10 text-yellow-400"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</div>

				{/* Title */}
				<h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
				<p className="text-gray-400 mb-8">{quizTitle}</p>

				{/* Score */}
				<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
					<div className="text-6xl font-bold text-white mb-2">
						{percentage}%
					</div>
					<div className="text-gray-400 space-y-1">
						<p>
							{correctCount} out of {totalQuestions} questions correct
						</p>
						<p>
							{earnedPoints} out of {totalPoints} points earned
						</p>
						{(() => {
							const m = Math.floor(elapsedSeconds / 60);
							const s = elapsedSeconds % 60;
							const timeStr = `${m}m ${s}s`;
							if (isAutoSubmit) {
								return <p className="text-red-400 font-medium mt-2">Time&apos;s up!</p>;
							}
							if (timeLimit && elapsedSeconds < timeLimit * 60) {
								const remaining = timeLimit * 60 - elapsedSeconds;
								const rm = Math.floor(remaining / 60);
								const rs = remaining % 60;
								return (
									<p className="text-gray-400 mt-2">
										Completed in {timeStr} &middot; {rm}m {rs}s remaining
									</p>
								);
							}
							return <p className="text-gray-400 mt-2">Completed in {timeStr}</p>;
						})()}
					</div>

					{/* AI Review */}
					<div className="mt-6 text-left">
						{!review && !loading && !error && (
							<button
								onClick={() => getReview(reviewPayload)}
								className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
							>
								Get AI Review
							</button>
						)}

						{loading && (
							<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center text-gray-400 text-sm">
								Analysing your results...
							</div>
						)}

						{error && (
							<div className="backdrop-blur-sm bg-white/5 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
								{error}
							</div>
						)}

						{review && (
							<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
								<div className="flex justify-between items-center">
									<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
										AI Review
									</p>
									<div className="flex gap-2">
										<button
											onClick={() => navigator.clipboard.writeText(review)}
											className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-white/10"
										>
											Copy
										</button>
										{!error?.includes("Rate limit") && (
											<button
												onClick={() => getReview(reviewPayload)}
												className="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-white/10"
											>
												Regenerate
											</button>
										)}
									</div>
								</div>
								<p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
									{review}
								</p>
							</div>
						)}

						<p className="text-xs text-gray-500 mt-3 text-center">
							Or export manually to use with any AI tool
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={() => setShowReview(true)}
						className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium"
					>
						Review Answers
					</button>
					<button
						onClick={onRetake}
						className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
					>
						Retake Quiz
					</button>
				</div>
			</div>
		</div>
	);
}
