"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateQuiz } from "@/features/quiz-management/hooks/useCreateQuiz";
import QuizBuilder from "@/features/quiz-management/components/builder/QuizBuilder";
import UploadQuestionsForm from "@/features/quiz-management/components/create/UploadQuestionsForm";
import ShareableLink from "@/features/quiz-management/components/ShareableLink";
import CreateQuizTabs from "@/features/quiz-management/components/create/CreateQuizTabs";
import QuizDetailsStep from "@/features/quiz-management/components/create/QuizDetailsStep";
import CreateQuizStepper from "@/features/quiz-management/components/create/CreateQuizStepper";
import CreateQuizSkeleton from "@/features/quiz-management/components/create/CreateQuizSkeleton";
import type { AppQuestion } from "@/lib/types";

type Tab = "build" | "csv";
type WizardStep = "details" | "questions";

export default function CreateQuizCSV() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const resumeQuizId = searchParams.get("resume");
	const [tab, setTab] = useState<Tab>("build");
	const [step, setStep] = useState<WizardStep>("details");
	const {
		quiz,
		questions,
		shareableLink,
		quizCode,
		isCreatingQuiz,
		isUploadingQuestions,
		isLoadingDraft,
		isSavingMeta,
		setTitle,
		setDescription,
		timeLimit,
		setTimeLimit,
		visibility,
		category,
		difficulty,
		setVisibility,
		setCategory,
		setDifficulty,
		createQuiz,
		persistQuizMeta,
		setQuestionsFromCSV,
		saveAsDraft,
		publishQuiz,
	} = useCreateQuiz(resumeQuizId);

	// Auto-advance to questions after resume; stay on details for new quiz
	useEffect(() => {
		if (quiz.id && !isLoadingDraft) {
			const requested = searchParams.get("step") as WizardStep | null;
			if (requested === "details" || requested === "questions") {
				setStep(requested);
			} else if (questions.length > 0) {
				setStep("questions");
			}
		}
	}, [quiz.id, isLoadingDraft, questions.length, searchParams]);

	const handleTabSwitch = (next: Tab) => {
		if (next === "csv") {
			try {
				localStorage.removeItem("quiz_builder_draft");
			} catch {}
		}
		setTab(next);
	};

	const handlePublishClick = async (questionsOverride?: AppQuestion[]) => {
		const settings = {
			visibility,
			category: visibility === "public" ? category : null,
			difficulty: visibility === "public" ? difficulty : null,
		};
		const published = await publishQuiz(questionsOverride, settings);
		if (published) {
			router.push(`/dashboard/quiz/${quiz.id}`);
		}
	};

	const handleSaveAsDraft = async (questionsOverride?: AppQuestion[]) => {
		const saved = await saveAsDraft(questionsOverride);
		if (saved) router.push("/dashboard/my-quizzes");
		return saved;
	};

	const handleCreate = async () => {
		const ok = await createQuiz();
		if (ok) setStep("questions");
	};

	const handleSaveMeta = async () => {
		await persistQuizMeta();
	};

	if (isLoadingDraft) {
		return <CreateQuizSkeleton />;
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			<div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
				{/* Header */}
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
						<Link href="/dashboard/my-quizzes" className="hover:underline" style={{ color: "var(--color-text-secondary)" }}>
							← My quizzes
						</Link>
						<span aria-hidden>·</span>
						<span>{quiz.id ? (quiz.status === "published" ? "Published" : "Draft") : "New quiz"}</span>
					</div>
					<h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
						{quiz.id ? (step === "details" ? "Edit quiz details" : quiz.title || "Add questions") : "Create a new quiz"}
					</h1>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						{step === "details"
							? "Set up the basics before adding questions. All fields can be edited later."
							: "Add questions manually or bulk-upload via CSV. Your quiz saves as a draft until you publish."}
					</p>
				</div>

				<CreateQuizStepper activeStep={step} hasQuiz={Boolean(quiz.id)} questionCount={questions.length} onStepChange={setStep} />

				{step === "details" ? (
					<QuizDetailsStep
						title={quiz.title}
						description={quiz.description}
						timeLimit={timeLimit}
						visibility={visibility}
						category={category}
						difficulty={difficulty}
						quizId={quiz.id}
						isCreatingQuiz={isCreatingQuiz}
						isSavingMeta={isSavingMeta}
						setTitle={setTitle}
						setDescription={setDescription}
						setTimeLimit={setTimeLimit}
						setVisibility={setVisibility}
						setCategory={setCategory}
						setDifficulty={setDifficulty}
						onCreate={() => void handleCreate()}
						onSave={() => void handleSaveMeta()}
						onContinue={() => setStep("questions")}
					/>
				) : (
					<div className="space-y-4">
						{!quiz.id ? (
							<div className="rounded-2xl border p-8 text-center space-y-3" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
								<p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Create your quiz details first</p>
								<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Go back to Details to add a title and settings before adding questions.</p>
								<button
									type="button"
									onClick={() => setStep("details")}
									className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
									style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
								>
									Back to details
								</button>
							</div>
						) : quiz.status === "published" ? (
							<div className="rounded-2xl border p-6 text-center space-y-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
								<p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>This quiz is already published</p>
								<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Manage questions and settings from the detail page.</p>
								<Link href={`/dashboard/quiz/${quiz.id}`} className="inline-block mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "var(--color-surface-raised)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}>
									Go to quiz detail
								</Link>
							</div>
						) : (
							<div className="rounded-2xl border p-6 sm:p-8 space-y-6 shadow-sm" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{quiz.title}</p>
										<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
											{visibility === "public" ? `Public${category ? ` · ${category}` : ""}${difficulty ? ` · ${difficulty}` : ""}` : "Private"} {timeLimit ? `· ${timeLimit} min` : "· No time limit"} · {questions.length} question{questions.length !== 1 ? "s" : ""}
										</p>
									</div>
									<button
										type="button"
										onClick={() => setStep("details")}
										className="shrink-0 px-3 py-2 rounded-lg border text-xs font-medium transition"
										style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
									>
										Edit details
									</button>
								</div>

								<CreateQuizTabs activeTab={tab} onTabSwitch={handleTabSwitch} />

								{tab === "build" && (
									<QuizBuilder
										quizId={quiz.id}
										initialQuestions={questions}
										onSaveAsDraft={handleSaveAsDraft}
										onPublish={handlePublishClick}
										isUploading={isUploadingQuestions}
									/>
								)}

								{tab === "csv" && (
									<div className="space-y-4">
										<UploadQuestionsForm onFileChange={setQuestionsFromCSV} disabled={!quiz.id || isUploadingQuestions} />

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
											</div>
										)}

										<div className="flex gap-3 pt-2">
											<button
												type="button"
												onClick={() => void handleSaveAsDraft()}
												disabled={isUploadingQuestions}
												className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition disabled:opacity-50"
												style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
											>
												{isUploadingQuestions ? "Saving..." : "Save as Draft"}
											</button>
											<button
												type="button"
												onClick={() => handlePublishClick()}
												disabled={isUploadingQuestions || questions.length === 0}
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
					</div>
				)}

				{shareableLink && quizCode && <ShareableLink shareableLink={shareableLink} quizCode={quizCode} />}
			</div>
		</div>
	);
}
