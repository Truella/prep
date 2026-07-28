import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { DBQuestion } from "../lib/types";
import { dbToAppQuestion } from "../utils/transforms";
import useQuizProgress from "./useQuizProgress";

interface SavedQuizResults {
	answers: Record<number, number>;
	elapsedSeconds: number;
	isAutoSubmit: boolean;
}

function readSavedResults(quizId: string | undefined): SavedQuizResults | null {
	if (!quizId) return null;
	const resultsKey = `quiz_results_${quizId}`;
	try {
		const savedResults = localStorage.getItem(resultsKey);
		if (!savedResults) return null;

		const parsed = JSON.parse(savedResults);

		if (!parsed || typeof parsed !== "object") {
			return null;
		}

		const answers = parsed.answers;
		if (!answers || typeof answers !== "object") {
			return null;
		}
		const validatedAnswers: Record<number, number> = {};
		for (const [key, value] of Object.entries(answers)) {
			const numKey = Number(key);
			const numValue = Number(value);
			if (Number.isInteger(numKey) && numKey >= 0 && Number.isInteger(numValue) && numValue >= 0) {
				validatedAnswers[numKey] = numValue;
			}
		}

		const elapsedSeconds = parsed.elapsedSeconds;
		if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
			return null;
		}

		const isAutoSubmit = Boolean(parsed.isAutoSubmit);

		return {
			answers: validatedAnswers,
			elapsedSeconds,
			isAutoSubmit,
		};
	} catch (err) {
		console.error("Failed to load saved quiz results:", err);
	}
	return null;
}

