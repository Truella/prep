interface QuestionOverviewProps {
	totalQuestions: number;
	currentIndex: number;
	answeredQuestions: Record<number, number>;
	onSelectQuestion: (index: number) => void;
}

export default function QuestionOverview({
	totalQuestions,
	currentIndex,
	answeredQuestions,
	onSelectQuestion,
}: QuestionOverviewProps) {
	return (
		<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
			<h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
				Question Overview
			</h3>
			<div className="grid grid-cols-5 gap-2">
				{Array.from({ length: totalQuestions }).map((_, index) => {
					const isAnswered = answeredQuestions[index] !== undefined;
					const isCurrent = index === currentIndex;

					return (
						<button
							key={index}
							onClick={() => onSelectQuestion(index)}
							className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
								isCurrent
									? "bg-white text-black"
									: isAnswered
										? "bg-white/20 text-white hover:bg-white/30"
										: "bg-white/5 text-gray-500 hover:bg-white/10"
							}`}
						>
							{index + 1}
						</button>
					);
				})}
			</div>
		</div>
	);
}
