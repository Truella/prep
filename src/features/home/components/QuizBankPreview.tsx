"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { getAttemptCounts } from "@/features/quiz-bank/utils/attempts";
import FadeUp from "@/shared/components/FadeUp";
import QuizBankCard from "@/features/quiz-bank/components/QuizBankCard";
import type { PublicQuiz } from "@/lib/types";

export default function QuizBankPreview() {
	const [preview, setPreview] = useState<PublicQuiz[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const { data, error } = await supabase
				.from("quizzes")
				.select("id, title, description, category, difficulty, average_rating, created_at")
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
			const enriched = data.map((q) => ({
				...q,
				times_taken: counts[q.id] ?? 0,
			}));
			setPreview(enriched);
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
						<h2
							className="text-3xl md:text-4xl leading-tight mb-2"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-text-primary)",
							}}
						>
							Don&apos;t have questions yet? Start with someone else&apos;s.
						</h2>
						<p
							className="text-sm"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Browse quizzes shared by other Prep users and find something to practice.
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
