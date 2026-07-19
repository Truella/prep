import Link from "next/link";
import { useQuizzes } from "../hooks/useQuizzes";
import QuizCard from "../components/QuizCard";
import QuizListEmpty from "../components/QuizListEmpty";
import QuizListLoading from "../components/QuizListLoading";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

export default function Quizzes() {
	const { quizzes, loading, copyQuizLink } = useQuizzes();

	return (
		<div>
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h2 className="text-3xl font-bold text-white mb-1">My Quizzes</h2>
					<p className="text-gray-400">Manage and share your quizzes</p>
				</div>
				<Link
					href="/dashboard/create"
					className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition font-semibold"
				>
					<HugeiconsIcon icon={PlusSignIcon}/>
					Create New Quiz
				</Link>
			</div>

			{/* Content */}
			{loading ? (
				<QuizListLoading />
			) : quizzes.length === 0 ? (
				<QuizListEmpty />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{quizzes.map((quiz) => (
						<QuizCard key={quiz.id} quiz={quiz} onCopyLink={copyQuizLink} />
					))}
				</div>
			)}
		</div>
	);
}
