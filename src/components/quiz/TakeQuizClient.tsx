"use client";

import Link from "next/link";
import { useTakeQuiz } from "../../hooks/useTakeQuiz";
import LoadingScreen from "../../components/LoadingScreen";
import QuizProgress from "../../components/quiz/QuizProgress";
import QuestionCard from "../../components/quiz/QuestionCard";
import QuizNavigation from "../../components/quiz/QuizNavigation";
import QuestionOverview from "../../components/quiz/QuestionOverview";
import QuizResults from "../../components/quiz/QuizResults";
import SubmitConfirmationModal from "../../components/quiz/SubmitConfirmationModal";

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
	} = useTakeQuiz(quizId);

	if (loading) {
		return <LoadingScreen message="Loading quiz..." />;
	}

	if (error || !quiz) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center px-4">
				<div className="text-center">
					<div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mb-4">
						<svg
							className="w-8 h-8 text-red-400"
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
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">Quiz Not Found</h2>
					<p className="text-gray-400 mb-6">
						{error || "This quiz doesn't exist or has been deleted"}
					</p>
					<Link
						href="/"
						className="inline-block px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
					>
						Go Home
					</Link>
				</div>
			</div>
		);
	}

	if (showResults) {
		const { correctCount, earnedPoints, totalPoints } = calculateScore();
		return (
			<div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
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
				/>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black py-8 px-4">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
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
					<h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
					{quiz.description && (
						<p className="text-gray-400">{quiz.description}</p>
					)}
				</div>

				<div className="grid lg:grid-cols-3 gap-6">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						<QuizProgress
							current={currentQuestionIndex + 1}
							total={questions.length}
							progress={progress}
						/>

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
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
