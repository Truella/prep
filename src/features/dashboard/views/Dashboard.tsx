"use client";

import Link from "next/link";
import { useQuizzes } from "@/features/quiz-management/hooks/useQuizzes";
import { useAnalyticsStats } from "@/features/dashboard/hooks/useStats";
import QuizRow from "@/features/quiz-management/components/QuizRow";
import QuizRowSkeleton from "@/features/quiz-management/components/QuizRowSkeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	TaskEdit01Icon,
	FileEditIcon,
	CheckListIcon,
} from "@hugeicons/core-free-icons";

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
		<div className="space-y-10">			<div>
				<h2
					className="text-2xl font-bold mb-1"
					style={{ color: "var(--color-text-primary)" }}
				>
					Overview
				</h2>
				<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
					Manage your quizzes and track performance.
				</p>
			</div>				{drafts.length === 0 && published.length === 0 ? (
					<div
						className="col-span-3 rounded-2xl border border-dashed p-12 text-center"
						style={{
							borderColor: "var(--color-border)",
							backgroundColor: "var(--color-surface)",
						}}
					>
						<h3
							className="text-lg font-semibold mb-2"
							style={{ color: "var(--color-text-primary)" }}
						>
							Your quiz library is empty
						</h3>
						<p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
							Create your first quiz to start tracking attempts and performance.
						</p>							<Link
								href="/dashboard/create"
								className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold transition"
								style={{
									backgroundColor: "var(--color-accent)",
									color: "#fff",
								}}
							>
								Create your first quiz
							</Link>
					</div>
				) : (
					<div className="grid grid-cols-3 gap-4">
						{[
							{
								label: "Quizzes",
								value: stats.totalQuizzes,
								icon: TaskEdit01Icon,
								subtext: `${published.length} published, ${drafts.length} drafts`,
							},
							{
								label: "Drafts",
								value: drafts.length,
								icon: FileEditIcon,
								subtext: "awaiting review",
							},
							{
								label: "Attempts",
								value: stats.totalAttempts,
								icon: CheckListIcon,
								subtext: "across all quizzes",
							},
						].map((s) => (
							<div
								key={s.label}
								className="p-5 rounded-2xl border space-y-2"
								style={{
									backgroundColor: "var(--color-surface)",
									borderColor: "var(--color-border)",
								}}
							>
								<div className="flex items-center gap-2">
									<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
										{s.label}
									</p>
									<HugeiconsIcon icon={s.icon} size={14} style={{ color: "var(--color-text-secondary)" }} />
								</div>
								<p
									className="text-3xl font-bold font-mono"
									style={{ color: "var(--color-text-primary)" }}
								>
									{s.value}
								</p>
								<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
									{s.subtext}
								</p>
							</div>
						))}
					</div>
				)}

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

			<div>					<div className="flex items-center justify-between mb-4">
						<h3
							className="text-base font-semibold"
							style={{ color: "var(--color-text-primary)" }}
						>
							Recent quizzes
						</h3>
						{recentQuizzes.length > 0 && (
							<Link
								href="/dashboard/my-quizzes"
								className="text-xs font-medium"
								style={{ color: "var(--color-accent)" }}
							>
								View all →
							</Link>
						)}
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
