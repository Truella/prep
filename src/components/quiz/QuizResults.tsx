import { Link } from "react-router-dom";

interface QuizResultsProps {
	quizTitle: string;
	correctCount: number;
	totalQuestions: number;
	earnedPoints: number;
	totalPoints: number;
	onRetake: () => void;
}

export default function QuizResults({
	quizTitle,
	correctCount,
	totalQuestions,
	earnedPoints,
	totalPoints,
	onRetake,
}: QuizResultsProps) {
	const percentage = Math.round((earnedPoints / totalPoints) * 100);
	const passed = percentage >= 70;

	return (
		<div className="max-w-2xl mx-auto">
			<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
				{/* Icon */}
				<div
					className={`mx-auto w-20 h-20 rounded-2xl ${
						passed ? "bg-green-500/20" : "bg-yellow-500/20"
					} flex items-center justify-center mb-6`}
				>
					{passed ? (
						<svg
							className="w-10 h-10 text-green-400"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M20 6L9 17L4 12"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg
							className="w-10 h-10 text-yellow-400"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</div>

				{/* Title */}
				<h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
				<p className="text-gray-400 mb-8">{quizTitle}</p>

				{/* Score */}
				<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
					<div className="text-6xl font-bold text-white mb-2">
						{percentage}%
					</div>
					<div className="text-gray-400 space-y-1">
						<p>
							{correctCount} out of {totalQuestions} questions correct
						</p>
						<p>
							{earnedPoints} out of {totalPoints} points earned
						</p>
					</div>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<Link
						to="/"
						className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium text-center"
					>
						Back to Home
					</Link>
					<button
						onClick={onRetake}
						className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
					>
						Retake Quiz
					</button>
				</div>
			</div>
		</div>
	);
}
