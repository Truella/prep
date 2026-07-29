"use client";

import { useEffect, useRef, useState } from "react";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type {
	QuizCategory,
	QuizDifficulty,
	QuizVisibility,
} from "../../lib/types";

interface PublishSettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (settings: {
		visibility: QuizVisibility;
		category: QuizCategory | null;
		difficulty: QuizDifficulty | null;
	}) => void;
	isLoading: boolean;
}

const INITIAL_VISIBILITY: QuizVisibility = "private";
const INITIAL_CATEGORY: QuizCategory | null = null;
const INITIAL_DIFFICULTY: QuizDifficulty | null = null;

export default function PublishSettingsModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading,
}: PublishSettingsModalProps) {
	const [visibility, setVisibility] = useState<QuizVisibility>(INITIAL_VISIBILITY);
	const [category, setCategory] = useState<QuizCategory | null>(INITIAL_CATEGORY);
	const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(INITIAL_DIFFICULTY);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const prevOpenRef = useRef(false);

	useEffect(() => {
		if (isOpen && !prevOpenRef.current) {
			setVisibility(INITIAL_VISIBILITY);
			setCategory(INITIAL_CATEGORY);
			setDifficulty(INITIAL_DIFFICULTY);
		}
		prevOpenRef.current = isOpen;
	}, [isOpen]);

	const handleVisibilityChange = (next: QuizVisibility) => {
		setVisibility(next);
		if (next !== "public") {
			setCategory(null);
		}
	};

	useEffect(() => {
		const el = dialogRef.current;
		if (!el) return;
		if (isOpen && !el.open) {
			el.showModal();
		} else if (!isOpen && el.open) {
			el.close();
		}
	}, [isOpen]);

	useEffect(() => {
		const el = dialogRef.current;
		if (!el) return;
		const handler = () => {
			if (!isLoading) onClose();
		};
		el.addEventListener("close", handler);
		return () => el.removeEventListener("close", handler);
	}, [onClose, isLoading]);

	return (
		<dialog
			ref={dialogRef}
			className="rounded-2xl max-w-md w-full shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-sm"
			style={{
				backgroundColor: "var(--color-surface)",
				border: "1px solid var(--color-border)",
				padding: 0,
			}}
		>
			<div className="p-8 space-y-6">
				<div>
					<h3 className="text-xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
						Publish Quiz
					</h3>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						Choose who can find your quiz.
					</p>
				</div>

				<div className="space-y-2">
					{([
						{ value: "private" as QuizVisibility, label: "Private", description: "Accessible via link only. Not in Quiz Bank." },
						{ value: "public" as QuizVisibility, label: "Public", description: "Listed in the Quiz Bank for anyone to discover." },
					] as const).map((option) => (
						<label
							key={option.value}
							className="flex items-start gap-3 cursor-pointer p-3 rounded-lg transition"
							style={{
								backgroundColor: visibility === option.value ? "var(--color-accent-dim)" : "var(--color-surface-raised)",
								border: `1px solid ${visibility === option.value ? "var(--color-accent)" : "var(--color-border)"}`,
							}}
						>
							<input
								type="radio"
								name="publish-visibility"
								checked={visibility === option.value}
								onChange={() => handleVisibilityChange(option.value)}
								disabled={isLoading}
								className="mt-0.5"
							/>
							<div>
								<p className="text-sm font-medium" style={{ color: visibility === option.value ? "var(--color-accent)" : "var(--color-text-primary)" }}>
									{option.label}
								</p>
								<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{option.description}</p>
							</div>
						</label>
					))}
				</div>

				{visibility === "public" && (
					<div className="grid grid-cols-2 gap-4">
						<label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
							<span className="block mb-1.5">Category</span>
							<select
								value={category ?? ""}
								onChange={(event) => setCategory((event.target.value as QuizCategory) || null)}
								disabled={isLoading}
								className="w-full px-3 py-2 rounded-lg border text-sm"
								style={{ backgroundColor: "var(--color-surface-raised)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
							>
								<option value="">No category</option>
								{QUIZ_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
							</select>
						</label>
						<label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
							<span className="block mb-1.5">Difficulty</span>
							<select
								value={difficulty ?? ""}
								onChange={(event) => setDifficulty((event.target.value as QuizDifficulty) || null)}
								disabled={isLoading}
								className="w-full px-3 py-2 rounded-lg border text-sm"
								style={{ backgroundColor: "var(--color-surface-raised)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
							>
								<option value="">Not specified</option>
								{(["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]).map((item) => <option key={item} value={item}>{item}</option>)}
							</select>
						</label>
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="flex-1 px-6 py-3 rounded-lg border text-sm font-medium transition disabled:opacity-50"
						style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={() => onConfirm({ visibility, category, difficulty })}
						disabled={isLoading}
						className="flex-1 px-6 py-3 rounded-lg text-sm font-semibold transition disabled:opacity-60"
						style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
					>
						{isLoading ? "Publishing..." : "Publish"}
					</button>
				</div>
			</div>
		</dialog>
	);
}
