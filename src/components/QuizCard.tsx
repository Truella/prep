"use client";

import { useState } from "react";
import { Calendar02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import PublishModal from "./quiz-bank/PublishModal";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../lib/types";

interface QuizCardProps {
	quiz: {
		id: string;
		title: string;
		description: string;
		created_at: string;
		visibility?: QuizVisibility;
		category?: QuizCategory | null;
		difficulty?: QuizDifficulty | null;
		times_taken?: number;
		average_rating?: number | null;
	};
	onCopyLink: (id: string) => void;
	onRefetch?: () => void;
}

const VISIBILITY_COLORS: Record<string, string> = {
	private: "text-gray-400 bg-gray-400/10 border-gray-400/20",
	unlisted: "text-blue-400 bg-blue-400/10 border-blue-400/20",
	public: "text-green-400 bg-green-400/10 border-green-400/20",
};

export default function QuizCard({ quiz, onCopyLink, onRefetch }: QuizCardProps) {
	const [isPublishOpen, setIsPublishOpen] = useState(false);
	const visibility = quiz.visibility ?? "private";

	return (
		<div className="backdrop-blur-xl border rounded-2xl p-6 hover:bg-surface-raised transition-all group"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
			<div className="flex items-start justify-between gap-2 mb-2">
				<h3 className="text-lg font-semibold transition"
					style={{ color: "var(--color-text-primary)" }}>
					{quiz.title}
				</h3>
				<span
					className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded border ${
						VISIBILITY_COLORS[visibility]
					}`}
				>
					{visibility}
				</span>
			</div>
			<p className="text-sm line-clamp-2 mb-2" style={{ color: "var(--color-text-secondary)" }}>
				{quiz.description || "No description provided"}
			</p>

			<div className="flex items-center gap-4 text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>
				<span>{quiz.times_taken ?? 0} taken</span>
				{visibility === "public" && quiz.average_rating != null && (
					<span>★ {quiz.average_rating.toFixed(1)}</span>
				)}
			</div>

			<div className="flex items-center gap-2 mb-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
				<HugeiconsIcon icon={Calendar02Icon} />
				<span>{new Date(quiz.created_at).toLocaleDateString("en-CA")}</span>
			</div>

			<div className="flex gap-2">
				<button
					onClick={() => onCopyLink(quiz.id)}
					className="flex-1 px-4 py-2 rounded-lg border hover:bg-surface transition flex items-center justify-center gap-2 text-sm font-medium"
					style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
				>
					<HugeiconsIcon icon={Copy01Icon} />
					Copy Link
				</button>
			<Link
				href={`/dashboard/quiz/${quiz.id}`}
				className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
				style={{
					backgroundColor: "var(--color-text-primary)",
					color: "var(--color-bg)",
				}}
			>
				Manage
			</Link>
				<button
					onClick={() => setIsPublishOpen(true)}
					className="px-4 py-2 rounded-lg border text-sm font-medium transition"
					style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
				>
					Publish
				</button>
			</div>

			<PublishModal
				quizId={quiz.id}
				currentVisibility={visibility}
				currentCategory={quiz.category}
				currentDifficulty={quiz.difficulty}
				isOpen={isPublishOpen}
				onClose={() => setIsPublishOpen(false)}
				onSuccess={() => onRefetch?.()}
			/>
		</div>
	);
}
