"use client";

import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { QuizCategory, QuizDifficulty, QuizVisibility } from "@/lib/types";
import { supabase } from "@/lib/supabase";

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
	onRefetch?: () => void | Promise<unknown>;
	onUnpublish?: (quizId: string) => Promise<void>;
	onDelete?: (quizId: string) => Promise<void>;
}

type ConfirmAction = "delete" | "unpublish";

interface ConfirmableAction {
	kind: ConfirmAction;
	operation: () => Promise<void>;
	successMessage: string | null;
	errorMessage: string | null;
}

export default function QuizRow({ quiz, onCopyLink, onRefetch, onUnpublish, onDelete }: QuizRowProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
	const [committing, setCommitting] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const confirmationArmedAt = useRef(0);
	const isDraft = quiz.status === "draft";
	const attempts = quiz.times_taken ?? 0;

	useEffect(() => {
		if (!menuOpen) return;
		const closeActions = () => {
			setMenuOpen(false);
			setConfirmAction(null);
			confirmationArmedAt.current = 0;
		};
		const closeMenu = (event: MouseEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) {
				closeActions();
			}
		};
		const closeMenuOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") closeActions();
		};
		document.addEventListener("mousedown", closeMenu);
		document.addEventListener("keydown", closeMenuOnEscape);
		return () => {
			document.removeEventListener("mousedown", closeMenu);
			document.removeEventListener("keydown", closeMenuOnEscape);
		};
	}, [menuOpen]);

	const handleCopyLink = async () => {
		if (onCopyLink) {
			onCopyLink(quiz.id);
		} else {
			try {
				await navigator.clipboard.writeText(`${window.location.origin}/quiz/${quiz.id}`);
				toast.success("Quiz link copied!");
			} catch {
				toast.error("Failed to copy link");
			}
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

	const runConfirmableAction = async ({
		kind,
		operation,
		successMessage,
		errorMessage,
	}: ConfirmableAction) => {
		if (confirmAction !== kind) {
			setConfirmAction(kind);
			confirmationArmedAt.current = Date.now();
			return;
		}
		if (Date.now() - confirmationArmedAt.current < 400) return;

		setCommitting(true);
		try {
			await operation();
			setMenuOpen(false);
			setConfirmAction(null);
			confirmationArmedAt.current = 0;
			if (successMessage) toast.success(successMessage);
			try {
				await onRefetch?.();
			} catch {}
		} catch {
			if (errorMessage) toast.error(errorMessage);
		} finally {
			setCommitting(false);
		}
	};

	const handleUnpublish = () => runConfirmableAction({
		kind: "unpublish",
		operation: async () => {
			if (onUnpublish) return onUnpublish(quiz.id);
			const { error } = await supabase
				.from("quizzes")
				.update({ status: "draft", code: null, visibility: "private" })
				.eq("id", quiz.id);
			if (error) throw error;
		},
		successMessage: onUnpublish ? null : "Quiz unpublished and moved to drafts",
		errorMessage: onUnpublish ? null : "Failed to unpublish",
	});

	const handleDelete = () => runConfirmableAction({
		kind: "delete",
		operation: async () => {
			if (onDelete) {
				return onDelete(quiz.id);
			}
			const { error } = await supabase.from("quizzes").delete().eq("id", quiz.id);
			if (error) throw error;
		},
		successMessage: onDelete ? null : "Draft deleted",
		errorMessage: onDelete ? null : "Failed to delete draft",
	});

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
						confirmationArmedAt.current = 0;
					}}
					className="rounded-lg p-2 transition hover:bg-surface-raised"
					style={{ color: "var(--color-text-secondary)" }}
					aria-label={`More actions for ${quiz.title || "untitled draft"}`}
					aria-expanded={menuOpen}
					aria-haspopup="menu"
				>
					<HugeiconsIcon icon={MoreVerticalIcon} size={18} />
				</button>
				{menuOpen && (
					<div
						className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border p-1 shadow-xl"
						style={{ backgroundColor: "var(--color-surface-raised)", borderColor: "var(--color-border)" }}
						role="menu"
					>
						{!isDraft && (
							<button type="button" role="menuitem" onClick={handleCopyLink} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface">
								Copy link
							</button>
						)}
						{!isDraft && quiz.code && (
							<button type="button" role="menuitem" onClick={handleCopyCode} className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface">
								Copy code
							</button>
						)}
						<button
							type="button"
							role="menuitem"
							onClick={isDraft ? handleDelete : handleUnpublish}
							disabled={committing}
							className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface disabled:opacity-60"
							style={{ color: confirmAction ? "var(--color-error)" : "var(--color-text-secondary)" }}
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
