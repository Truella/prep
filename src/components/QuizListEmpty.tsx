import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, TaskEdit01Icon } from "@hugeicons/core-free-icons";
export default function QuizListEmpty() {
	return (
		<div className="text-center py-16 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
			<div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
				<HugeiconsIcon icon={TaskEdit01Icon} color="white" />
			</div>
			<h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
			<p className="text-gray-400 mb-6 max-w-md mx-auto">
				You haven&apos;t created any quizzes yet. Create your first quiz to get
				started.
			</p>
			<Link
				href="/dashboard/create"
				className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition font-semibold"
			>
				<HugeiconsIcon icon={PlusSignIcon} />
				Create Your First Quiz
			</Link>
		</div>
	);
}
