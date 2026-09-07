interface QuestionOverviewProps {
	totalQuestions: number;
	currentIndex: number;
	answeredQuestions: Record<number, number>;
	onSelectQuestion: (index: number) => void;
	onSubmit: () => void;
}

export default function QuestionOverview({
	totalQuestions,
	currentIndex,
	answeredQuestions,
	onSubmit,
	onSelectQuestion,
}: QuestionOverviewProps) {
	return (
		<div className="bg-surface border border-border rounded-2xl p-6">
			<h3 className="text-sm font-semibold text-text-secondary uppercase mb-4">
				Question Overview
			</h3>
			<div className="flex justify-center gap-4 mb-4 text-xs text-text-secondary">
				<span className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-sm border border-text-primary bg-surface-raised" />
					Answered
				</span>
				<span className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-sm border border-border" />
					Unanswered
				</span>
				<span className="flex items-center gap-1.5">
					<span className="w-2.5 h-2.5 rounded-sm bg-text-primary" />
					Current
				</span>
			</div>
			<div className="grid grid-cols-5 gap-2">
				{Array.from({ length: totalQuestions }).map((_, index) => {
					const isAnswered = answeredQuestions[index] !== undefined;
					const isCurrent = index === currentIndex;

					return (
						<button
							key={index}
							onClick={() => onSelectQuestion(index)}
							className={`aspect-square rounded-lg border font-semibold text-sm transition-all ${
								isCurrent
									? "bg-text-primary text-bg border-text-primary"
									: isAnswered
										? "border-text-primary text-text-primary hover:bg-surface-raised"
										: "border-border text-text-secondary hover:bg-surface-raised"
							}`}
						>
							{index + 1}
						</button>
					);
				})}
			</div>
			<button
				onClick={onSubmit}
				className="mt-6 px-8 py-3 rounded-xl bg-text-primary text-bg font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
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
		</div>
	);
}
