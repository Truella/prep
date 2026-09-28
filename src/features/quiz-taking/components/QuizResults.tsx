"use client";

import { useState } from "react";
import QuizReview from "./QuizReview";
import ExportResultsButton from "./ExportResultsButton";
import { AppQuestion } from "@/lib/types";
import { useAIReview } from "@/features/quiz-taking/hooks/useAIReview";
import type { AIReviewPayload } from "@/lib/types";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

// ---------------------------------------------------------------------------
// Lightweight markdown renderer — handles the subset Groq consistently outputs
// ---------------------------------------------------------------------------

function renderInline(text: string): React.ReactNode[] {
	// Split on **...** to produce alternating plain / bold segments
	const parts = text.split(/(\*\*[^*]+\*\*)/g);
	return parts.map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) {
		return (
			<strong key={i} className="text-text-primary font-semibold">
					{part.slice(2, -2)}
				</strong>
			);
		}
		return part;
	});
}

function renderReview(text: string): React.ReactNode {
	const lines = text.split(/\r?\n/);
	const nodes: React.ReactNode[] = [];
	let bulletBuffer: string[] = [];

	const flushBullets = () => {
		if (bulletBuffer.length === 0) return;
		nodes.push(
			<ul key={`ul-${nodes.length}`} className="space-y-1.5 my-2">
				{bulletBuffer.map((b, i) => (
					<li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
						<span className="mt-1 w-1.5 h-1.5 rounded-full bg-text-secondary shrink-0" />
						<span>{renderInline(b)}</span>
					</li>
				))}
			</ul>
		);
		bulletBuffer = [];
	};

	for (const raw of lines) {
		const line = raw.trim();

		if (!line) {
			flushBullets();
			nodes.push(<div key={`gap-${nodes.length}`} className="h-2" />);
			continue;
		}

		// Heading: ### or ## or **Heading:**
		if (/^#{1,3}\s/.test(line)) {
			flushBullets();
			const headingText = line.replace(/^#{1,3}\s+/, "");
			nodes.push(
				<p key={`h-${nodes.length}`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-4 mb-1">
					{headingText.replace(/\*\*/g, "")}
				</p>
			);
			continue;
		}

		// Bold-only line used as a heading (e.g. "**What you did well:**")
		if (/^\*\*.+\*\*:?$/.test(line)) {
			flushBullets();
			nodes.push(
				<p key={`bh-${nodes.length}`} className="text-xs font-semibold text-text-secondary uppercase tracking-wider mt-4 mb-1">
					{line.replace(/\*\*/g, "").replace(/:$/, "")}
				</p>
			);
			continue;
		}

		// Bullet: - or * or •
		if (/^[-*•]\s+/.test(line)) {
			bulletBuffer.push(line.replace(/^[-*•]\s+/, ""));
			continue;
		}

		// Numbered list: 1. 2. etc.
		if (/^\d+\.\s+/.test(line)) {
			bulletBuffer.push(line.replace(/^\d+\.\s+/, ""));
			continue;
		}

		// Plain paragraph
		flushBullets();
		nodes.push(
			<p key={`p-${nodes.length}`} className="text-sm text-text-secondary leading-relaxed">
				{renderInline(line)}
			</p>
		);
	}

	flushBullets();
	return <div className="space-y-1">{nodes}</div>;
}

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
	isAutoSubmit: boolean;
	timeLimit: number | null;
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
	quizId,
}: QuizResultsProps) {
	const [showReview, setShowReview] = useState(false);
	const [copied, setCopied] = useState(false);
	const [copyFailed, setCopyFailed] = useState(false);
	const { review, loading, error, isRateLimited, getReview } = useAIReview(quizId);
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
				quizTitle={quizTitle}
			/>
		);
	}
	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-surface border border-border rounded-3xl p-8 text-center">
				{/* Icon */}
				<div
					className={`mx-auto w-20 h-20 rounded-2xl ${
						passed ? "bg-correct/15" : "bg-incorrect/15"
					} flex items-center justify-center mb-6`}
				>
					{passed ? (
						<svg
							className="w-10 h-10 text-correct"
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
							className="w-10 h-10 text-incorrect"
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
				<h1 className="text-3xl font-bold text-text-primary mb-2">Quiz Complete!</h1>
				<p className="text-text-secondary mb-8">{quizTitle}</p>

				{/* Score */}
				<div className="bg-surface-raised border border-border rounded-2xl p-6 mb-8">
					<div className="text-6xl font-bold text-text-primary mb-2">
						{percentage}%
					</div>
					<div className="text-text-secondary space-y-1">
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
								return <p className="text-incorrect font-medium mt-2">Time&apos;s up!</p>;
							}
							if (timeLimit && elapsedSeconds < timeLimit * 60) {
								const remaining = timeLimit * 60 - elapsedSeconds;
								const rm = Math.floor(remaining / 60);
								const rs = remaining % 60;
								return (
									<p className="text-text-secondary mt-2">
										Completed in {timeStr} &middot; {rm}m {rs}s remaining
									</p>
								);
							}
							return <p className="text-text-secondary mt-2">Completed in {timeStr}</p>;
						})()}
					</div>



					{/* AI Review */}
					<ErrorBoundary
						fallback={
							<p className="text-sm text-text-secondary mt-4">AI review unavailable.</p>
						}
					>
						<div className="mt-6 text-left">
							{!review && !loading && !error && (
								<button
									onClick={() => getReview(reviewPayload)}
									className="w-full px-6 py-3 rounded-xl bg-text-primary text-bg font-semibold hover:opacity-90 transition-all"
								>
									Get AI Review
								</button>
							)}

							{loading && (
								<div className="bg-surface-raised border border-border rounded-xl p-4 text-center text-text-secondary text-sm">
									Analysing your results...
								</div>
							)}

							{error && (
								<div className="bg-surface-raised border border-incorrect/30 rounded-xl p-4 text-incorrect text-sm">
									{error}
								</div>
							)}

							{review && (
								<div className="bg-surface-raised border border-border rounded-xl p-4 space-y-3">
									<div className="flex justify-between items-center">
										<p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
											AI Review
										</p>
										<div className="flex gap-2">
											<button
												onClick={async () => {
													if (!navigator.clipboard) {
														setCopyFailed(true);
														setTimeout(() => setCopyFailed(false), 2000);
														return;
													}
													try {
														await navigator.clipboard.writeText(review);
														setCopied(true);
														setCopyFailed(false);
														setTimeout(() => setCopied(false), 2000);
													} catch {
														setCopyFailed(true);
														setTimeout(() => setCopyFailed(false), 2000);
													}
												}}
												className="text-xs text-text-secondary hover:text-text-primary transition px-2 py-1 rounded border border-border"
											>
												{copyFailed ? "Failed" : copied ? "Copied!" : "Copy"}
											</button>
											{!isRateLimited && (
												<button
													onClick={() => getReview(reviewPayload)}
													className="text-xs text-text-secondary hover:text-text-primary transition px-2 py-1 rounded border border-border"
												>
													Regenerate
												</button>
											)}
										</div>
									</div>
									<div className="text-text-secondary">
										{renderReview(review)}
									</div>
								</div>
							)}

							<p className="text-xs text-text-secondary mt-3 text-center">
								Or export manually to use with any AI tool
							</p>
						</div>
					</ErrorBoundary>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={() => setShowReview(true)}
						className="flex-1 px-6 py-3 rounded-xl border border-border text-text-primary hover:bg-surface-raised transition-all font-medium"
					>
						Review Answers
					</button>
					<button
						onClick={onRetake}
						className="flex-1 px-6 py-3 rounded-xl bg-text-primary text-bg font-semibold hover:opacity-90 transition-all"
					>
						Retake Quiz
					</button>
				</div>
				<ExportResultsButton
					quizTitle={quizTitle}
					questions={questions}
					userAnswers={userAnswers}
				/>
			</div>
		</div>
	);
}
