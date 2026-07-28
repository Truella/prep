import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, TaskEdit01Icon } from "@hugeicons/core-free-icons";
export default function QuizListEmpty() {
	return (
		<div className="text-center py-16 backdrop-blur-xl border rounded-2xl"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
			<div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
				style={{ backgroundColor: "var(--color-surface-raised)" }}>
				<HugeiconsIcon icon={TaskEdit01Icon} style={{ color: "var(--color-text-primary)" }} />
			</div>
			<h3 className="text-xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>No Quizzes Yet</h3>
			<p className="mb-6 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
				You haven&apos;t created any quizzes yet. Create your first quiz to get
				started.
			</p>
			<Link
				href="/dashboard/create"
				className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold"
				style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
			>
				<HugeiconsIcon icon={PlusSignIcon} />
				Create Your First Quiz
			</Link>
		</div>
	);
}
