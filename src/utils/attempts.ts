import { supabase } from "../lib/supabase";

export async function getAttemptCounts(
	quizIds: string[]
): Promise<Record<string, number>> {
	if (quizIds.length === 0) return {};

	const { data } = await supabase
		.from("quiz_attempts")
		.select("quiz_id")
		.in("quiz_id", quizIds);

	if (!data) return {};

	return data.reduce<Record<string, number>>((acc, row) => {
		acc[row.quiz_id] = (acc[row.quiz_id] ?? 0) + 1;
		return acc;
	}, {});
}
