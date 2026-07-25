import type { AppQuestion } from "../lib/types";

export function validateQuestion(q: AppQuestion): string[] {
	const errors: string[] = [];

	if (!q.questionText.trim()) {
		errors.push("Question text is required");
	}

	const options = [q.optionA, q.optionB, q.optionC, q.optionD];
	const labels = ["Option A", "Option B", "Option C", "Option D"];

	options.forEach((opt, i) => {
		if (!opt.trim()) errors.push(`${labels[i]} is required`);
	});

	const filled = options.filter((o) => o.trim());
	const unique = new Set(filled.map((o) => o.trim()));
	if (filled.length > 1 && unique.size < filled.length) {
		errors.push("Options must be unique");
	}

	if (q.correctIndex < 0 || q.correctIndex > 3) {
		errors.push("Correct answer must be A, B, C, or D");
	}

	if (q.points < 1 || q.points > 100) {
		errors.push("Points must be between 1 and 100");
	}

	return errors;
}

export function validateQuizForSubmit(
	questions: AppQuestion[]
): Map<number, string[]> {
	const errors = new Map<number, string[]>();
	questions.forEach((q, i) => {
		const errs = validateQuestion(q);
		if (errs.length > 0) errors.set(i, errs);
	});
	return errors;
}
