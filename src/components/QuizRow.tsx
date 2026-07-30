"use client";

import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { QuizCategory, QuizDifficulty, QuizVisibility } from "../lib/types";
import { supabase } from "../lib/supabase";

interface QuizRowQuiz {
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
	question_count?: number;
}

interface QuizRowProps {
	quiz: QuizRowQuiz;
	onCopyLink?: (id: string) => void;
	onRefetch?: () => void;
	onUnpublish?: (quizId: string) => Promise<void>;
	onDelete?: (quizId: string) => Promise<void>;
}

export default function QuizRow({ quiz, onCopyLink, onRefetch, onUnpublish, onDelete }: QuizRowProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState<"delete" | "unpublish" | null>(null);
	const [committing, setCommitting] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const isDraft = quiz.status === "draft";
	const attempts = quiz.times_taken ?? 0;

	useEffect(() => {
		if (!menuOpen) return;
		const closeMenu = (event: MouseEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) {
				setMenuOpen(false);
				setConfirmAction(null);
			}
		};
		document.addEventListener("mousedown", closeMenu);
		return () => document.removeEventListener("mousedown", closeMenu);
	}, [menuOpen]);

	const handleCopyLink = () => {
		if (onCopyLink) {
			onCopyLink(quiz.id);
		} else {
			navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.id}`);
			toast.success("Quiz link copied!");
		}
		setMenuOpen(false);
	};

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(quiz.code!);
			toast.success("Code copied!");
		} catch {
			toast.error("Failed to copy code");
		}
		setMenuOpen(false);
	};

	const handleUnpublish = async () => {
		if (confirmAction !== "unpublish") {
			setConfirmAction("unpublish");
			return;
		}
		setCommitting(true);
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
			setMenuOpen(false);
		} catch {
			toast.error("Failed to unpublish");
			setConfirmAction(null);
		} finally {
			setCommitting(false);
		}
	};

	const handleDelete = async () => {
		if (confirmAction !== "delete") {
			setConfirmAction("delete");
			return;
		}
		setCommitting(true);
		try {
			if (onDelete) {
				await onDelete(quiz.id);
			} else {
				const { error } = await supabase.from("quizzes").delete().eq("id", quiz.id);
				if (error) throw error;
				toast.success("Draft deleted");
			}
			onRefetch?.();
			setMenuOpen(false);
		} catch {
			toast.error("Failed to delete draft");
			setConfirmAction(null);
		} finally {
			setCommitting(false);
		}
	};

	const primaryHref = isDraft
		? `/dashboard/create?resume=${quiz.id}`
		: `/dashboard/quiz/${quiz.id}`;
	const primaryLabel = isDraft ? "Continue editing" : attempts > 0 ? "View results" : "Manage";

	return (
		<div
			className="flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 transition hover:bg-surface-raised sm:px-4"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
		>
			<span
				className="h-2 w-2 shrink-0 rounded-full"
				style={{ backgroundColor: isDraft ? "var(--color-text-secondary)" : "var(--color-accent)" }}
				aria-label={isDraft ? "Draft" : "Published"}
			/>
			<div className="min-w-0 flex-1">
				<h3 className="truncate text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
					{quiz.title || "Untitled draft"}
				</h3>
				<p className="truncate text-xs" style={{ color: "var(--color-text-secondary)" }}>
					{quiz.question_count ?? 0} questions{!isDraft && ` · ${attempts} taken`}
				</p>
			</div>
			<Link
				href={primaryHref}
				className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm"
				style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
			>
				<span className="sm:hidden">{isDraft ? "Continue" : attempts > 0 ? "Results" : "Manage"}</span>
				<span className="hidden sm:inline">{primaryLabel}</span>
			</Link>
			<div className="relative shrink-0" ref={menuRef}>
				<button
					type="button"
					onClick={() => {
						setMenuOpen((open) => !open);
						setConfirmAction(null);
					}}
					className="rounded-lg p-2 transition hover:bg-surface-raised"
					style={{ color: "var(--color-text-secondary)" }}
					aria-label={`More actions for ${quiz.title || "untitled draft"}`}
					aria-expanded={menuOpen}
				>
					<HugeiconsIcon icon={MoreVerticalIcon} size={18} />
				</button>
				{menuOpen && (
					<div
						className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border p-1 shadow-xl"
						style={{ backgroundColor: "var(--color-surface-raised)", borderColor: "var(--color-border)" }}
					>
						{!isDraft && (
							<button type="button" onClick={handleCopyLink} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface">
								Copy link
							</button>
						)}
						{!isDraft && quiz.code && (
							<button type="button" onClick={handleCopyCode} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface">
								Copy code
							</button>
						)}
						<button
							type="button"
							onClick={isDraft ? handleDelete : handleUnpublish}
							disabled={committing}
							className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface disabled:opacity-60"
							style={{ color: confirmAction ? "rgb(248 113 113)" : "var(--color-text-secondary)" }}
						>
							{committing
								? "Working..."
								: confirmAction
									? `Confirm ${isDraft ? "delete" : "unpublish"}`
									: isDraft ? "Delete" : "Unpublish"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
