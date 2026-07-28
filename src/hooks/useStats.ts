import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';

export function useAnalyticsStats() {
	const [stats, setStats] = useState({
		totalQuizzes: 0,
		totalQuestions: 0,
		totalAttempts: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setLoading(false);
				return;
			}

			const { count: quizCount } = await supabase
				.from("quizzes")
				.select("*", { count: "exact", head: true })
				.eq("created_by", user.id);

			const { data: userQuizzes } = await supabase
				.from("quizzes")
				.select("id")
				.eq("created_by", user.id);

			const quizIds = userQuizzes?.map((q) => q.id) || [];

			let questionCount = 0;

			if (quizIds.length > 0) {
				const { count } = await supabase
					.from("questions")
					.select("*", { count: "exact", head: true })
					.in("quiz_id", quizIds);

				questionCount = count || 0;
			}

			let attemptCount = 0;

			if (quizIds.length > 0) {
				const { count } = await supabase
					.from("quiz_attempts")
					.select("*", { count: "exact", head: true })
					.in("quiz_id", quizIds);

				attemptCount = count || 0;
			}

			setStats({
				totalQuizzes: quizCount || 0,
				totalQuestions: questionCount,
				totalAttempts: attemptCount,
			});

			setLoading(false);
		};

		fetchStats();
	}, []);

	return { stats, loading };
}