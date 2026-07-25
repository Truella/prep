"use client";

import { useState, useEffect } from "react";
import {
	validateQuestion,
	validateQuizForSubmit,
} from "../../utils/questionValidation";
import BuilderQuestionCard from "./BuilderQuestionCard";
import { useQuestionCollapse } from "../../hooks/useQuestionCollapse";
import type { AppQuestion } from "../../lib/types";

const DRAFT_KEY = "quiz_builder_draft";

function blankQuestion(order: number): AppQuestion {
	return {
		id: `draft-${Date.now()}-${order}`,
		quizId: "",
		questionText: "",
		optionA: "",
		optionB: "",
		optionC: "",
		optionD: "",
		correctIndex: 0,
		points: 1,
		order,
	};
}

interface QuizBuilderProps {
	quizId: string | undefined;
	onSubmit: (questions: AppQuestion[]) => Promise<void>;
	isUploading: boolean;
}

export default function QuizBuilder({
	quizId,
	onSubmit,
	isUploading,
}: QuizBuilderProps) {
	const [questions, setQuestions] = useState<AppQuestion[]>([
		blankQuestion(0),
	]);
	const [errors, setErrors] = useState<Map<number, string[]>>(new Map());

	const { toggle, isExpanded, onQuestionAdded } = useQuestionCollapse(1);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw) as { quizId: string; questions: AppQuestion[] };
			// Only restore if the draft belongs to THIS quiz session
			if (draft.quizId === quizId && Array.isArray(draft.questions)) {
				setQuestions(draft.questions);
			}
		} catch {}
	}, [quizId]);

	const persist = (qs: AppQuestion[]) => {
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify({ quizId, questions: qs }));
		} catch {}
	};

	/** Re-stamp every question's .order to match its array index. */
	const reorder = (qs: AppQuestion[]): AppQuestion[] =>
		qs.map((q, i) => ({ ...q, order: i }));

	const updateQuestion = (index: number, updated: AppQuestion) => {
		const next = [...questions];
		next[index] = updated;
		setQuestions(next);
		persist(next);
		if (errors.has(index)) {
			if (validateQuestion(updated).length === 0) {
				setErrors((prev) => {
					const next = new Map(prev);
					next.delete(index);
					return next;
				});
			}
		}
	};

	const addQuestion = () => {
		const errs = validateQuizForSubmit(questions);
		if (errs.size > 0) {
			setErrors(errs);
			return;
		}
		const newIndex = questions.length;
		onQuestionAdded(questions, newIndex);
		setQuestions((prev) => {
			const next = [...prev, blankQuestion(prev.length)];
			persist(next);
			return next;
		});
	};

	const deleteQuestion = (index: number) =>
		setQuestions((prev) => {
			const next = reorder(prev.filter((_, i) => i !== index));
			persist(next);
			return next;
		});

	const moveUp = (index: number) => {
		if (index === 0) return;
		const next = [...questions];
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		const reordered = reorder(next);
		setQuestions(reordered);
		persist(reordered);
	};

	const moveDown = (index: number) => {
		if (index === questions.length - 1) return;
		const next = [...questions];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		const reordered = reorder(next);
		setQuestions(reordered);
		persist(reordered);
	};

	const handleSubmit = async () => {
		const errs = validateQuizForSubmit(questions);
		setErrors(errs);
		if (errs.size > 0) return;
		await onSubmit(questions);
	};

	return (
		<div className="space-y-4">
			{questions.map((q, i) => (
				<BuilderQuestionCard
					key={q.id}
					question={q}
					index={i}
					total={questions.length}
					isExpanded={isExpanded(i, q, (errors.get(i)?.length ?? 0) > 0)}
					onToggle={() => toggle(i)}
					onChange={(updated) => updateQuestion(i, updated)}
					onDelete={() => deleteQuestion(i)}
					onMoveUp={() => moveUp(i)}
					onMoveDown={() => moveDown(i)}
					errors={errors.get(i) ?? []}
				/>
			))}

			<div className="flex gap-3">
				<button
					onClick={addQuestion}
					className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium text-sm"
				>
					+ Add Question
				</button>
				<button
					onClick={handleSubmit}
					disabled={isUploading || !quizId}
					className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
				>
					{isUploading ? "Publishing..." : "Publish Quiz"}
				</button>
			</div>
		</div>
	);
}
