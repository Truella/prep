"use client";

import { useRef, useEffect } from "react";
import type { AppQuestion } from "../../lib/types";
import { isComplete } from "../../hooks/useQuestionCollapse";

interface BuilderQuestionCardProps {
	question: AppQuestion;
	index: number;
	total: number;
	isExpanded: boolean;
	onToggle: () => void;
	onChange: (updated: AppQuestion) => void;
	onDelete: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	errors: string[];
}

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

function truncate(str: string, max: number) {
	return str.length > max ? str.slice(0, max) + "…" : str;
}

export default function BuilderQuestionCard({
	question,
	index,
	total,
	isExpanded,
	onToggle,
	onChange,
	onDelete,
	onMoveUp,
	onMoveDown,
	errors,
}: BuilderQuestionCardProps) {
	const hasErrors = errors.length > 0;
	const complete = isComplete(question);
	const incomplete = !complete || hasErrors;

	// The option values as an array
	const options = [
		question.optionA,
		question.optionB,
		question.optionC,
		question.optionD,
	];

	const handleOptionChange = (i: number, value: string) => {
		onChange({ ...question, [OPTION_KEYS[i]]: value });
	};

	// Animated height ref for the body
	const bodyRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		if (isExpanded) {
			// Animate open: set max-height to scrollHeight then clear
			el.style.maxHeight = el.scrollHeight + "px";
			const tid = setTimeout(() => {
				el.style.maxHeight = "none"; // allow free resize
			}, 180);
			return () => clearTimeout(tid);
		} else {
			// Animate closed: snapshot height first, then zero
			el.style.maxHeight = el.scrollHeight + "px";
			// Force reflow
			void el.offsetHeight;
			el.style.maxHeight = "0px";
		}
	}, [isExpanded]);

	// Collapsed summary data
	const correctLetter = OPTION_LABELS[question.correctIndex];
	const correctText = options[question.correctIndex];

	const borderClass = hasErrors
		? "border-red-500/50"
		: "";

	return (
		<div
			className={`backdrop-blur-sm border rounded-xl overflow-hidden ${borderClass}`}
			style={{ backgroundColor: "var(--color-surface)", borderColor: hasErrors ? undefined : "var(--color-border)" }}
		>
			{/* ── Header row — always visible, click to toggle ── */}
			<div
				role="button"
				tabIndex={0}
				aria-expanded={isExpanded}
				onClick={onToggle}
				onKeyDown={(e) => e.key === "Enter" || e.key === " " ? onToggle() : undefined}
				className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none group"
			>
				{/* Chevron */}
				<svg
					className={`shrink-0 w-4 h-4 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
					style={{ color: "var(--color-text-secondary)" }}
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>

				{/* Q-number */}
				<span className="shrink-0 text-xs font-semibold w-6" style={{ color: "var(--color-text-secondary)" }}>
					Q{index + 1}
				</span>

				{/* Question text preview */}
				<span className="flex-1 text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
					{question.questionText
						? truncate(question.questionText, 55)
						: <span className="italic" style={{ color: "var(--color-text-secondary)" }}>Untitled question</span>}
				</span>

				{/* Badge: answer or incomplete */}
				{!isExpanded && (
					incomplete ? (
						<span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-xs font-medium">
							⚠ Incomplete
						</span>
					) : (
						<span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
							✓ {correctLetter}: {truncate(correctText, 20)}
						</span>
					)
				)}

				{/* Points */}
				<span className="shrink-0 text-xs ml-1" style={{ color: "var(--color-text-secondary)" }}>
					{question.points}pt
				</span>

				{/* Action buttons — stop propagation so they don't toggle */}
				<div
					className="shrink-0 flex gap-1.5 ml-1"
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<button
						onClick={onMoveUp}
						disabled={index === 0}
						className="disabled:opacity-30 transition text-xs px-2 py-1 rounded border"
						style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
					>
						↑
					</button>
					<button
						onClick={onMoveDown}
						disabled={index === total - 1}
						className="disabled:opacity-30 transition text-xs px-2 py-1 rounded border"
						style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }}
					>
						↓
					</button>
					<button
						onClick={onDelete}
						className="transition text-xs px-2 py-1 rounded border border-red-500/20"
						style={{ color: "rgb(248 113 113)" }}
					>
						Delete
					</button>
				</div>
			</div>

			{/* ── Collapsible body ── */}
			<div
				ref={bodyRef}
				style={{ maxHeight: isExpanded ? "none" : "0px", overflow: "hidden" }}
				className="transition-[max-height] duration-[170ms] ease-in-out"
			>
				<div className="px-6 pb-6 space-y-4 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
					{/* Question text */}
					<textarea
						value={question.questionText}
						onChange={(e) =>
							onChange({ ...question, questionText: e.target.value })
						}
						placeholder="Enter question text"
						rows={2}
						className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition resize-none"
						style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
					/>

					{/* Options */}
					<div className="grid grid-cols-2 gap-3">
						{options.map((opt, i) => (
							<div key={i} className="flex items-center gap-2">
								<button
									onClick={() =>
										onChange({ ...question, correctIndex: i as 0 | 1 | 2 | 3 })
									}
									className={`shrink-0 w-7 h-7 rounded-full border text-xs font-bold transition ${
										question.correctIndex === i ? "" : ""
									}`}
									style={{
										backgroundColor: question.correctIndex === i ? "var(--color-text-primary)" : "transparent",
										color: question.correctIndex === i ? "var(--color-bg)" : "var(--color-text-secondary)",
										borderColor: question.correctIndex === i ? "var(--color-text-primary)" : "var(--color-border)",
									}}
								>
									{OPTION_LABELS[i]}
								</button>
								<input
									value={opt}
									onChange={(e) => handleOptionChange(i, e.target.value)}
									placeholder={`Option ${OPTION_LABELS[i]}`}
									className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 transition text-sm"
									style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
								/>
							</div>
						))}
					</div>

					{/* Points */}
					<div className="flex items-center gap-3">
						<label className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Points:</label>
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
							className="w-20 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-1 transition"
							style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
						/>
						<span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
							Click a letter to mark the correct answer
						</span>
					</div>

					{/* Errors */}
					{hasErrors && (
						<ul className="space-y-1">
							{errors.map((e, i) => (
								<li key={i} className="text-xs" style={{ color: "rgb(248 113 113)" }}>
									{e}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
