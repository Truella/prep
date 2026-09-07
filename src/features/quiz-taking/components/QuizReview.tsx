import { AppQuestion } from "@/lib/types";

interface QuizReviewProps {
	questions: AppQuestion[];
	userAnswers: Record<number, number>;
	onBack: () => void;
}

export default function QuizReview({
	questions,
	userAnswers,
	onBack,
}: QuizReviewProps) {
	return (
		<div className="max-w-3xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<button
					onClick={onBack}
					className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition"
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
					Back to Results
				</button>
				<h2 className="text-2xl font-bold text-text-primary">Answer Review</h2>
			</div>

			{/* Questions Review */}
			{questions.map((question, index) => {
				const userAnswer = userAnswers[index];
				const isCorrect = userAnswer === question.correctIndex;
				const options = [
					question.optionA,
					question.optionB,
					question.optionC,
					question.optionD,
				];

				return (
					<div
						key={index}
					className="bg-surface border border-border rounded-2xl p-6"
				>
					{/* Question Header */}
					<div className="flex items-start justify-between mb-4">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<span className="text-sm font-semibold text-text-secondary">
									Question {index + 1}
								</span>
							<span className="text-xs text-text-secondary">
								({question.points} pts)
							</span>
							</div>
							<h3 className="text-lg font-semibold text-text-primary">
									{question.questionText}
								</h3>
							</div>
							<div
							className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
								isCorrect ? "bg-correct/15" : "bg-incorrect/15"
							}`}
						>
							{isCorrect ? (
								<svg
									className="w-5 h-5 text-correct"
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
									className="w-5 h-5 text-incorrect"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M6 18L18 6M6 6L18 18"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
							</div>
						</div>

						{/* Options */}
						<div className="space-y-2">
							{options.map((option, optionIndex) => {
								const isUserAnswer = userAnswer === optionIndex;
								const isCorrectAnswer = question.correctIndex === optionIndex;
								const letter = String.fromCharCode(65 + optionIndex);

							let bgColor = "bg-surface-raised";
							let borderColor = "border-border";
							let textColor = "text-text-secondary";

							if (isCorrectAnswer) {
								bgColor = "bg-correct/10";
								borderColor = "border-correct/40";
								textColor = "text-correct";
							}

							if (isUserAnswer && !isCorrect) {
								bgColor = "bg-incorrect/10";
								borderColor = "border-incorrect/40";
								textColor = "text-incorrect";
							}

								return (
									<div
										key={optionIndex}
										className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor} ${borderColor}`}
									>
										<span
									className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm ${
											isCorrectAnswer
												? "bg-correct/15 text-correct"
												: isUserAnswer
													? "bg-incorrect/15 text-incorrect"
													: "bg-surface-raised text-text-secondary"
										}`}
										>
											{letter}
										</span>
										<div className="flex-1">
											<p className={textColor}>{option}</p>
										{isUserAnswer && !isCorrect && (
											<p className="text-xs text-incorrect mt-1">Your answer</p>
										)}
										{isCorrectAnswer && (
											<p className="text-xs text-correct mt-1">
												Correct answer
											</p>
										)}
										</div>
										{isCorrectAnswer && (
									<svg
											className="w-5 h-5 text-correct shrink-0"
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
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})}
		</div>
	);
}
