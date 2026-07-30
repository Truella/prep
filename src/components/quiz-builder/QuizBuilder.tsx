"use client";

import { useState, useEffect } from "react";
import {
	validateQuestion,
	validateQuizForSubmit,
} from "../../utils/questionValidation";
import BuilderQuestionCard from "./BuilderQuestionCard";
import BuilderToolbar from "./BuilderToolbar";
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
	initialQuestions?: AppQuestion[];
	onSaveAsDraft: (questions: AppQuestion[]) => Promise<boolean>;
	onPublish: (questions: AppQuestion[]) => void;
	isUploading: boolean;
}

export default function QuizBuilder({
	quizId,
	initialQuestions,
	onSaveAsDraft,
	onPublish,
	isUploading,
}: QuizBuilderProps) {
	const [questions, setQuestions] = useState<AppQuestion[]>(() =>
		initialQuestions && initialQuestions.length > 0 ? initialQuestions : [blankQuestion(0)],
	);
	const [errors, setErrors] = useState<Map<number, string[]>>(new Map());

	const { toggle, isExpanded, onQuestionAdded, removeAtIndex, swapIndices } =
		useQuestionCollapse(1);

	useEffect(() => {
		if (initialQuestions && initialQuestions.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setQuestions(initialQuestions);
			return;
		}
		try {
			const raw = localStorage.getItem(DRAFT_KEY);
			if (!raw) return;
			const draft = JSON.parse(raw) as Record<string, unknown>;
			if (draft?.quizId !== quizId || !Array.isArray(draft?.questions)) return;
			const validated: AppQuestion[] = [];
			for (const q of draft.questions as unknown[]) {
				const r = q as Record<string, unknown> | null;
				if (
					r &&
					typeof r.id === "string" &&
					typeof r.questionText === "string" &&
					typeof r.optionA === "string" &&
					typeof r.optionB === "string" &&
					typeof r.optionC === "string" &&
					typeof r.optionD === "string" &&
					typeof r.correctIndex === "number" &&
					r.correctIndex >= 0 &&
					r.correctIndex <= 3 &&
					typeof r.points === "number" &&
					typeof r.order === "number"
				) {
					validated.push(r as unknown as AppQuestion);
				}
			}
			if (validated.length > 0) {
				setQuestions(validated);
			}
		} catch {}
	}, [initialQuestions, quizId]);

	const persist = (qs: AppQuestion[]) => {
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify({ quizId, questions: qs }));
		} catch {}
	};

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

	const deleteQuestion = (index: number) => {
		removeAtIndex(index);
		setErrors((prev) => {
			const next = new Map<number, string[]>();
			prev.forEach((val, key) => {
				if (key < index) next.set(key, val);
				else if (key > index) next.set(key - 1, val);
			});
			return next;
		});
		setQuestions((prev) => {
			const next = reorder(prev.filter((_, i) => i !== index));
			persist(next);
			return next;
		});
	};

	const moveUp = (index: number) => {
		if (index === 0) return;
		const next = [...questions];
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		const reordered = reorder(next);
		setQuestions(reordered);
		persist(reordered);
		swapIndices(index - 1, index);
		setErrors((prev) => {
			const next = new Map(prev);
			const tmp = next.get(index - 1);
			if (next.has(index)) {
				next.set(index - 1, next.get(index)!);
			} else {
				next.delete(index - 1);
			}
			if (tmp !== undefined) {
				next.set(index, tmp);
			} else {
				next.delete(index);
			}
			return next;
		});
	};

	const moveDown = (index: number) => {
		if (index === questions.length - 1) return;
		const next = [...questions];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		const reordered = reorder(next);
		setQuestions(reordered);
		persist(reordered);
		swapIndices(index, index + 1);
		setErrors((prev) => {
			const next = new Map(prev);
			const tmp = next.get(index);
			if (next.has(index + 1)) {
				next.set(index, next.get(index + 1)!);
			} else {
				next.delete(index);
			}
			if (tmp !== undefined) {
				next.set(index + 1, tmp);
			} else {
				next.delete(index + 1);
			}
			return next;
		});
	};

	const handleSaveAsDraft = async () => {
		const hasQuestionContent = questions.some((question) =>
			[
				question.questionText,
				question.optionA,
				question.optionB,
				question.optionC,
				question.optionD,
			].some((value) => value.trim().length > 0),
		);
		if (!hasQuestionContent) {
			const ok = await onSaveAsDraft([]);
			if (ok) localStorage.removeItem(DRAFT_KEY);
			return;
		}

		const errs = validateQuizForSubmit(questions);
		setErrors(errs);
		if (errs.size > 0) return;
		const ok = await onSaveAsDraft(questions);
		if (ok) {
			localStorage.removeItem(DRAFT_KEY);
		}
	};

	const handlePublish = () => {
		const errs = validateQuizForSubmit(questions);
		setErrors(errs);
		if (errs.size > 0) return;
		onPublish(questions);
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

			<BuilderToolbar
				onAdd={addQuestion}
				onSaveAsDraft={handleSaveAsDraft}
				onPublish={handlePublish}
				isUploading={isUploading}
				quizId={quizId}
			/>
		</div>
	);
}
