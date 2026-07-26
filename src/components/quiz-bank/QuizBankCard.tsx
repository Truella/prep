"use client";

import Link from "next/link";
import type { PublicQuiz } from "../../lib/types";

const DIFFICULTY_COLORS: Record<string, string> = {
	Beginner: "text-green-400 border-green-400/20 bg-green-400/10",
	Intermediate: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
	Advanced: "text-red-400 border-red-400/20 bg-red-400/10",
};

export default function QuizBankCard({ quiz }: { quiz: PublicQuiz }) {
	const stars = Math.round(quiz.average_rating ?? 0);

	return (
		<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
			<div className="flex items-start justify-between gap-2">
				<h3 className="text-white font-semibold text-sm leading-snug">
					{quiz.title}
				</h3>
				{quiz.difficulty && (
					<span
						className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${
							DIFFICULTY_COLORS[quiz.difficulty] ?? ""
						}`}
					>
						{quiz.difficulty}
					</span>
				)}
			</div>

			<p className="text-gray-400 text-xs line-clamp-2">
				{quiz.description || "No description"}
			</p>

			{quiz.category && (
				<span className="inline-block text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
					{quiz.category}
				</span>
			)}

			<div className="flex items-center gap-3 text-xs text-gray-400">
				<span>
					{"★".repeat(stars)}
					{"☆".repeat(5 - stars)} {quiz.average_rating?.toFixed(1) ?? "—"}
				</span>
				<span>{quiz.times_taken} taken</span>
			</div>

			<Link
				href={`/quiz/${quiz.id}`}
				className="block w-full text-center px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 transition"
			>
				Take Quiz
			</Link>
		</div>
	);
}
