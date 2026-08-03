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

		<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8">
			{/* Question */}
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-white mb-2">
					{question.questionText} 
				</h2>
				<p className="text-sm text-gray-400">
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
									? "border-white bg-white/10 text-white"
									: "border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10"
							}`}
						>
							<div className="flex items-start gap-3">
								<span
									className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
										isSelected
											? "bg-white text-black"
											: "bg-white/10 text-gray-400"
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
