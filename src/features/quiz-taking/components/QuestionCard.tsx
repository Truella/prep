import { AppQuestion } from "@/lib/types";
interface QuestionCardProps {
	question: AppQuestion;
	selectedAnswer?: number;
	onSelectAnswer: (index: number) => void;
}

export default function QuestionCard({
	question,
	selectedAnswer,
	onSelectAnswer,
}: QuestionCardProps) {
	const options = [
		question.optionA,
		question.optionB,
		question.optionC,
		question.optionD,
	];
	return (

		<div className="bg-surface border border-border rounded-2xl p-8">
			{/* Question */}
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-text-primary mb-2">
					{question.questionText} 
				</h2>
				<p className="text-sm text-text-secondary">
					{question.points} point{question.points !== 1 ? "s" : ""}
				</p>
			</div>

			{/* Options */}
			<div className="space-y-3">
				{options.map((option, index) => {
					const isSelected = selectedAnswer === index;
					const letter = String.fromCharCode(65 + index); // A, B, C, D

					return (
						<button
							key={index}
							onClick={() => onSelectAnswer(index)}
							className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
								isSelected
									? "border-text-primary bg-surface-raised text-text-primary"
									: "border-border bg-surface text-text-secondary hover:border-text-secondary hover:bg-surface-raised"
							}`}
						>
							<div className="flex items-start gap-3">
								<span
									className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
										isSelected
											? "bg-text-primary text-bg"
											: "bg-surface-raised text-text-secondary"
									}`}
								>
									{letter}
								</span>
								<span className="flex-1 pt-1">{option}</span>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
