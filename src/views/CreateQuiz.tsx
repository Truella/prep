"use client";

import { useState } from "react";
import { useCreateQuiz } from "../hooks/useCreateQuiz";
import QuizBuilder from "../components/quiz-builder/QuizBuilder";
import TimeLimitInput from "../components/quiz-builder/TimeLimitInput";
import UploadQuestionsForm from "../components/UploadQuestionsForm";
import ShareableLink from "../components/ShareableLink";
import PublishModal from "../components/quiz-bank/PublishModal";

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

	const handleTabSwitch = (next: Tab) => {
		setTab(next);
	};

	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			<div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
				{/* Stats */}
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="backdrop-blur-sm border rounded-xl p-4 text-center"
					style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
						<p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Quiz Status</p>
						<p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
							{quiz.id ? "Draft Created" : "Not Created"}
						</p>
					</div>
					<div className="backdrop-blur-sm border rounded-xl p-4 text-center"
					style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
						<p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Total Questions</p>
						<p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{questions.length}</p>
					</div>
				</div>

				{/* Main card */}
				<div className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl space-y-6"
				style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
					{/* Metadata — disabled after quiz created */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
								Quiz Title
							</label>
							<input
								type="text"
								placeholder="Enter quiz title"
								value={quiz.title}
								onChange={(e) => setTitle(e.target.value)}
								disabled={!!quiz.id}
								className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
								style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
								Description
							</label>
							<textarea
								placeholder="Enter quiz description"
								value={quiz.description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={!!quiz.id}
								rows={3}
								className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
								style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
							/>
						</div>
						<TimeLimitInput value={timeLimit} onChange={setTimeLimit} disabled={!!quiz.id} />
						{!quiz.id && (
							<button
								onClick={createQuiz}
								disabled={isCreatingQuiz}
								className="w-full px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
								style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
							>
								{isCreatingQuiz ? "Creating..." : "Create Quiz"}
							</button>
						)}
					</div>

					{/* Tabs — only shown after quiz is created */}
					{quiz.id && (
						<>
							<div className="flex gap-2 border-b" style={{ borderColor: "var(--color-border)" }}>
								{(["build", "csv"] as Tab[]).map((t) => (
									<button
										key={t}
										onClick={() => handleTabSwitch(t)}
										className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
											tab === t
												? "border-white"
												: "border-transparent"
										}`}
										style={{ color: tab === t ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
										onMouseEnter={(e) => { if (tab !== t) e.currentTarget.style.color = "var(--color-text-primary)"; }}
										onMouseLeave={(e) => { if (tab !== t) e.currentTarget.style.color = "var(--color-text-secondary)"; }}
									>
										{t === "build" ? "Build manually" : "Upload CSV"}
									</button>
								))}
							</div>

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
