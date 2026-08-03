"use client";

import { useRef, useEffect } from "react";
import type { AppQuestion } from "@/lib/types";
import { isComplete } from "@/features/quiz-management/hooks/useQuestionCollapse";
import QuestionStatusBadge from "./QuestionStatusBadge";
import QuestionActionButtons from "./QuestionActionButtons";
import QuestionCardBody from "./QuestionCardBody";
import { OPTION_LABELS } from "./constants";

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

	const options = [
		question.optionA,
		question.optionB,
		question.optionC,
		question.optionD,
	];

	const bodyRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = bodyRef.current;
		if (!el) return;
		if (isExpanded) {
			el.style.maxHeight = el.scrollHeight + "px";
			const tid = setTimeout(() => {
				el.style.maxHeight = "none";
			}, 180);
			return () => clearTimeout(tid);
		} else {
			el.style.maxHeight = el.scrollHeight + "px";
			void el.offsetHeight;
			el.style.maxHeight = "0px";
		}
	}, [isExpanded]);

	const correctLetter = OPTION_LABELS[question.correctIndex];
	const correctText = options[question.correctIndex];

	const borderClass = hasErrors ? "border-red-500/50" : "";

	return (
		<div
			className={`backdrop-blur-sm border rounded-xl overflow-hidden ${borderClass}`}
			style={{ backgroundColor: "var(--color-surface)", borderColor: hasErrors ? undefined : "var(--color-border)" }}
		>
			<div
				role="button"
				tabIndex={0}
				aria-expanded={isExpanded}
				onClick={onToggle}
				onKeyDown={(e) => e.key === "Enter" || e.key === " " ? onToggle() : undefined}
				className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none group"
			>
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

				<span className="shrink-0 text-xs font-semibold w-6" style={{ color: "var(--color-text-secondary)" }}>
					Q{index + 1}
				</span>

				<span className="flex-1 text-sm truncate" style={{ color: "var(--color-text-primary)" }}>
					{question.questionText
						? truncate(question.questionText, 55)
						: <span className="italic" style={{ color: "var(--color-text-secondary)" }}>Untitled question</span>}
				</span>

				{!isExpanded && (
					<QuestionStatusBadge
						incomplete={incomplete}
						correctLetter={correctLetter}
						correctText={truncate(correctText, 20)}
					/>
				)}

				<span className="shrink-0 text-xs ml-1" style={{ color: "var(--color-text-secondary)" }}>
					{question.points}pt
				</span>

				<QuestionActionButtons
					onMoveUp={onMoveUp}
					onMoveDown={onMoveDown}
					onDelete={onDelete}
					canMoveUp={index > 0}
					canMoveDown={index < total - 1}
				/>
			</div>

			<div
				ref={bodyRef}
				style={{ maxHeight: isExpanded ? "none" : "0px", overflow: "hidden" }}
				className="transition-[max-height] duration-[170ms] ease-in-out"
			>
				<div className="px-6 pb-6 space-y-4 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
					<QuestionCardBody
						question={question}
						onChange={onChange}
						errors={errors}
						pointsInputId={`points-${question.id}`}
					/>
				</div>
			</div>
		</div>
	);
}
