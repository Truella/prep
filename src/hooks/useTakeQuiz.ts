import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { QuizDraft, DBQuestion, AppQuestion } from "../lib/types";
import { dbToAppQuestion } from "../utils/transforms";
import useQuizProgress from "./useQuizProgress";

export function useTakeQuiz(quizId: string | undefined) {
	const [showSubmitModal, setShowSubmitModal] = useState(false);
	const [quiz, setQuiz] = useState<QuizDraft | null>(null);
	const [questions, setQuestions] = useState<AppQuestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number>
	>({});

	const [showResults, setShowResults] = useState(false);

	const [isSubmitted, setIsSubmitted] = useState(false);

	const startTimeRef = useRef<number>(0);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isAutoSubmit, setIsAutoSubmit] = useState(false);
	const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

	const { loadProgress, clearProgress, markHydrated } = useQuizProgress(
		quizId,
		selectedAnswers,
		currentQuestionIndex,
		isSubmitted,
	);

	const fetchQuizData = useCallback(async () => {
		if (!quizId) return;

		try {
			setLoading(true);
			setError(null);

			const { data: quizData, error: quizError } = await supabase
				.from("quizzes")
				.select("*")
				.eq("id", quizId)
				.single();

			if (quizError) throw quizError;

			const { data: questionsData, error: questionsError } = await supabase
				.from("questions")
				.select("*")
				.eq("quiz_id", quizId);

			if (questionsError) throw questionsError;

			if (!questionsData || questionsData.length === 0) {
				throw new Error("This quiz has no questions");
			}

			setQuiz(quizData);
			setQuestions(questionsData.map((q: DBQuestion, i: number) => dbToAppQuestion(q, i)));

			if (quizData.time_limit) {
				const storageKey = `quiz_deadline_${quizId}`;
				let deadline: number;
				try {
					deadline = Number(localStorage.getItem(storageKey));
				} catch {
					deadline = 0;
				}
				if (!deadline || deadline <= Date.now()) {
					deadline = Date.now() + quizData.time_limit * 60 * 1000;
					try {
						localStorage.setItem(storageKey, String(deadline));
					} catch {}
				}
				startTimeRef.current = deadline - quizData.time_limit * 60 * 1000;
				const remaining = Math.ceil((deadline - Date.now()) / 1000);
				if (remaining <= 0) {
					setTimerSeconds(0);
					setIsAutoSubmit(true);
					setElapsedSeconds(quizData.time_limit * 60);
					setShowResults(true);
					setIsSubmitted(true);
				} else {
					setTimerSeconds(remaining);
				}
			} else {
				startTimeRef.current = Date.now();
				setTimerSeconds(null);
			}
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Failed to load quiz";
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	}, [quizId]);

	useEffect(() => {
		if (!quizId) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setError("No quiz ID provided");
			setLoading(false);
			return;
		}

		fetchQuizData();
	}, [quizId, fetchQuizData]);

	useEffect(() => {
		if (!quiz || questions.length === 0) return;

		const saved = loadProgress();

		if (saved && saved.answers) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedAnswers(saved.answers);

			if (saved.currentIndex !== undefined) {
				setCurrentQuestionIndex(saved.currentIndex);
			}

			toast.success("Progress restored!");
		}
		markHydrated();
	}, [quiz, questions.length, loadProgress, markHydrated]);

	const handleAnswerSelect = (answerIndex: number) => {
		setSelectedAnswers((prev) => ({
			...prev,
			[currentQuestionIndex]: answerIndex,
		}));
	};

	const goToNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((i) => i + 1);
		}
	};

	const goToPrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((i) => i - 1);
		}
	};

	const goToQuestion = (index: number) => {
		setCurrentQuestionIndex(index);
	};

	const answeredCount = Object.keys(selectedAnswers).length;
	const unansweredCount = questions.length - answeredCount;

	const clearDeadline = () => {
		if (!quizId) return;
		try { localStorage.removeItem(`quiz_deadline_${quizId}`); } catch {}
	};

	const initiateSubmit = () => {
		if (answeredCount === 0) {
			toast.error("Answer at least one question before submitting");
			return;
		}
		setShowSubmitModal(true);
	};

	const confirmSubmit = () => {
		setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		setShowSubmitModal(false);
		setShowResults(true);
		setIsSubmitted(true);
		clearDeadline();
	};

	const cancelSubmit = () => {
		setShowSubmitModal(false);
	};

	const handleTimerExpire = () => {
		setIsAutoSubmit(true);
		setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
		setShowSubmitModal(false);
		setShowResults(true);
		setIsSubmitted(true);
		clearDeadline();
	};

	const resetQuiz = () => {
		clearProgress();
		setIsSubmitted(false);
		setIsAutoSubmit(false);
		setElapsedSeconds(0);
		setCurrentQuestionIndex(0);
		setSelectedAnswers({});
		setShowResults(false);
		startTimeRef.current = Date.now();
		clearDeadline();
		if (quiz?.time_limit) {
			const fullSeconds = quiz.time_limit * 60;
			const newDeadline = Date.now() + fullSeconds * 1000;
			try { localStorage.setItem(`quiz_deadline_${quizId}`, String(newDeadline)); } catch {}
			startTimeRef.current = newDeadline - fullSeconds * 1000;
			setTimerSeconds(fullSeconds);
		} else {
			setTimerSeconds(null);
		}
	};

	const calculateScore = () => {
		let correctCount = 0;
		let totalPoints = 0;
		let earnedPoints = 0;

		questions.forEach((q, index) => {
			totalPoints += q.points;

			if (selectedAnswers[index] === q.correctIndex) {
				correctCount++;
				earnedPoints += q.points;
			}
		});

		return { correctCount, earnedPoints, totalPoints };
	};

	const currentQuestion = questions[currentQuestionIndex];
	const progress =
		questions.length > 0
			? ((currentQuestionIndex + 1) / questions.length) * 100
			: 0;

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
		showSubmitModal,
		handleAnswerSelect,
		goToNext,
		goToPrevious,
		goToQuestion,
		calculateScore,
		resetQuiz,
		initiateSubmit,
		confirmSubmit,
		cancelSubmit,
		handleTimerExpire,
		elapsedSeconds,
		isAutoSubmit,
		timerSeconds,
		answeredCount,
		unansweredCount,
	};
}
