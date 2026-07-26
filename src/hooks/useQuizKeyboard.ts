import { useEffect, useRef } from "react";

interface QuizKeyboardOptions {
	onSelectAnswer: (index: number) => void;
	onNext: () => void;
	onCancelModal: () => void;
	isActive: boolean;
}

export function useQuizKeyboard({
	onSelectAnswer,
	onNext,
	onCancelModal,
	isActive,
}: QuizKeyboardOptions) {
	const onSelectAnswerRef = useRef(onSelectAnswer);
	const onNextRef = useRef(onNext);
	const onCancelModalRef = useRef(onCancelModal);

	useEffect(() => {
		onSelectAnswerRef.current = onSelectAnswer;
	}, [onSelectAnswer]);

	useEffect(() => {
		onNextRef.current = onNext;
	}, [onNext]);

	useEffect(() => {
		onCancelModalRef.current = onCancelModal;
	}, [onCancelModal]);

	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey) return;
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT" ||
				target.isContentEditable
			) {
				return;
			}

			switch (e.key.toLowerCase()) {
				case "a":
					onSelectAnswerRef.current(0);
					break;
				case "b":
					onSelectAnswerRef.current(1);
					break;
				case "c":
					onSelectAnswerRef.current(2);
					break;
				case "d":
					onSelectAnswerRef.current(3);
					break;
				case "enter":
					onNextRef.current();
					break;
				case "escape":
					onCancelModalRef.current();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isActive]);
}
