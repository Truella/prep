"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";
import QuizMetadataForm from "../components/create-quiz/QuizMetadataForm";
import CreateQuizTabs from "../components/create-quiz/CreateQuizTabs";
import PublishSettingsModal from "../components/quiz-bank/PublishSettingsModal";
import type { AppQuestion } from "../lib/types";
import type { PublishSettings } from "../hooks/useCreateQuiz";

type Tab = "build" | "csv";

export default function CreateQuizCSV() {
	const searchParams = useSearchParams();
	const resumeQuizId = searchParams.get("resume");
	const [tab, setTab] = useState<Tab>("build");
	const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
	const [pendingQuestions, setPendingQuestions] = useState<AppQuestion[] | undefined>();
	const {
		quiz,
		questions,
		shareableLink,
		quizCode,
		isCreatingQuiz,
		isUploadingQuestions,
		isLoadingDraft,
		setTitle,
		setDescription,
		timeLimit,
		setTimeLimit,
		createQuiz,
		setQuestionsFromCSV,
		saveAsDraft,
		publishQuiz,
	} = useCreateQuiz(resumeQuizId);

	const handleTabSwitch = (next: Tab) => {
		if (next === "csv") {
			try {
				localStorage.removeItem("quiz_builder_draft");
			} catch {}
		}
		setTab(next);
	};

	const handlePublishClick = (questionsOverride?: AppQuestion[]) => {
		setPendingQuestions(questionsOverride);
		setIsPublishModalOpen(true);
	};

	const handlePublishConfirm = async (settings: PublishSettings) => {
		const published = await publishQuiz(pendingQuestions, settings);
		if (published) {
			setIsPublishModalOpen(false);
			setPendingQuestions(undefined);
		}
	};

	const statCardStyle = {
		backgroundColor: "var(--color-surface)",
		borderColor: "var(--color-border)",
	};

	if (isLoadingDraft) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
				<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading draft...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			<div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="backdrop-blur-sm border rounded-xl p-4 text-center" style={statCardStyle}>
						<p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Quiz Status</p>
						<p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
							{quiz.status === "published" ? "Published" : quiz.id ? "Draft" : "Not Created"}
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

					{quiz.id && quiz.status !== "published" && (
						<>
							<CreateQuizTabs activeTab={tab} onTabSwitch={handleTabSwitch} />

							{tab === "build" && (
								<QuizBuilder
									quizId={quiz.id}
									initialQuestions={questions}
									onSaveAsDraft={saveAsDraft}
									onPublish={handlePublishClick}
									isUploading={isUploadingQuestions}
								/>
							)}

							{tab === "csv" && (
								<div className="space-y-4">
									<UploadQuestionsForm
										onFileChange={setQuestionsFromCSV}
										disabled={!quiz.id || isUploadingQuestions}
									/>

									{questions.length > 0 && (
										<div className="space-y-3">
											<div className="flex items-center justify-between gap-4">
												<p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
													Preview: {questions.length} question{questions.length !== 1 ? "s" : ""} parsed
												</p>
												<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Review before saving</p>
											</div>

											<div className="max-h-96 overflow-y-auto space-y-2 rounded-xl border p-3" style={{ borderColor: "var(--color-border)" }}>
												{questions.map((question, index) => {
													const optionLabels = ["A", "B", "C", "D"] as const;
													const options = [question.optionA, question.optionB, question.optionC, question.optionD];
													return (
														<div key={question.id} className="p-3 rounded-lg space-y-2" style={{ backgroundColor: "var(--color-surface-raised)" }}>
															<p className="text-xs font-mono" style={{ color: "var(--color-accent)" }}>
																Q{index + 1} - {question.points}pt{question.points !== 1 ? "s" : ""}
															</p>
															<p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text-primary)" }}>{question.questionText}</p>
															<div className="grid grid-cols-2 gap-1.5">
																{options.map((option, optionIndex) => (
																	<div
																		key={optionLabels[optionIndex]}
																		className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
																		style={{
																			backgroundColor: optionIndex === question.correctIndex ? "var(--color-accent-dim)" : "transparent",
																			border: `1px solid ${optionIndex === question.correctIndex ? "var(--color-accent)" : "var(--color-border)"}`,
																			color: optionIndex === question.correctIndex ? "var(--color-accent)" : "var(--color-text-secondary)",
																		}}
																	>
																		<span className="font-mono font-bold shrink-0">{optionLabels[optionIndex]}</span>
																		<span className="min-w-0 flex-1 truncate">{option}</span>
																		{optionIndex === question.correctIndex && <span className="shrink-0 font-semibold">Correct</span>}
																	</div>
																))}
															</div>
														</div>
													);
												})}
											</div>

											<div className="flex gap-3 pt-2">
												<button
													type="button"
													onClick={() => void saveAsDraft()}
													disabled={isUploadingQuestions}
													className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition disabled:opacity-50"
													style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
												>
													{isUploadingQuestions ? "Saving..." : "Save as Draft"}
												</button>
												<button
													type="button"
													onClick={() => handlePublishClick()}
													disabled={isUploadingQuestions}
													className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50"
													style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
												>
													Publish
												</button>
											</div>
										</div>
									)}
								</div>
							)}
						</>
					)}

					{shareableLink && quizCode && (
						<ShareableLink shareableLink={shareableLink} quizCode={quizCode} />
					)}
				</div>
			</div>

			<PublishSettingsModal
				isOpen={isPublishModalOpen}
				onClose={() => {
					if (!isUploadingQuestions) setIsPublishModalOpen(false);
				}}
				onConfirm={(settings) => void handlePublishConfirm(settings)}
				isLoading={isUploadingQuestions}
			/>
		</div>
	);
}
