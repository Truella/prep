"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { getAttemptCounts } from "../../utils/attempts";
import FadeUp from "./FadeUp";
import QuizBankCard from "../quiz-bank/QuizBankCard";
import type { PublicQuiz } from "../../lib/types";

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

	return (
		<section
			className="py-24 px-6 border-t"
			style={{ borderColor: "var(--color-border)" }}
		>
			<div className="max-w-6xl mx-auto">
				<FadeUp className="flex items-end justify-between mb-10">
					<div>
						<h2
							className="text-3xl mb-2"
							style={{
								fontFamily: "var(--font-display)",
								color: "var(--color-text-primary)",
							}}
						>
							From the Quiz Bank
						</h2>
						<p
							className="text-sm"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Practice with quizzes shared by other students.
						</p>
					</div>
					<Link
						href="/quiz-bank"
						className="text-sm font-medium hidden sm:block"
						style={{ color: "var(--color-accent)" }}
					>
						Browse all →
					</Link>
				</FadeUp>

				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className="p-5 rounded-2xl border animate-pulse"
								style={{
									backgroundColor: "var(--color-surface)",
									borderColor: "var(--color-border)",
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
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{preview.map((quiz, i) => (
							<FadeUp key={quiz.id} delay={i * 0.1}>
								<QuizBankCard quiz={quiz} />
							</FadeUp>
						))}
					</div>
				)}

				<div className="mt-6 sm:hidden text-center">
					<Link
						href="/quiz-bank"
						className="text-sm font-medium"
						style={{ color: "var(--color-accent)" }}
					>
						Browse all →
					</Link>
				</div>
			</div>
		</section>
	);
}
