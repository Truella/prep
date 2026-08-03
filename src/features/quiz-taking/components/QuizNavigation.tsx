interface QuizNavigationProps {
	currentIndex: number;
	totalQuestions: number;
	isAnswered: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onSubmit: () => void;
}

export default function QuizNavigation({
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
	onSubmit,
}: QuizNavigationProps) {
	const isFirstQuestion = currentIndex === 0;
	const isLastQuestion = currentIndex === totalQuestions - 1;

	return (
		<div className="flex gap-3">
			<button
				onClick={onPrevious}
				disabled={isFirstQuestion}
				className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
			>
				<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
					<path
						d="M19 12H5M5 12L12 19M5 12L12 5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				Previous
			</button>

			<div className="flex-1" />

			{isLastQuestion ? (
				<button
					onClick={onSubmit}
					className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
				>
					Submit Quiz
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
						<path
							d="M5 13L9 17L19 7"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			) : (
				<button
					onClick={onNext}
					className="px-8 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
				>
					Next
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
						<path
							d="M5 12H19M19 12L12 5M19 12L12 19"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			)}
		</div>
	);
}
