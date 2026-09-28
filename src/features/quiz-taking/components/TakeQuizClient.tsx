"use client";

import Link from "next/link";
import { useTakeQuiz } from "@/features/quiz-taking/hooks/useTakeQuiz";
import LoadingScreen from "@/shared/components/LoadingScreen";
import QuizProgress from "./QuizProgress";
import QuestionCard from "./QuestionCard";
import QuizNavigation from "./QuizNavigation";
import QuestionOverview from "./QuestionOverview";
import QuizTimer from "./QuizTimer";
import QuizResults from "./QuizResults";
import SubmitConfirmationModal from "./SubmitConfirmationModal";
import { useEffect } from "react";
import { useQuizKeyboard } from "@/features/quiz-taking/hooks/useQuizKeyboard";

export default function TakeQuizClient({ quizId }: { quizId: string }) {
	const {
		quiz,
		questions,
		loading,
		error,
		currentQuestion,
		currentQuestionIndex,
		selectedAnswers,
		showResults,
		showSubmitModal,
		progress,
		isAnswered,
		answeredCount,
		unansweredCount,
		handleAnswerSelect,
		goToNext,
		goToPrevious,
		goToQuestion,
		initiateSubmit,
		confirmSubmit,
		cancelSubmit,
		calculateScore,
		resetQuiz,
		handleTimerExpire,
		elapsedSeconds,
		isAutoSubmit,
		timerSeconds,
	} = useTakeQuiz(quizId);

	const quizActive = !loading && !error && !!quiz && !showResults && !showSubmitModal;

	useQuizKeyboard({
		onSelectAnswer: (i) => {
			if (!showSubmitModal) handleAnswerSelect(i);
		},
		onNext: () => {
			if (!showSubmitModal) goToNext();
		},
		onCancelModal: cancelSubmit,
		isActive: quizActive,
	});

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() !== "escape") return;
			const t = e.target as HTMLElement;
			if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
			cancelSubmit();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [cancelSubmit]);

	if (loading) {
		return <LoadingScreen message="Loading quiz..." />;
	}

	if (error || !quiz) {
		return (
			<div
				className="min-h-screen flex items-center justify-center px-6"
				style={{ backgroundColor: "var(--color-bg)" }}
			>
				<div className="text-center space-y-4 max-w-sm">
					<p className="text-4xl">◎</p>
					<h2
						className="text-xl font-semibold"
						style={{ color: "var(--color-text-primary)" }}
					>
						Quiz unavailable
					</h2>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						This quiz may have been unpublished by its creator, or the link is no longer valid.
					</p>
					<Link
						href="/quiz-bank"
						className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition"
						style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
					>
						Browse Quiz Bank
					</Link>
				</div>
			</div>
		);
	}

	if (showResults) {
		const { correctCount, earnedPoints, totalPoints } = calculateScore();
		return (
			<div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
				<QuizResults
					quizTitle={quiz.title}
					correctCount={correctCount}
					totalQuestions={questions.length}
					earnedPoints={earnedPoints}
					totalPoints={totalPoints}
					onRetake={resetQuiz}
					quizId={quizId || ""}
					userAnswers={selectedAnswers}
					questions={questions}
					elapsedSeconds={elapsedSeconds}
					isAutoSubmit={isAutoSubmit}
					timeLimit={quiz.time_limit ?? null}
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-bg py-8 px-4">
			{quiz.status === "draft" && (
				<div
					className="px-4 py-2 text-center text-xs font-medium mb-6 border-b border-border"
					style={{
						backgroundColor: "var(--color-surface)",
						color: "var(--color-text-secondary)",
					}}
				>
					Preview mode - this quiz is a draft and not publicly accessible
				</div>
			)}
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition mb-4"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
							<path
								d="M19 12H5M5 12L12 19M5 12L12 5"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Back
					</Link>
					<h1 className="text-3xl font-bold text-text-primary mb-2">{quiz.title}</h1>
					{quiz.description && (
						<p className="text-text-secondary">{quiz.description}</p>
					)}
				</div>

				<div className="grid lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6" aria-keyshortcuts="a b c d Enter Escape">
						{timerSeconds !== null && !showResults && (
							<div className="flex justify-end mb-2">
								<QuizTimer
									timeLimitSeconds={timerSeconds}
									onExpire={handleTimerExpire}
								/>
							</div>
						)}

						<QuizProgress
							current={currentQuestionIndex + 1}
							total={questions.length}
							progress={progress}
						/>

						<p className="text-xs text-text-secondary text-center">
							A–D: select answer &middot; Enter: continue &middot; Esc: close
						</p>

						<QuestionCard
							question={currentQuestion}
							selectedAnswer={selectedAnswers[currentQuestionIndex]}
							onSelectAnswer={handleAnswerSelect}
						/>

						<QuizNavigation
							currentIndex={currentQuestionIndex}
							totalQuestions={questions.length}
							isAnswered={isAnswered}
							onPrevious={goToPrevious}
							onNext={goToNext}
							onSubmit={initiateSubmit}
						/>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						<QuestionOverview
							totalQuestions={questions.length}
							currentIndex={currentQuestionIndex}
							answeredQuestions={selectedAnswers}
							onSelectQuestion={goToQuestion}
							onSubmit={initiateSubmit}
						/>
						<SubmitConfirmationModal
							isOpen={showSubmitModal}
							onClose={cancelSubmit}
							onConfirm={confirmSubmit}
							totalQuestions={questions.length}
							answeredCount={answeredCount}
							unansweredCount={unansweredCount}
							isAutoSubmit={isAutoSubmit}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
