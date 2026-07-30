"use client";

import Link from "next/link";
import { useQuizzes } from "../hooks/useQuizzes";
import { useAnalyticsStats } from "../hooks/useStats";
import QuizRow from "../components/QuizRow";
import QuizRowSkeleton from "../components/skeletons/QuizRowSkeleton";

export default function Dashboard() {
	const {
		drafts,
		published,
		loading,
		copyQuizLink,
		deleteQuiz,
		unpublishQuiz,
		refetch,
	} = useQuizzes();
	const { stats } = useAnalyticsStats();

	const recentDrafts = drafts.slice(0, 2);
	const recentQuizzes = published.slice(0, 3);

	return (
		<div className="space-y-10">
			<div className="flex items-start justify-between">
				<div>
					<h2
						className="text-2xl font-bold mb-1"
						style={{ color: "var(--color-text-primary)" }}
					>
						Overview
					</h2>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						Manage your quizzes and track performance.
					</p>
				</div>
				<Link
					href="/dashboard/create"
					className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
					style={{
						backgroundColor: "var(--color-text-primary)",
						color: "var(--color-bg)",
					}}
				>
					+ New Quiz
				</Link>
			</div>

			<div className="grid grid-cols-3 gap-4">
				{[
					{ label: "Quizzes", value: stats.totalQuizzes },
					{ label: "Drafts", value: drafts.length },
					{ label: "Attempts", value: stats.totalAttempts },
				].map((s) => (
					<div
						key={s.label}
						className="p-5 rounded-2xl border space-y-1"
						style={{
							backgroundColor: "var(--color-surface)",
							borderColor: "var(--color-border)",
						}}
					>
						<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
							{s.label}
						</p>
						<p
							className="text-3xl font-bold font-mono"
							style={{ color: "var(--color-text-primary)" }}
						>
							{s.value}
						</p>
					</div>
				))}
			</div>

			{!loading && recentDrafts.length > 0 && (
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
							Continue where you left off
						</h3>
						<Link
							href="/dashboard/my-quizzes"
							className="text-xs font-medium"
							style={{ color: "var(--color-accent)" }}
						>
							View all →
						</Link>
					</div>
					<div className="space-y-2">
						{recentDrafts.map((quiz) => (
							<QuizRow
								key={quiz.id}
								quiz={quiz}
								onDelete={deleteQuiz}
								onRefetch={refetch}
							/>
						))}
					</div>
				</section>
			)}

			<div>
				<div className="flex items-center justify-between mb-4">
					<h3
						className="text-base font-semibold"
						style={{ color: "var(--color-text-primary)" }}
					>
						Recent quizzes
					</h3>
					<Link
						href="/dashboard/my-quizzes"
						className="text-xs font-medium"
						style={{ color: "var(--color-accent)" }}
					>
						View all →
					</Link>
				</div>

				{loading && (
					<div className="space-y-2">
						{[1, 2, 3].map((i) => (
							<QuizRowSkeleton key={i} />
						))}
					</div>
				)}

				{!loading && recentQuizzes.length === 0 && (
					<div
						className="rounded-2xl border border-dashed p-10 text-center"
						style={{ borderColor: "var(--color-border)" }}
					>
						<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
							No published quizzes yet.{" "}
							<Link
								href="/dashboard/create"
								style={{ color: "var(--color-accent)" }}
							>
								Create your first one.
							</Link>
						</p>
					</div>
				)}

				{!loading && recentQuizzes.length > 0 && (
					<div className="space-y-2">
						{recentQuizzes.map((quiz) => (
							<QuizRow
								key={quiz.id}
								quiz={quiz}
								onCopyLink={copyQuizLink}
								onUnpublish={unpublishQuiz}
								onRefetch={refetch}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
