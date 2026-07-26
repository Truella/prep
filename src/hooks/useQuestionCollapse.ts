import { useState, useCallback } from "react";
import type { AppQuestion } from "../lib/types";

function isComplete(q: AppQuestion): boolean {
	return (
		q.questionText.trim().length > 0 &&
		q.optionA.trim().length > 0 &&
		q.optionB.trim().length > 0 &&
		q.optionC.trim().length > 0 &&
		q.optionD.trim().length > 0
	);
}

export function useQuestionCollapse(initialCount: number) {
	// true = expanded, false = collapsed
	const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>(
		() => {
			const map: Record<number, boolean> = {};
			for (let i = 0; i < initialCount; i++) map[i] = true;
			return map;
		},
	);

	const toggle = useCallback((index: number) => {
		setExpandedMap((prev) => ({ ...prev, [index]: !prev[index] }));
	}, []);

	const expand = useCallback((index: number) => {
		setExpandedMap((prev) => ({ ...prev, [index]: true }));
	}, []);

	/**
	 * Called when a new question is appended.
	 * Collapses the previous question if it's complete, expands the new one.
	 */
	const onQuestionAdded = useCallback(
		(prevQuestions: AppQuestion[], newIndex: number) => {
			setExpandedMap((prev) => {
				const next = { ...prev };
				// Collapse previous if complete
				const prevIndex = newIndex - 1;
				if (prevIndex >= 0 && isComplete(prevQuestions[prevIndex])) {
					next[prevIndex] = false;
				}
				// Always expand the newly added card
				next[newIndex] = true;
				return next;
			});
		},
		[],
	);

	/**
	 * Returns whether a card should render as expanded.
	 * Incomplete questions are always force-expanded.
	 */
	const isExpanded = useCallback(
		(index: number, question: AppQuestion, hasErrors: boolean): boolean => {
			if (!isComplete(question) || hasErrors) return true;
			return expandedMap[index] !== false; // default true
		},
		[expandedMap],
	);

	const removeAtIndex = useCallback((index: number) => {
		setExpandedMap((prev) => {
			const next: Record<number, boolean> = {};
			for (const [key, val] of Object.entries(prev)) {
				const k = Number(key);
				if (k < index) next[k] = val;
				else if (k > index) next[k - 1] = val;
			}
			return next;
		});
	}, []);

	const swapIndices = useCallback((a: number, b: number) => {
		setExpandedMap((prev) => {
			if (prev[a] === undefined && prev[b] === undefined) return prev;
			const next = { ...prev };
			const tmp = next[a];
			next[a] = next[b];
			next[b] = tmp;
			return next;
		});
	}, []);

	return { toggle, expand, isExpanded, onQuestionAdded, removeAtIndex, swapIndices };
}

export { isComplete };
