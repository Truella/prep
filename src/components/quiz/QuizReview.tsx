import { QuizQuestion } from "../../lib/types";
import { letterToIndex } from "../../utils/helpers";


interface QuizReviewProps {
	questions: QuizQuestion[];
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
					className="flex items-center gap-2 text-gray-400 hover:text-white transition"
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
				<h2 className="text-2xl font-bold text-white">Answer Review</h2>
			</div>

			{/* Questions Review */}
			{questions.map((question, index) => {
				const userAnswer = userAnswers[index];
				const isCorrect = userAnswer === letterToIndex(question.Correct_Answer);
				const options = [
					question.Option_A,
					question.Option_B,
					question.Option_C,
					question.Option_D,
				];

				return (
					<div
						key={index}
						className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
					>
						{/* Question Header */}
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-sm font-semibold text-gray-400">
										Question {index + 1}
									</span>
									<span className="text-xs text-gray-500">
										({question.Points} pts)
									</span>
								</div>
								<h3 className="text-lg font-semibold text-white">
									{question.Question}
								</h3>
							</div>
							<div
								className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
									isCorrect ? "bg-green-500/20" : "bg-red-500/20"
								}`}
							>
								{isCorrect ? (
									<svg
										className="w-5 h-5 text-green-400"
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
										className="w-5 h-5 text-red-400"
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
								const isCorrectAnswer = letterToIndex(question.Correct_Answer) === optionIndex;
								const letter = String.fromCharCode(65 + optionIndex);

								let bgColor = "bg-white/5";
								let borderColor = "border-white/10";
								let textColor = "text-gray-400";

								if (isCorrectAnswer) {
									bgColor = "bg-green-500/10";
									borderColor = "border-green-500/30";
									textColor = "text-green-400";
								}

								if (isUserAnswer && !isCorrect) {
									bgColor = "bg-red-500/10";
									borderColor = "border-red-500/30";
									textColor = "text-red-400";
								}

								return (
									<div
										key={optionIndex}
										className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor} ${borderColor}`}
									>
										<span
											className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-semibold text-sm ${
												isCorrectAnswer
													? "bg-green-500/20 text-green-400"
													: isUserAnswer
														? "bg-red-500/20 text-red-400"
														: "bg-white/10 text-gray-500"
											}`}
										>
											{letter}
										</span>
										<div className="flex-1">
											<p className={textColor}>{option}</p>
											{isUserAnswer && !isCorrect && (
												<p className="text-xs text-red-400 mt-1">Your answer</p>
											)}
											{isCorrectAnswer && (
												<p className="text-xs text-green-400 mt-1">
													Correct answer
												</p>
											)}
										</div>
										{isCorrectAnswer && (
											<svg
												className="w-5 h-5 text-green-400 shrink-0"
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
