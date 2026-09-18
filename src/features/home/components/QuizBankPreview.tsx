"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { getAttemptCounts } from "@/features/quiz-bank/utils/attempts";
import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "@/features/home/components/SectionHeading";
import QuizBankCard from "@/features/quiz-bank/components/QuizBankCard";
import { MOCK_QUIZZES } from "@/features/quiz-bank/mocks/mockQuizzes";
import type { PublicQuiz } from "@/lib/types";

export default function QuizBankPreview() {
	const [preview, setPreview] = useState<PublicQuiz[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const { data, error } = await supabase
				.from("quizzes")
				.select("id, title, description, category, difficulty, average_rating, created_at, time_limit")
				.eq("visibility", "public")
				.order("times_taken", { ascending: false })
				.limit(3);

			if (error || !data) {
				setLoading(false);
				return;
			}

			const ids = data.map((q) => q.id);
			let counts: Record<string, number>;
			try {
				counts = await getAttemptCounts(ids);
			} catch {
				counts = {};
			}
			let qCounts: Record<string, number> = {};
			try {
				const { data: qData } = await supabase.from("questions").select("quiz_id").in("quiz_id", ids);
				(qData ?? []).forEach((row: { quiz_id: string }) => {
					qCounts[row.quiz_id] = (qCounts[row.quiz_id] ?? 0) + 1;
				});
			} catch {}
			const enriched = data.map((q) => ({
				...q,
				times_taken: counts[q.id] ?? 0,
				question_count: qCounts[q.id] ?? 0,
			}));
			// Dev preview: show mock quizzes so category/difficulty hues are visible live when DB only has 2 Technology quizzes
			const isDevPreview = process.env.NODE_ENV !== "production";
			const display = isDevPreview && enriched.length < 3 ? [...enriched, ...MOCK_QUIZZES].slice(0, 3) : enriched;
			setPreview(display);
			setLoading(false);
		})();
	}, []);
	if (!loading && preview.length === 0) {
		return null;
	}
	return (
		<section
			className="py-24 px-6"
			style={{
				backgroundColor: "var(--color-amber-surface)",
			}}
		>
			<div className="max-w-6xl mx-auto">
				<FadeUp className="flex items-end justify-between mb-10">
					<div>
						<SectionHeading accent="amber" className="text-3xl md:text-4xl leading-tight mb-2">
							Don&apos;t have questions yet? Start with someone <em>else&apos;s.</em>
						</SectionHeading>
						<p
							className="text-sm"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Browse quizzes that other Prep users have shared publicly and find something to practice.
						</p>
					</div>
					<Link
						href="/quiz-bank"
						className="text-sm font-medium hidden sm:block"
						style={{ color: "var(--color-amber-accent)" }}
					>
						Browse all →
					</Link>
				</FadeUp>

				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="p-5 rounded-2xl animate-pulse"
								style={{
									backgroundColor: "var(--color-surface)",
								}}
							>
								<div
									className="h-4 w-3/4 rounded mb-3"
									style={{ backgroundColor: "var(--color-surface-raised)" }}
								/>
								<div
									className="h-3 w-1/2 rounded"
									style={{ backgroundColor: "var(--color-surface-raised)" }}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
						{preview.map((quiz, i) => (
							<FadeUp key={quiz.id} delay={i * 0.1} className="h-full">
								<QuizBankCard quiz={quiz} />
							</FadeUp>
						))}
					</div>
				)}

				<FadeUp delay={0.2} className="mt-6 sm:hidden text-center">
					<Link
						href="/quiz-bank"
						className="text-sm font-medium"
						style={{ color: "var(--color-amber-accent)" }}
					>
						Browse all →
					</Link>
				</FadeUp>
			</div>
		</section>
	);
}
