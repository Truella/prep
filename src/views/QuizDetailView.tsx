"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizDetail } from "../hooks/useQuizDetail";
import MetaEditor from "../components/quiz-detail/MetaEditor";
import QuestionEditor from "../components/quiz-detail/QuestionEditor";
import AttemptStats from "../components/quiz-detail/AttemptStats";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

type Tab = "questions" | "settings" | "stats";

export default function QuizDetailView({ quizId }: { quizId: string }) {
	const router = useRouter();
	const [tab, setTab] = useState<Tab>("questions");
	const [confirmDelete, setConfirmDelete] = useState(false);

	const {
		quiz,
		questions,
		attempts,
		loading,
		error,
		saving,
		updateQuizMeta,
		updateQuestion,
		deleteQuestion,
		deleteQuiz,
		copyLink,
	} = useQuizDetail(quizId);

	const handleDeleteQuiz = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		const ok = await deleteQuiz();
		if (ok) router.push("/dashboard/my-quizzes");
	};

	if (loading) {
		return (
			<div
				className="min-h-64 flex items-center justify-center text-sm"
				style={{ color: "var(--color-text-secondary)" }}
			>
				Loading...
			</div>
		);
	}

	if (error || !quiz) {
		return (
			<div className="text-center py-16 space-y-3">
				<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
					{error ?? "Quiz not found"}
				</p>
				<Link
					href="/dashboard/my-quizzes"
					className="text-sm"
					style={{ color: "var(--color-accent)" }}
				>
					← Back to My Quizzes
				</Link>
			</div>
		);
	}

	const TABS: { id: Tab; label: string }[] = [
		{ id: "questions", label: `Questions (${questions.length})` },
		{ id: "settings", label: "Settings" },
		{ id: "stats", label: `Stats (${attempts.length})` },
	];

	return (
		<div className="space-y-6 max-w-3xl">
			{/* Back + header */}
			<div className="flex items-start gap-4">
				<Link
					href="/dashboard/my-quizzes"
					className="mt-1 p-1.5 rounded-lg border transition"
					style={{
						borderColor: "var(--color-border)",
						color: "var(--color-text-secondary)",
					}}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
				</Link>
				<div className="flex-1 min-w-0">
					<h2
						className="text-2xl font-bold leading-tight truncate"
						style={{ color: "var(--color-text-primary)" }}
					>
						{quiz.title}
					</h2>
					<p
						className="text-sm mt-0.5"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{quiz.visibility} · Created{" "}
						{new Date(quiz.created_at).toLocaleDateString("en-CA")}
					</p>
				</div>
				<div className="flex gap-2 shrink-0">
				<button
					type="button"
					onClick={copyLink}
					className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition"
					style={{
						borderColor: "var(--color-border)",
						color: "var(--color-text-secondary)",
					}}
				>
						<HugeiconsIcon icon={Copy01Icon} size={14} />
						Copy link
					</button>
					<Link
						href={`/quiz/${quizId}`}
						target="_blank"
						className="px-3 py-2 rounded-lg text-xs font-semibold transition"
						style={{
							backgroundColor: "var(--color-text-primary)",
							color: "var(--color-bg)",
						}}
					>
						Preview →
					</Link>
				</div>
			</div>

			{/* Tabs */}
			<div
				className="flex gap-1 border-b"
				style={{ borderColor: "var(--color-border)" }}
			>
			{TABS.map((t) => (
				<button
					type="button"
					key={t.id}
					onClick={() => setTab(t.id)}
						className="px-4 py-2 text-sm font-medium transition border-b-2 -mb-px"
						style={{
							borderColor: tab === t.id ? "var(--color-accent)" : "transparent",
							color:
								tab === t.id
									? "var(--color-text-primary)"
									: "var(--color-text-secondary)",
						}}
					>
						{t.label}
					</button>
				))}
			</div>

			{/* Tab content */}
			{tab === "questions" && (
				<div className="space-y-3">
					{questions.length === 0 && (
						<p
							className="text-sm"
							style={{ color: "var(--color-text-secondary)" }}
						>
							No questions yet. Add them from the create page.
						</p>
					)}
					{questions.map((q, i) => (
						<QuestionEditor
							key={q.id}
							question={q}
							index={i}
							onSave={updateQuestion}
							onDelete={deleteQuestion}
						/>
					))}
				</div>
			)}

			{tab === "settings" && (
				<div className="space-y-8">
					<MetaEditor
						title={quiz.title}
						description={quiz.description ?? ""}
						timeLimit={quiz.time_limit ?? null}
						visibility={quiz.visibility}
						category={quiz.category}
						difficulty={quiz.difficulty}
						saving={saving}
						onSave={updateQuizMeta}
					/>

					{/* Danger zone */}
					<div
						className="p-5 rounded-xl border space-y-3"
						style={{
							borderColor: "rgb(239 68 68 / 0.3)",
							backgroundColor: "rgb(239 68 68 / 0.05)",
						}}
					>
						<p className="text-sm font-semibold text-red-500">Danger zone</p>
						<p
							className="text-xs"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Deleting this quiz is permanent. All questions and attempt data
							will be removed.
						</p>
						<button
							type="button"
							onClick={handleDeleteQuiz}
							className="px-4 py-2 rounded-lg text-xs font-semibold transition"
							style={{
								backgroundColor: confirmDelete
									? "rgb(239 68 68)"
									: "rgb(239 68 68 / 0.15)",
								color: confirmDelete ? "#fff" : "rgb(248 113 113)",
							}}
						>
							{confirmDelete ? "Yes, delete forever" : "Delete quiz"}
						</button>
						{confirmDelete && (
							<button
								type="button"
								onClick={() => setConfirmDelete(false)}
								className="ml-2 text-xs"
								style={{ color: "var(--color-text-secondary)" }}
							>
								Cancel
							</button>
						)}
					</div>
				</div>
			)}

			{tab === "stats" && <AttemptStats attempts={attempts} />}
		</div>
	);
}
