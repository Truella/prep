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
			const saved = localStorage.getItem(DRAFT_KEY);
			if (saved) setQuestions(JSON.parse(saved));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify(questions));
		} catch {}
	}, [questions]);

	const updateQuestion = (index: number, updated: AppQuestion) => {
		const next = [...questions];
		next[index] = updated;
		setQuestions(next);
		// Only clear an existing error for this card once it becomes valid —
		// never surface new errors while the user is mid-edit.
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
		// Validate all existing questions before allowing a new one to be added.
		const errs = validateQuizForSubmit(questions);
		if (errs.size > 0) {
			setErrors(errs);
			return;
		}
		setQuestions((prev) => {
			onQuestionAdded(prev, prev.length);
			return [...prev, blankQuestion(prev.length)];
		});
	};

	const deleteQuestion = (index: number) =>
		setQuestions((prev) => prev.filter((_, i) => i !== index));

	const moveUp = (index: number) => {
		if (index === 0) return;
		const next = [...questions];
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		setQuestions(next);
	};

	const moveDown = (index: number) => {
		if (index === questions.length - 1) return;
		const next = [...questions];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		setQuestions(next);
	};

	const handleSubmit = async () => {
		const errs = validateQuizForSubmit(questions);
		setErrors(errs);
		if (errs.size > 0) return;
		await onSubmit(questions);
		localStorage.removeItem(DRAFT_KEY);
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
