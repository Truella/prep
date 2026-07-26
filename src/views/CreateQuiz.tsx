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
	} = useCreateQuiz();

	const handleTabSwitch = (next: Tab) => {
		setTab(next);
	};

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-8 space-y-8 max-w-3xl">
				{/* Stats */}
				<div className="grid grid-cols-2 gap-4 max-w-md">
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
						<p className="text-gray-400 text-sm mb-1">Quiz Status</p>
						<p className="text-xl font-bold text-white">
							{quiz.id ? "Draft Created" : "Not Created"}
						</p>
					</div>
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center">
						<p className="text-gray-400 text-sm mb-1">Total Questions</p>
						<p className="text-2xl font-bold text-white">{questions.length}</p>
					</div>
				</div>

				{/* Main card */}
				<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
					{/* Metadata — disabled after quiz created */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Quiz Title
							</label>
							<input
								type="text"
								placeholder="Enter quiz title"
								value={quiz.title}
								onChange={(e) => setTitle(e.target.value)}
								disabled={!!quiz.id}
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Description
							</label>
							<textarea
								placeholder="Enter quiz description"
								value={quiz.description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={!!quiz.id}
								rows={3}
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
							/>
						</div>
						<TimeLimitInput value={timeLimit} onChange={setTimeLimit} disabled={!!quiz.id} />
						{!quiz.id && (
							<button
								onClick={createQuiz}
								disabled={isCreatingQuiz}
								className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
							>
								{isCreatingQuiz ? "Creating..." : "Create Quiz"}
							</button>
						)}
					</div>

					{/* Tabs — only shown after quiz is created */}
					{quiz.id && (
						<>
							<div className="flex gap-2 border-b border-white/10">
								{(["build", "csv"] as Tab[]).map((t) => (
									<button
										key={t}
										onClick={() => handleTabSwitch(t)}
										className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
											tab === t
												? "text-white border-white"
												: "text-gray-400 border-transparent hover:text-white"
										}`}
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
								className="w-full px-4 py-3 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:bg-white/5 transition font-medium text-sm"
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
				onSuccess={() => {}}
			/>
		</div>
	);
}
