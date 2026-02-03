import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { QuizDraft, QuizQuestion } from "../lib/types";
import { letterToIndex } from "../utils/helpers";
export function useTakeQuiz(quizId: string | undefined) {
	const [quiz, setQuiz] = useState<QuizDraft | null>(null);
	const [questions, setQuestions] = useState<QuizQuestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number>
	>({});
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		if (!quizId) {
			setError("No quiz ID provided");
			setLoading(false);
			return;
		}

		fetchQuizData();
	}, [quizId]);

	const fetchQuizData = async () => {
		if (!quizId) return;

		try {
			setLoading(true);
			setError(null);

			// Fetch quiz details
			const { data: quizData, error: quizError } = await supabase
				.from("quizzes")
				.select("*")
				.eq("id", quizId)
				.single();

			if (quizError) throw quizError;

			// Fetch questions
			const { data: questionsData, error: questionsError } = await supabase
				.from("questions")
				.select("*")
				.eq("quiz_id", quizId);

			if (questionsError) throw questionsError;

			if (!questionsData || questionsData.length === 0) {
				throw new Error("This quiz has no questions");
			}

			setQuiz(quizData);
			setQuestions(questionsData);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load quiz";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const handleAnswerSelect = (answerIndex: number) => {
		setSelectedAnswers({
			...selectedAnswers,
			[currentQuestionIndex]: answerIndex,
		});
	};

	const goToNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const goToPrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const goToQuestion = (index: number) => {
		setCurrentQuestionIndex(index);
	};

	const submitQuiz = () => {
		const unanswered = questions.findIndex(
			(_, i) => selectedAnswers[i] === undefined,
		);

		if (unanswered !== -1) {
			toast.error(`Please answer question ${unanswered + 1}`);
			setCurrentQuestionIndex(unanswered);
			return;
		}

		setShowResults(true);
	};

	const calculateScore = () => {
		let correctCount = 0;
		let totalPoints = 0;
		let earnedPoints = 0;

		questions.forEach((question, index) => {
			totalPoints += question.Points;
			if (selectedAnswers[index] === letterToIndex(question.Correct_Answer)) {
				correctCount++;
				earnedPoints += question.Points;
			}
		});

		return { correctCount, earnedPoints, totalPoints };
	};

	const resetQuiz = () => {
		setCurrentQuestionIndex(0);
		setSelectedAnswers({});
		setShowResults(false);
	};

	const currentQuestion = questions[currentQuestionIndex];
	const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
	const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

	return {
		quiz,
		questions,
		loading,
		error,
		currentQuestion,
		currentQuestionIndex,
		selectedAnswers,
		showResults,
		progress,
		isAnswered,
		handleAnswerSelect,
		goToNext,
		goToPrevious,
		goToQuestion,
		submitQuiz,
		calculateScore,
		resetQuiz,
	};
}
