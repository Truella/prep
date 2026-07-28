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
								<UploadQuestionsForm
									onFileChange={setQuestionsFromCSV}
									onSubmit={() => uploadQuestions()}
									disabled={!quiz.id}
									isUploading={isUploadingQuestions}
									questionCount={questions.length}
								/>
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
