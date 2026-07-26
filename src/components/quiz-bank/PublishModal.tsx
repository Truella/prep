"use client";

import { useState } from "react";
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
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
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
	isOpen,
	onClose,
	onSuccess,
}: PublishModalProps) {
	const [visibility, setVisibility] =
		useState<QuizVisibility>(currentVisibility);
	const [category, setCategory] = useState<QuizCategory | null>(null);
	const [difficulty, setDifficulty] = useState<QuizDifficulty | null>(null);

	const { publish, loading } = usePublishQuiz(quizId, () => {
		onSuccess();
		onClose();
	});

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
				<h3 className="text-xl font-bold text-white">Quiz Visibility</h3>

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
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Category
							</label>
							<select
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
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Difficulty
							</label>
							<select
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
