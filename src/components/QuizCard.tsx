"use client";

import { useState } from "react";
import { Calendar02Icon, Copy01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizCategory, QuizDifficulty } from "../lib/types";

interface QuizCardProps {
	quiz: {
		id: string;
		title: string;
		description: string;
		created_at: string;
		status?: "draft" | "published";
		visibility?: QuizVisibility;
		category?: QuizCategory | null;
		difficulty?: QuizDifficulty | null;
		times_taken?: number;
		average_rating?: number | null;
		code?: string | null;
	};
	onCopyLink: (id: string) => void;
	onRefetch?: () => void;
	onUnpublish?: (quizId: string) => Promise<void>;
}

const VISIBILITY_COLORS: Record<string, string> = {
	private: "text-gray-400 bg-gray-400/10 border-gray-400/20",
	public: "text-green-400 bg-green-400/10 border-green-400/20",
};

export default function QuizCard({ quiz, onCopyLink, onRefetch, onUnpublish }: QuizCardProps) {
	const [unpublishing, setUnpublishing] = useState(false);
	const [confirmUnpublish, setConfirmUnpublish] = useState(false);
	const visibility = quiz.visibility ?? "private";

	const handleUnpublish = async () => {
		if (!confirmUnpublish) {
			setConfirmUnpublish(true);
			return;
		}
		setUnpublishing(true);
		try {
			if (onUnpublish) {
				await onUnpublish(quiz.id);
			} else {
				const { error } = await supabase
					.from("quizzes")
					.update({ status: "draft", code: null, visibility: "private" })
					.eq("id", quiz.id);
				if (error) throw error;
				toast.success("Quiz unpublished and moved to drafts");
			}
			onRefetch?.();
		} catch {
			toast.error("Failed to unpublish");
			setConfirmUnpublish(false);
		} finally {
			setUnpublishing(false);
		}
	};

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
			{quiz.code && (
				<div className="flex items-center gap-2 mt-1">
					<span className="text-xs font-mono font-bold" style={{ color: "var(--color-accent)" }}>
						{quiz.code}
					</span>
					<button
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(quiz.code!);
								toast.success("Code copied!");
							} catch {
								toast.error("Failed to copy code");
							}
						}}
						className="text-xs transition"
						style={{ color: "var(--color-text-secondary)" }}
					>
						Copy code
					</button>
				</div>
			)}
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
					onClick={handleUnpublish}
					disabled={unpublishing}
					className="px-4 py-2 rounded-lg border text-sm font-medium transition"
					style={{
						borderColor: confirmUnpublish ? "rgb(239 68 68 / 0.5)" : "var(--color-border)",
						color: confirmUnpublish ? "rgb(248 113 113)" : "var(--color-text-secondary)",
						backgroundColor: confirmUnpublish ? "rgb(239 68 68 / 0.1)" : "transparent",
					}}
				>
					{unpublishing ? "..." : confirmUnpublish ? "Confirm unpublish" : "Unpublish"}
				</button>
			</div>
		</div>
	);
}
