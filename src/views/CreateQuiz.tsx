"use client";

import { useState } from "react";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";
import PublishModal from "../components/quiz-bank/PublishModal";
import QuizMetadataForm from "../components/create-quiz/QuizMetadataForm";
import CreateQuizTabs from "../components/create-quiz/CreateQuizTabs";

type Tab = "build" | "csv";

export default function CreateQuizCSV() {
	const [tab, setTab] = useState<Tab>("build");
	const [isPublishOpen, setIsPublishOpen] = useState(false);
	const {
		quiz,
		questions,
		shareableLink,
		isCreatingQuiz,
		isUploadingQuestions,
		setTitle,
		setDescription,
		timeLimit,
		setTimeLimit,
		createQuiz,
		setQuestionsFromCSV,
		uploadQuestions,
		updateQuizMeta,
	} = useCreateQuiz();

	const statCardStyle = {
		backgroundColor: "var(--color-surface)",
		borderColor: "var(--color-border)",
	};

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			<div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="backdrop-blur-sm border rounded-xl p-4 text-center" style={statCardStyle}>
						<p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Quiz Status</p>
						<p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
							{quiz.id ? "Draft Created" : "Not Created"}
						</p>
					</div>
					<div className="backdrop-blur-sm border rounded-xl p-4 text-center" style={statCardStyle}>
						<p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Total Questions</p>
						<p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{questions.length}</p>
					</div>
				</div>

				<div
					className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl space-y-6"
					style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
				>
					<QuizMetadataForm
						title={quiz.title}
						description={quiz.description}
						timeLimit={timeLimit}
						quizId={quiz.id}
						isCreatingQuiz={isCreatingQuiz}
						setTitle={setTitle}
						setDescription={setDescription}
						setTimeLimit={setTimeLimit}
						createQuiz={createQuiz}
					/>

					{quiz.id && (
						<>
							<CreateQuizTabs activeTab={tab} onTabSwitch={setTab} />

							{tab === "build" && (
								<QuizBuilder
									quizId={quiz.id}
									onSubmit={uploadQuestions}
									isUploading={isUploadingQuestions}
								/>
							)}

						{tab === "csv" && (
							<div className="space-y-4">
								<UploadQuestionsForm
									onFileChange={setQuestionsFromCSV}
									onSubmit={() => uploadQuestions()}
									disabled={!quiz.id}
									isUploading={isUploadingQuestions}
									questionCount={questions.length}
								/>

								{/* CSV preview — shown after successful parse */}
								{questions.length > 0 && (
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<p
												className="text-sm font-medium"
												style={{ color: "var(--color-text-primary)" }}
											>
												Preview — {questions.length} question
												{questions.length !== 1 ? "s" : ""} parsed
											</p>
											<p
												className="text-xs"
												style={{ color: "var(--color-text-secondary)" }}
											>
												Review before publishing
											</p>
										</div>

										<div
											className="max-h-96 overflow-y-auto space-y-2 rounded-xl border p-3"
											style={{ borderColor: "var(--color-border)" }}
										>
											{questions.map((q, i) => {
												const optionLabels = ["A", "B", "C", "D"] as const;
												const options = [
													q.optionA,
													q.optionB,
													q.optionC,
													q.optionD,
												];
												return (
													<div
														key={q.id}
														className="p-3 rounded-lg space-y-2"
														style={{
															backgroundColor: "var(--color-surface-raised)",
														}}
													>
														<p
															className="text-xs font-mono"
															style={{ color: "var(--color-accent)" }}
														>
															Q{i + 1} · {q.points}pt{q.points !== 1 ? "s" : ""}
														</p>
														<p
															className="text-sm font-medium leading-snug"
															style={{ color: "var(--color-text-primary)" }}
														>
															{q.questionText}
														</p>
														<div className="grid grid-cols-2 gap-1.5">
															{options.map((opt, j) => (
																<div
																	key={j}
																	className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
																	style={{
																		backgroundColor:
																			j === q.correctIndex
																				? "var(--color-accent-dim)"
																				: "transparent",
																		border: `1px solid ${
																			j === q.correctIndex
																				? "var(--color-accent)"
																				: "var(--color-border)"
																		}`,
																		color:
																			j === q.correctIndex
																				? "var(--color-accent)"
																				: "var(--color-text-secondary)",
																	}}
																>
																	<span className="font-mono font-bold shrink-0">
																		{optionLabels[j]}
																	</span>
																	<span className="truncate">{opt}</span>
																</div>
															))}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								)}
							</div>
						)}
						</>
					)}

					{quiz.id && (
						<div className="pt-2">
							<button
								onClick={() => setIsPublishOpen(true)}
								className="w-full px-4 py-3 rounded-xl border transition font-medium text-sm"
								style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
							>
								Publish Settings
							</button>
						</div>
					)}

					{shareableLink && <ShareableLink shareableLink={shareableLink} />}
				</div>
			</div>

			<PublishModal
				quizId={quiz.id ?? ""}
				currentVisibility={quiz.visibility ?? "private"}
				currentCategory={quiz.category}
				currentDifficulty={quiz.difficulty}
				isOpen={isPublishOpen}
				onClose={() => setIsPublishOpen(false)}
				onSuccess={(updates) => updateQuizMeta(updates)}
			/>
		</div>
	);
}
