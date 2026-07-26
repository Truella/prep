import { useEffect } from "react";

interface QuizKeyboardOptions {
	onSelectAnswer: (index: number) => void;
	onNext: () => void;
	onSubmit: () => void;
	onCancelModal: () => void;
	isActive: boolean;
}

export function useQuizKeyboard({
	onSelectAnswer,
	onNext,
	onSubmit,
	onCancelModal,
	isActive,
}: QuizKeyboardOptions) {
	useEffect(() => {
		if (!isActive) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.tagName === "SELECT"
			) {
				return;
			}

			switch (e.key.toLowerCase()) {
				case "a":
					onSelectAnswer(0);
					break;
				case "b":
					onSelectAnswer(1);
					break;
				case "c":
					onSelectAnswer(2);
					break;
				case "d":
					onSelectAnswer(3);
					break;
				case "enter":
					onNext();
					break;
				case "escape":
					onCancelModal();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isActive, onSelectAnswer, onNext, onSubmit, onCancelModal]);
}
