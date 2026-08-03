import { supabase } from "@/lib/supabase";

export async function getAttemptCounts(
	quizIds: string[]
): Promise<Record<string, number>> {
	if (quizIds.length === 0) return {};

	const { data, error } = await supabase
		.rpc("get_quiz_attempt_counts", { quiz_ids: quizIds });

	if (error) throw error;

	const map: Record<string, number> = {};
	for (const row of data ?? []) {
		map[row.quiz_id] = row.count;
	}
	return map;
}
