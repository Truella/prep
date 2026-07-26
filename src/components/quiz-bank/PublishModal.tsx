"use client";

import { useState, useEffect, useRef } from "react";
import { usePublishQuiz } from "../../hooks/usePublishQuiz";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type {
	QuizVisibility,
	QuizDifficulty,
	QuizCategory,
} from "../../lib/types";

interface PublishModalProps {
	quizId: string;
	currentVisibility: QuizVisibility;
	currentCategory?: QuizCategory | null;
	currentDifficulty?: QuizDifficulty | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (updates: { visibility: QuizVisibility; category: QuizCategory | null; difficulty: QuizDifficulty | null }) => void;
}

const VISIBILITY_OPTIONS: {
	value: QuizVisibility;
	label: string;
	desc: string;
}[] = [
	{
		value: "private",
		label: "Private",
		desc: "Only accessible via direct link",
	},
	{
		value: "unlisted",
		label: "Unlisted",
		desc: "Shareable but not listed in the Quiz Bank",
	},
	{
		value: "public",
		label: "Public",
		desc: "Listed in the Quiz Bank for anyone to discover",
	},
];

export default function PublishModal({
	quizId,
	currentVisibility,
	currentCategory = null,
	currentDifficulty = null,
	isOpen,
	onClose,
	onSuccess,
}: PublishModalProps) {
	const [visibility, setVisibility] =
		useState<QuizVisibility>(currentVisibility);
	const [category, setCategory] = useState<QuizCategory | null>(currentCategory);
	const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(currentDifficulty);

	const modalRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (isOpen) {
			/* eslint-disable react-hooks/set-state-in-effect */
			setVisibility(currentVisibility);
			setCategory(currentCategory);
			setDifficulty(currentDifficulty);
			/* eslint-enable react-hooks/set-state-in-effect */

			previousFocusRef.current = document.activeElement as HTMLElement;
			// Focus modal on mount
			setTimeout(() => modalRef.current?.focus(), 0);

			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape") onClose();
				if (e.key === "Tab" && modalRef.current) {
					const focusableElements = modalRef.current.querySelectorAll(
						'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
					);
					const firstElement = focusableElements[0] as HTMLElement;
					const lastElement = focusableElements[
						focusableElements.length - 1
					] as HTMLElement;

					if (e.shiftKey) {
						if (document.activeElement === firstElement) {
							lastElement.focus();
							e.preventDefault();
						}
					} else {
						if (document.activeElement === lastElement) {
							firstElement.focus();
							e.preventDefault();
						}
					}
				}
			};

			document.addEventListener("keydown", handleKeyDown);
			return () => {
				document.removeEventListener("keydown", handleKeyDown);
				if (previousFocusRef.current) previousFocusRef.current.focus();
			};
		}
	}, [isOpen, currentVisibility, currentCategory, currentDifficulty, onClose]);

	const { publish, loading } = usePublishQuiz(quizId, () => {
		onSuccess({ visibility, category, difficulty });
		onClose();
	});

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="modal-title"
				tabIndex={-1}
				className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6 outline-none"
			>
				<button
					onClick={onClose}
					aria-label="Close modal"
					className="absolute top-4 right-4 text-gray-400 hover:text-white transition p-2"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M18 6L6 18M6 6l12 12"/>
					</svg>
				</button>
				<h3 id="modal-title" className="text-xl font-bold text-white">Quiz Visibility</h3>

				<div className="space-y-2">
					{VISIBILITY_OPTIONS.map((opt) => (
						<label
							key={opt.value}
							className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition"
						>
							<input
								type="radio"
								name="visibility"
								value={opt.value}
								checked={visibility === opt.value}
								onChange={() => setVisibility(opt.value)}
								className="mt-0.5"
							/>
							<div>
								<p className="text-white text-sm font-medium">{opt.label}</p>
								<p className="text-gray-400 text-xs">{opt.desc}</p>
							</div>
						</label>
					))}
				</div>

				{visibility === "public" && (
					<>
						<div>
							<label htmlFor="publish-category" className="block text-sm font-medium text-gray-300 mb-2">
								Category
							</label>
							<select
								id="publish-category"
								value={category ?? ""}
								onChange={(e) =>
									setCategory((e.target.value as QuizCategory) || null)
								}
								className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
							>
								<option value="">No category</option>
								{QUIZ_CATEGORIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>
						<div>
							<label htmlFor="publish-difficulty" className="block text-sm font-medium text-gray-300 mb-2">
								Difficulty
							</label>
							<select
								id="publish-difficulty"
								value={difficulty ?? ""}
								onChange={(e) =>
									setDifficulty(
										(e.target.value as QuizDifficulty) || null
									)
								}
								className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition"
							>
								<option value="">Not specified</option>
								{(
									["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]
								).map((d) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
						</div>
					</>
				)}

				<div className="flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium"
					>
						Cancel
					</button>
					<button
						onClick={() => publish({ visibility, category, difficulty })}
						disabled={loading}
						className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 transition"
					>
						{loading ? "Saving..." : "Save"}
					</button>
				</div>
			</div>
		</div>
	);
}
