"use client";

import type { AppQuestion } from "../../lib/types";

interface BuilderQuestionCardProps {
	question: AppQuestion;
	index: number;
	total: number;
	onChange: (updated: AppQuestion) => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	errors: string[];
}

export default function BuilderQuestionCard({
	question,
	index,
	total,
	onChange,
	onDelete,
	onMoveUp,
	onMoveDown,
	errors,
}: BuilderQuestionCardProps) {
	const hasErrors = errors.length > 0;
	const optionLabels = ["A", "B", "C", "D"] as const;
	const options = [
		question.optionA,
		question.optionB,
		question.optionC,
		question.optionD,
	];

	const handleOptionChange = (i: number, value: string) => {
		const keys = ["optionA", "optionB", "optionC", "optionD"] as const;
		onChange({ ...question, [keys[i]]: value });
	};

	return (
		<div
			className={`backdrop-blur-sm bg-white/5 border rounded-xl p-6 space-y-4 ${hasErrors ? "border-red-500/50" : "border-white/10"}`}
		>
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium text-gray-400">
					Question {index + 1}
				</span>
				<div className="flex gap-2">
					<button
						onClick={onMoveUp}
						disabled={index === 0}
						className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10"
					>
						↑
					</button>
					<button
						onClick={onMoveDown}
						disabled={index === total - 1}
						className="text-gray-400 hover:text-white disabled:opacity-30 transition text-xs px-2 py-1 rounded border border-white/10"
					>
						↓
					</button>
					<button
						onClick={onDelete}
						className="text-red-400 hover:text-red-300 transition text-xs px-2 py-1 rounded border border-red-500/20"
					>
						Delete
					</button>
				</div>
			</div>

			<textarea
				value={question.questionText}
				onChange={(e) =>
					onChange({ ...question, questionText: e.target.value })
				}
				placeholder="Enter question text"
				rows={2}
				className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none"
			/>

			<div className="grid grid-cols-2 gap-3">
				{options.map((opt, i) => (
					<div key={i} className="flex items-center gap-2">
						<button
							onClick={() =>
								onChange({ ...question, correctIndex: i as 0 | 1 | 2 | 3 })
							}
							className={`shrink-0 w-7 h-7 rounded-full border text-xs font-bold transition ${
								question.correctIndex === i
									? "bg-white text-black border-white"
									: "border-white/30 text-gray-400 hover:border-white/60"
							}`}
						>
							{optionLabels[i]}
						</button>
						<input
							value={opt}
							onChange={(e) => handleOptionChange(i, e.target.value)}
							placeholder={`Option ${optionLabels[i]}`}
							className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition text-sm"
						/>
					</div>
				))}
			</div>

			<div className="flex items-center gap-3">
				<label className="text-sm text-gray-400">Points:</label>
				<input
					type="number"
					min={1}
					max={100}
					value={question.points}
					onChange={(e) =>
						onChange({
							...question,
							points: parseInt(e.target.value) || 1,
						})
					}
					className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition"
				/>
				<span className="text-xs text-gray-500">
					Click a letter to mark the correct answer
				</span>
			</div>

			{hasErrors && (
				<ul className="space-y-1">
					{errors.map((e, i) => (
						<li key={i} className="text-xs text-red-400">
							{e}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
