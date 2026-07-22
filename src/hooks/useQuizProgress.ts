import { useEffect, useRef, useCallback } from "react";

interface QuizProgress {
	answers: Record<number, number>;
	currentIndex: number;
	timestamp: number;
}

export default function useQuizProgress(
	quizId: string | undefined,
	selectedAnswers: Record<number, number>,
	currentQuestionIndex: number,
	isSubmitted: boolean,
) {
	const STORAGE_KEY = `quiz_progress_${quizId}`;
	const EXPIRY_HOURS = 24;

	const isHydratedRef = useRef(false);

	// Load progress
	const loadProgress = (): Partial<QuizProgress> | null => {
		if (!quizId) return null;

		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (!saved) return null;

			const progress: QuizProgress = JSON.parse(saved);

			const hoursSince = (Date.now() - progress.timestamp) / (1000 * 60 * 60);

			if (hoursSince > EXPIRY_HOURS) {
				localStorage.removeItem(STORAGE_KEY);
				return null;
			}

			return {
				answers: progress.answers,
				currentIndex: progress.currentIndex,
			};
		} catch (err) {
			console.error("Failed to load quiz progress:", err);
			return null;
		}
	};

	const saveProgress = useCallback(() => {
		if (!quizId || isSubmitted) return;
		if (!isHydratedRef.current) return;

		const progress: QuizProgress = {
			answers: selectedAnswers,
			currentIndex: currentQuestionIndex,
			timestamp: Date.now(),
		};

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
		} catch (err) {
			console.error("Failed to save quiz progress:", err);
		}
	}, [quizId, isSubmitted, selectedAnswers, currentQuestionIndex]);

	const clearProgress = useCallback(() => {
		if (!quizId) return;
		localStorage.removeItem(STORAGE_KEY);
	}, [quizId]);
	const markHydrated = () => {
		isHydratedRef.current = true;
	};

	useEffect(() => {
		saveProgress();
	}, [selectedAnswers, currentQuestionIndex, saveProgress]);

	useEffect(() => {
		if (isSubmitted) {
			clearProgress();
		}
	}, [isSubmitted, clearProgress]);

	return {
		loadProgress,
		clearProgress,
		saveProgress,
		markHydrated,
	};
}
