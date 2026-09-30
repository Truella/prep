"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuizzes } from "@/features/quiz-management/hooks/useQuizzes";
import QuizRow from "@/features/quiz-management/components/QuizRow";
import QuizListLoading from "@/features/quiz-management/components/QuizListLoading";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon, FileSearchIcon, TaskAdd01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

type StatusFilter = "all" | "draft" | "published";

export default function Quizzes() {
	const { drafts, published, quizzes, loading, copyQuizLink, deleteQuiz, unpublishQuiz, refetch } = useQuizzes();
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return quizzes.filter((quiz) => {
			if (statusFilter !== "all" && quiz.status !== statusFilter) return false;
			if (q && !quiz.title.toLowerCase().includes(q) && !quiz.description.toLowerCase().includes(q)) return false;
			return true;
		});
	}, [quizzes, statusFilter, query]);

	const filters: { id: StatusFilter; label: string; count: number }[] = [
		{ id: "all", label: "All", count: quizzes.length },
		{ id: "draft", label: "Drafts", count: drafts.length },
		{ id: "published", label: "Published", count: published.length },
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center gap-4">
				<div>
					<h2 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>My Quizzes</h2>
					<p style={{ color: "var(--color-text-secondary)" }}>Manage and share your quizzes</p>
				</div>
				<Link
					href="/dashboard/create"
					className="hidden sm:flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold shrink-0"
					style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
				>
					<HugeiconsIcon icon={PlusSignIcon} size={18} />
					Create New Quiz
				</Link>
			</div>

			{/* Controls — single table filters */}
			<div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
				<div className="flex gap-2 flex-wrap">
					{filters.map((f) => {
						const active = statusFilter === f.id;
						return (
							<button
								key={f.id}
								type="button"
								onClick={() => setStatusFilter(f.id)}
								className="px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer"
								style={{
									backgroundColor: active ? "var(--color-accent)" : "var(--color-surface)",
									color: active ? "#0A0A0F" : "var(--color-text-secondary)",
									borderColor: active ? "var(--color-accent)" : "var(--color-border)",
								}}
							>
								{f.label} <span className="opacity-70">({f.count})</span>
							</button>
						);
					})}
				</div>

				<div className="relative w-full sm:w-64 shrink-0">
					<HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-secondary)" } as React.CSSProperties} />
					<input
						type="text"
						placeholder="Search quizzes..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition"
						style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
					/>
				</div>
			</div>

			{/* Single table */}
			{loading ? (
				<QuizListLoading />
			) : filtered.length === 0 ? (
				quizzes.length === 0 ? (
					<div
						className="rounded-2xl border border-dashed p-10 sm:p-12 text-center space-y-4"
						style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
					>
						<div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-accent-dim)", color: "var(--color-accent)" }}>
							<HugeiconsIcon icon={TaskAdd01Icon} size={24} />
						</div>
						<div className="space-y-1.5">
							<h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>No quizzes yet</h3>
							<p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
								Get started by creating your first quiz. Add questions manually or import via CSV, then publish to share.
							</p>
						</div>
						<div className="flex justify-center pt-2">
							<Link
								href="/dashboard/create"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition"
								style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
							>
								<HugeiconsIcon icon={PlusSignIcon} size={18} />
								Create your first quiz
							</Link>
						</div>
					</div>
				) : (
					<div
						className="rounded-2xl border border-dashed p-8 sm:p-10 text-center space-y-4"
						style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
					>
						<div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
							<HugeiconsIcon icon={FileSearchIcon} size={22} />
						</div>
						<div className="space-y-1.5">
							<h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
								No results for {statusFilter !== "all" ? statusFilter : "current"} filter
							</h3>
							<p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
								{query ? (
									<>No quizzes match <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>&ldquo;{query}&rdquo;</span> {statusFilter !== "all" ? `in ${statusFilter}s` : ""}.</>
								) : (
									<>There are no {statusFilter} quizzes to show.</>
								)}
							</p>
						</div>
						<div className="flex flex-wrap gap-3 justify-center pt-1">
							<button
								type="button"
								onClick={() => { setStatusFilter("all"); setQuery(""); }}
								className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border text-sm font-medium transition cursor-pointer"
								style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface-raised)" }}
							>
								<HugeiconsIcon icon={Cancel01Icon} size={16} />
								Clear filters
							</button>
							<Link
								href="/dashboard/create"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
								style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
							>
								<HugeiconsIcon icon={PlusSignIcon} size={16} />
								Create quiz
							</Link>
						</div>
					</div>
				)
			) : (
				<div className="space-y-2">
					<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
						Showing {filtered.length} of {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
					</p>
					{filtered.map((quiz) => (
						<QuizRow
							key={quiz.id}
							quiz={quiz}
							onRefetch={refetch}
							onCopyLink={quiz.status === "published" ? copyQuizLink : undefined}
							onUnpublish={quiz.status === "published" ? unpublishQuiz : undefined}
							onDelete={quiz.status === "draft" ? deleteQuiz : undefined}
						/>
					))}
				</div>
			)}

			<Link
				href="/dashboard/create"
				className="sm:hidden flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
				style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
			>
				<HugeiconsIcon icon={PlusSignIcon} size={18} />
				Create New Quiz
			</Link>
		</div>
	);
}
