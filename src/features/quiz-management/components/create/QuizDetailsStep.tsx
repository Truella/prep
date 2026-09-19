"use client";

import { QUIZ_CATEGORIES } from "@/lib/types";
import type { QuizCategory, QuizDifficulty, QuizVisibility } from "@/lib/types";
import TimeLimitInput from "../builder/TimeLimitInput";
import Dropdown from "@/shared/ui/Dropdown";

interface QuizDetailsStepProps {
	title: string;
	description: string;
	timeLimit: number | null;
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
	quizId?: string;
	isCreatingQuiz: boolean;
	isSavingMeta: boolean;
	setTitle: (v: string) => void;
	setDescription: (v: string) => void;
	setTimeLimit: (v: number | null) => void;
	setVisibility: (v: QuizVisibility) => void;
	setCategory: (v: QuizCategory | null) => void;
	setDifficulty: (v: QuizDifficulty | null) => void;
	onCreate: () => void;
	onSave: () => void;
	onContinue: () => void;
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 120;

export default function QuizDetailsStep({
	title,
	description,
	timeLimit,
	visibility,
	category,
	difficulty,
	quizId,
	isCreatingQuiz,
	isSavingMeta,
	setTitle,
	setDescription,
	setTimeLimit,
	setVisibility,
	setCategory,
	setDifficulty,
	onCreate,
	onSave,
	onContinue,
}: QuizDetailsStepProps) {
	const inputBase: React.CSSProperties = {
		backgroundColor: "var(--color-surface-raised)",
		borderColor: "var(--color-border)",
		color: "var(--color-text-primary)",
	};
	const titleNearLimit = title.length >= TITLE_LIMIT - 10;
	const descNearLimit = description.length >= DESCRIPTION_LIMIT - 20;

	return (
		<div className="space-y-6">
			{/* Basics */}
			<div className="rounded-2xl border p-6 space-y-5" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
				<div>
					<h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
						Basics
					</h3>
					<p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
						This is what learners see first. You can edit it later from your dashboard.
					</p>
				</div>

				<div>
					<div className="flex items-center justify-between mb-2">
						<label htmlFor="quiz-title" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
							Quiz title <span style={{ color: "var(--color-incorrect)" }}>*</span>
						</label>
						<span className="text-xs font-mono" style={{ color: titleNearLimit ? "var(--color-incorrect)" : "var(--color-text-secondary)" }}>
							{title.length}/{TITLE_LIMIT}
						</span>
					</div>
					<input
						id="quiz-title"
						type="text"
						placeholder="e.g. JavaScript Fundamentals — Midterm"
						value={title}
						onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
						maxLength={TITLE_LIMIT}
						className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition"
						style={inputBase}
					/>
				</div>

				<div>
					<div className="flex items-center justify-between mb-2">
						<label htmlFor="quiz-description" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
							Description
						</label>
						<span className="text-xs font-mono" style={{ color: descNearLimit ? "var(--color-incorrect)" : "var(--color-text-secondary)" }}>
							{description.length}/{DESCRIPTION_LIMIT}
						</span>
					</div>
					<textarea
						id="quiz-description"
						placeholder="What is this quiz about? Who is it for?"
						value={description}
						onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
						rows={3}
						maxLength={DESCRIPTION_LIMIT}
						className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition resize-none"
						style={inputBase}
					/>
					<p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
						Keep it short — shown on cards and share previews.
					</p>
				</div>
			</div>

			{/* Discovery */}
			<div className="rounded-2xl border p-6 space-y-5" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
				<div>
					<h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
						Discovery
					</h3>
					<p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
						Control how learners find your quiz. You can change this before publishing.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{(
						[
							{ value: "private" as QuizVisibility, label: "Private", desc: "Link + code only. Not in Quiz Bank." },
							{ value: "public" as QuizVisibility, label: "Public", desc: "Listed in Quiz Bank for discovery." },
						] as const
					).map((opt) => {
						const active = visibility === opt.value;
						return (
							<label
								key={opt.value}
								className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition"
								style={{
									backgroundColor: active ? "var(--color-accent-dim)" : "var(--color-surface-raised)",
									borderColor: active ? "var(--color-accent)" : "var(--color-border)",
								}}
							>
								<input
									type="radio"
									name="quiz-visibility"
									checked={active}
									onChange={() => setVisibility(opt.value)}
									className="mt-0.5"
								/>
								<span className="min-w-0">
									<span className="block text-sm font-semibold" style={{ color: active ? "var(--color-accent)" : "var(--color-text-primary)" }}>
										{opt.label}
									</span>
									<span className="block text-xs mt-1 leading-snug" style={{ color: "var(--color-text-secondary)" }}>
										{opt.desc}
									</span>
								</span>
							</label>
						);
					})}
				</div>

				{visibility === "public" && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
						<div>
							<span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
								Category
							</span>
							<Dropdown
								value={category ?? ""}
								onChange={(v) => setCategory((v as QuizCategory) || null)}
								options={[{ value: "", label: "No category" }, ...QUIZ_CATEGORIES.map((c) => ({ value: c, label: c }))]}
								placeholder="No category"
								ariaLabel="Category"
							/>
						</div>
						<div>
							<span className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
								Difficulty
							</span>
							<Dropdown
								value={difficulty ?? ""}
								onChange={(v) => setDifficulty((v as QuizDifficulty) || null)}
								options={[
									{ value: "", label: "Not specified" },
									{ value: "Beginner", label: "Beginner" },
									{ value: "Intermediate", label: "Intermediate" },
									{ value: "Advanced", label: "Advanced" },
								]}
								placeholder="Not specified"
								ariaLabel="Difficulty"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Timing */}
			<div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
				<TimeLimitInput value={timeLimit} onChange={setTimeLimit} />
			</div>

			{/* Actions */}
			<div className="flex gap-3">
				{!quizId ? (
					<button
						type="button"
						onClick={onCreate}
						disabled={isCreatingQuiz || !title.trim()}
						className="flex-1 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
						style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
					>
						{isCreatingQuiz ? "Creating…" : "Create quiz & continue →"}
					</button>
				) : (
					<>
						<button
							type="button"
							onClick={onSave}
							disabled={isSavingMeta}
							className="flex-1 px-6 py-3 rounded-xl border font-medium text-sm disabled:opacity-50 transition"
							style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)", backgroundColor: "var(--color-surface)" }}
						>
							{isSavingMeta ? "Saving…" : "Save changes"}
						</button>
						<button
							type="button"
							onClick={onContinue}
							className="flex-1 px-6 py-3 rounded-xl font-semibold text-sm transition shadow-lg"
							style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
						>
							Continue to questions →
						</button>
					</>
				)}
			</div>
			{quizId && (
				<p className="text-xs text-center" style={{ color: "var(--color-text-secondary)" }}>
					Edits save to your draft. Publishing options are confirmed in the next step.
				</p>
			)}
		</div>
	);
}