export function useTakeQuiz(quizId: string | undefined) {
	const [showSubmitModal, setShowSubmitModal] = useState(false);

	const { data: quiz, isLoading: quizLoading, error: quizError } = useQuery({
		queryKey: ["quiz-take", quizId],
		queryFn: async () => {
			if (!quizId) throw new Error("No quiz ID provided");
			const { data, error } = await supabase
				.from("quizzes")
				.select("*")
				.eq("id", quizId)
				.single();
			if (error) throw error;
			if (!data) throw new Error("Quiz not found");
			return data;
		},
		enabled: !!quizId,
		staleTime: 5 * 60 * 1000,
	});

	const { data: questions = [], isLoading: questionsLoading, error: questionsError } = useQuery({
		queryKey: ["quiz-take-questions", quizId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("questions")
				.select("*")
				.eq("quiz_id", quizId!)
				.order("created_at", { ascending: true });
			if (error) throw error;
			if (!data || data.length === 0) throw new Error("This quiz has no questions");
			return data.map((q: DBQuestion, i: number) => dbToAppQuestion(q, i));
		},
		enabled: !!quizId && !!quiz,
		staleTime: 5 * 60 * 1000,
	});

	const loading = quizLoading || (!!quizId && !!quiz && questionsLoading);
	const error = !quizId
		? "No quiz ID provided"
		: quizError
		? (quizError as Error).message
		: questionsError
		? (questionsError as Error).message
		: null;

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, number>
	>({});

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const [showResults, setShowResults] = useState(false);

	const [isSubmitted, setIsSubmitted] = useState(false);

	const startTimeRef = useRef<number>(0);
	const submittedRef = useRef(false);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isAutoSubmit, setIsAutoSubmit] = useState(false);
	const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

	const clearDeadline = () => {
		if (!quizId) return;
		try { localStorage.removeItem(`quiz_deadline_${quizId}`); } catch {}
	};

	const { loadProgress, clearProgress, markHydrated } = useQuizProgress(
		quizId,
		selectedAnswers,
		currentQuestionIndex,
		isSubmitted,
	);

	const questionsLoadedRef = useRef(false);
	useEffect(() => {
		/* eslint-disable react-hooks/set-state-in-effect */
		if (questions.length > 0 && quiz && !questionsLoadedRef.current) {
			questionsLoadedRef.current = true;
			
			if (quiz.time_limit) {
				const storageKey = `quiz_deadline_${quizId}`;
				let deadline: number;
				try {
					deadline = Number(localStorage.getItem(storageKey));
				} catch {
					deadline = 0;
				}
				if (!deadline || deadline <= Date.now()) {
					deadline = Date.now() + quiz.time_limit * 60 * 1000;
					try {
						localStorage.setItem(storageKey, String(deadline));
					} catch {}
				}
				startTimeRef.current = deadline - quiz.time_limit * 60 * 1000;
				const remaining = Math.ceil((deadline - Date.now()) / 1000);
				if (remaining <= 0) {
					setTimerSeconds(0);
					setIsAutoSubmit(true);
					const elapsedTotal = quiz.time_limit * 60;
					setElapsedSeconds(elapsedTotal);
					const totalPts = questions.reduce((sum, q) => sum + q.points, 0);
					try {
						supabase.from("quiz_attempts").insert({
							quiz_id: quiz.id,
							score: 0,
							total_points: totalPts,
							elapsed_seconds: elapsedTotal,
							answers: selectedAnswers,
						});
					} catch {}
					clearDeadline();
					setShowResults(true);
					setIsSubmitted(true);
				} else {
					setTimerSeconds(remaining);
				}
			} else {
				startTimeRef.current = Date.now();
				setTimerSeconds(null);
			}
		}
		/* eslint-enable react-hooks/set-state-in-effect */
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [questions.length, quiz, quizId]);

	useEffect(() => {
		/* eslint-disable react-hooks/set-state-in-effect */
		if (!quiz || questions.length === 0) return;

		// Check if quiz has been submitted previously
		const savedResults = readSavedResults(quizId);
		if (savedResults) {
			setSelectedAnswers(savedResults.answers);
			setElapsedSeconds(savedResults.elapsedSeconds);
			setIsAutoSubmit(savedResults.isAutoSubmit);
			setShowResults(true);
			setIsSubmitted(true);
			markHydrated();
			return;
		}

		const saved = loadProgress();

		if (saved && saved.answers) {
			setSelectedAnswers(saved.answers);

			if (saved.currentIndex !== undefined) {
				setCurrentQuestionIndex(saved.currentIndex);
			}

			toast.success("Progress restored!");
		}
		markHydrated();
		/* eslint-enable react-hooks/set-state-in-effect */
	}, [quiz, questions.length, loadProgress, markHydrated, quizId]);

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

	const initiateSubmit = () => {
		if (answeredCount === 0) {
			toast.error("Answer at least one question before submitting");
			return;
		}
		setShowSubmitModal(true);
	};

	const confirmSubmit = async () => {
		if (submittedRef.current) return;
		submittedRef.current = true;
		// eslint-disable-next-line react-hooks/purity
		const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
		setElapsedSeconds(elapsed);
		setShowSubmitModal(false);

		const saved = await saveAttempt(elapsed);
		if (!saved) {
			submittedRef.current = false;
			toast.error("Failed to save attempt");
			return;
		}

		clearDeadline();
		setShowResults(true);
		setIsSubmitted(true);

		try {
			localStorage.setItem(
				`quiz_results_${quizId}`,
				JSON.stringify({
					answers: selectedAnswers,
					elapsedSeconds: elapsed,
					isAutoSubmit: false,
				})
			);
		} catch (err) {
			console.error("Failed to save quiz results:", err);
		}
	};

	const cancelSubmit = () => {
		setShowSubmitModal(false);
	};

	const handleTimerExpire = async () => {
		if (submittedRef.current) return;
		submittedRef.current = true;
		setIsAutoSubmit(true);
		// eslint-disable-next-line react-hooks/purity
		const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
		setElapsedSeconds(elapsed);
		setShowSubmitModal(false);

		const saved = await saveAttempt(elapsed);
		if (!saved) {
			submittedRef.current = false;
			return;
		}

		clearDeadline();
		setShowResults(true);
		setIsSubmitted(true);

		try {
			localStorage.setItem(
				`quiz_results_${quizId}`,
				JSON.stringify({
					answers: selectedAnswers,
					elapsedSeconds: elapsed,
					isAutoSubmit: true,
				})
			);
		} catch (err) {
			console.error("Failed to save quiz results:", err);
		}
	};

	const resetQuiz = () => {
		try {
			localStorage.removeItem(`quiz_results_${quizId}`);
			localStorage.removeItem(`quiz_ai_review_${quizId}`);
		} catch {}
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

	const saveAttempt = async (elapsed: number): Promise<boolean> => {
		if (!quiz?.id) return false;
		const { earnedPoints } = calculateScore();
		const totalPts = questions.reduce((sum, q) => sum + q.points, 0);

		try {
			await supabase.from("quiz_attempts").insert({
				quiz_id: quiz.id,
				score: earnedPoints,
				total_points: totalPts,
				elapsed_seconds: elapsed,
				answers: selectedAnswers,
			});
			return true;
		} catch {
			return false;
		}
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
