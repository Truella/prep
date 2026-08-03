import type { DBQuestion, AppQuestion } from "@/lib/types";

export function letterToIndex(letter: string): number {
	const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
	return map[letter?.trim().toUpperCase()] ?? -1;
}

export function indexToLetter(index: number): "A" | "B" | "C" | "D" {
	const map: Record<number, "A" | "B" | "C" | "D"> = {
		0: "A",
		1: "B",
		2: "C",
		3: "D",
	};
	return map[index];
}

export function dbToAppQuestion(q: DBQuestion, order: number): AppQuestion {
	return {
		id: q.id,
		quizId: q.quiz_id,
		questionText: q.Question,
		optionA: q.Option_A,
		optionB: q.Option_B,
		optionC: q.Option_C,
		optionD: q.Option_D,
		correctIndex: letterToIndex(q.Correct_Answer) as 0 | 1 | 2 | 3,
		points: q.Points,
		order,
	};
}

export function appToDBQuestion(
	q: AppQuestion
): Omit<DBQuestion, "id" | "quiz_id" | "created_at"> & { quiz_id: string } {
	return {
		quiz_id: q.quizId,
		Question: q.questionText,
		Option_A: q.optionA,
		Option_B: q.optionB,
		Option_C: q.optionC,
		Option_D: q.optionD,
		Correct_Answer: indexToLetter(q.correctIndex),
		Points: q.points,
	};
}
