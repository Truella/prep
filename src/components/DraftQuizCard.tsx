"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Calendar02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface DraftQuizCardProps {
	quiz: {
		id: string;
		title: string;
		description: string;
		created_at: string;
		question_count?: number;
	};
	onRefetch?: () => void;
}

export default function DraftQuizCard({ quiz, onRefetch }: DraftQuizCardProps) {
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		setDeleting(true);
		const { error } = await supabase.from("quizzes").delete().eq("id", quiz.id);
		setDeleting(false);
		if (error) {
			toast.error("Failed to delete draft");
			return;
		}
		toast.success("Draft deleted");
		onRefetch?.();
	};

	return (
		<div
			className="border rounded-2xl p-6 space-y-4"
			style={{
				backgroundColor: "var(--color-surface)",
				borderColor: "var(--color-border)",
				borderStyle: "dashed",
			}}
		>
			<div className="flex items-start justify-between gap-2">
				<h3
					className="text-base font-semibold leading-snug"
					style={{ color: "var(--color-text-primary)" }}
				>
					{quiz.title || "Untitled draft"}
				</h3>
				<span
					className="shrink-0 text-xs font-medium px-2 py-0.5 rounded border"
					style={{
						color: "var(--color-text-secondary)",
						borderColor: "var(--color-border)",
						backgroundColor: "var(--color-surface-raised)",
					}}
				>
					Draft
				</span>
			</div>

			{quiz.description && (
				<p className="text-sm line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
					{quiz.description}
				</p>
			)}

			<div className="flex items-center gap-4 text-xs" style={{ color: "var(--color-text-secondary)" }}>
				<span className="flex items-center gap-2">
					<HugeiconsIcon icon={Calendar02Icon} size={14} />
					{new Date(quiz.created_at).toLocaleDateString("en-CA")}
				</span>
				<span>{quiz.question_count ?? 0} questions</span>
			</div>

			<div className="flex gap-2">
				<Link
					href={`/dashboard/create?resume=${quiz.id}`}
					className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-center transition"
					style={{
						backgroundColor: "var(--color-text-primary)",
						color: "var(--color-bg)",
					}}
				>
					Continue
				</Link>
				<button
					onClick={handleDelete}
					disabled={deleting}
					className="px-4 py-2 rounded-lg text-sm font-medium transition border"
					style={{
						borderColor: confirmDelete ? "rgb(239 68 68 / 0.5)" : "var(--color-border)",
						color: confirmDelete ? "rgb(248 113 113)" : "var(--color-text-secondary)",
						backgroundColor: confirmDelete ? "rgb(239 68 68 / 0.1)" : "transparent",
					}}
				>
					{deleting ? "..." : confirmDelete ? "Confirm" : "Delete"}
				</button>
			</div>
		</div>
	);
}
