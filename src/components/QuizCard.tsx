"use client";

import { useState } from "react";
import { Calendar02Icon, Copy01Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import PublishModal from "./quiz-bank/PublishModal";
import type { QuizVisibility } from "../lib/types";

interface QuizCardProps {
	quiz: {
		id: string;
		title: string;
		description: string;
		created_at: string;
		visibility?: QuizVisibility;
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
		<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
			<div className="flex items-start justify-between gap-2 mb-2">
				<h3 className="text-lg font-semibold text-white group-hover:text-white transition">
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
			<p className="text-gray-400 text-sm line-clamp-2 mb-2">
				{quiz.description || "No description provided"}
			</p>

			{visibility === "public" && (
				<div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
					<span>{quiz.times_taken ?? 0} taken</span>
					{quiz.average_rating != null && (
						<span>★ {quiz.average_rating.toFixed(1)}</span>
					)}
				</div>
			)}

			<div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
				<HugeiconsIcon icon={Calendar02Icon} />
				<span>{new Date(quiz.created_at).toLocaleDateString()}</span>
			</div>

			<div className="flex gap-2">
				<button
					onClick={() => onCopyLink(quiz.id)}
					className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm font-medium"
				>
					<HugeiconsIcon icon={Copy01Icon} />
					Copy Link
				</button>
				<Link
					href={`/quiz/${quiz.id}`}
					className="flex-1 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm font-medium"
				>
					{" "}
					<HugeiconsIcon icon={EyeIcon} />
					View
				</Link>
				<button
					onClick={() => setIsPublishOpen(true)}
					className="px-4 py-2 rounded-lg border border-white/20 text-gray-400 hover:text-white hover:bg-white/5 transition text-sm font-medium"
				>
					Publish
				</button>
			</div>

			<PublishModal
				quizId={quiz.id}
				currentVisibility={visibility}
				isOpen={isPublishOpen}
				onClose={() => setIsPublishOpen(false)}
				onSuccess={() => onRefetch?.()}
			/>
		</div>
	);
}
