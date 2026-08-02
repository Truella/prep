"use client";

import Link from "next/link";
import { useQuizzes } from "../hooks/useQuizzes";
import QuizRow from "../components/QuizRow";
import QuizListLoading from "../components/QuizListLoading";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default function Quizzes() {
	const { drafts, published, loading, copyQuizLink, deleteQuiz, unpublishQuiz, refetch } = useQuizzes();

	return (
		<div className="space-y-10">
			<div className="flex justify-between items-center">
				<div>
					<h2 className="text-3xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>My Quizzes</h2>
					<p style={{ color: "var(--color-text-secondary)" }}>Manage and share your quizzes</p>
				</div>
				<Link
					href="/dashboard/create"
					className="flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold"
					style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
				>
					<HugeiconsIcon icon={PlusSignIcon}/>
					Create New Quiz
				</Link>
			</div>

			{loading ? (
				<QuizListLoading />
			) : (
				<>
					{drafts.length > 0 && (
						<div>
							<h3
								className="text-sm font-semibold uppercase tracking-wider mb-4"
								style={{ color: "var(--color-text-secondary)" }}
							>
								Drafts ({drafts.length})
							</h3>
							<div className="space-y-2">
								{drafts.map((quiz) => (
									<QuizRow key={quiz.id} quiz={quiz} onRefetch={refetch} onDelete={deleteQuiz} />
								))}
							</div>
						</div>
					)}

					<div>
						<h3
							className="text-sm font-semibold uppercase tracking-wider mb-4"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Published ({published.length})
						</h3>
						{published.length === 0 ? (
							<div
								className="rounded-2xl border border-dashed p-10 text-center"
								style={{ borderColor: "var(--color-border)" }}
							>
								<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
									No published quizzes yet.{" "}
									<Link href="/dashboard/create" style={{ color: "var(--color-accent)" }}>
										Create one.
									</Link>
								</p>
							</div>
						) : (
							<div className="space-y-2">
								{published.map((quiz) => (
									<QuizRow key={quiz.id} quiz={quiz} onCopyLink={copyQuizLink} onRefetch={refetch} onUnpublish={unpublishQuiz} />
								))}
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
