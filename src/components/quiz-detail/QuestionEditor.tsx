"use client";

import { useState } from "react";
import type { AppQuestion } from "../../lib/types";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

interface QuestionEditorProps {
	question: AppQuestion;
	index: number;
	onSave: (updated: AppQuestion) => Promise<boolean>;
	onDelete: (id: string) => Promise<boolean>;
}

export default function QuestionEditor({
	question,
	index,
	onSave,
	onDelete,
}: QuestionEditorProps) {
	const [expanded, setExpanded] = useState(false);
	const [draft, setDraft] = useState<AppQuestion>(question);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [saving, setSaving] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		const ok = await onSave(draft);
		setSaving(false);
		if (ok) setExpanded(false);
	};

	const handleCancel = () => {
		setDraft(question);
		setExpanded(false);
		setConfirmDelete(false);
	};

	const handleDelete = async () => {
		if (!confirmDelete) {
			setConfirmDelete(true);
			return;
		}
		await onDelete(question.id);
	};

	const cardStyle = {
		backgroundColor: "var(--color-surface)",
		border: `1px solid var(--color-border)`,
		borderRadius: "12px",
		padding: "16px",
	};

	const inputStyle = {
		backgroundColor: "var(--color-surface-raised)",
		border: "1px solid var(--color-border)",
		color: "var(--color-text-primary)",
		borderRadius: "8px",
		padding: "8px 12px",
		width: "100%",
		fontSize: "13px",
		outline: "none",
	};

	return (
		<div style={cardStyle} className="space-y-3">
			{/* Header — always visible */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<span
						className="text-xs font-mono mb-1 block"
						style={{ color: "var(--color-accent)" }}
					>
						Q{index + 1}
					</span>
					<p
						className="text-sm font-medium leading-snug line-clamp-2"
						style={{ color: "var(--color-text-primary)" }}
					>
						{question.questionText || (
							<span style={{ color: "var(--color-text-secondary)" }}>
								Untitled question
							</span>
						)}
					</p>
				</div>
				<div className="flex gap-2 shrink-0">
			<button
				type="button"
				onClick={() => {
					setExpanded(!expanded);
					setConfirmDelete(false);
				}}
						className="text-xs px-3 py-1.5 rounded-lg border transition"
						style={{
							borderColor: "var(--color-border)",
							color: "var(--color-text-secondary)",
						}}
					>
						{expanded ? "Cancel" : "Edit"}
					</button>
				<button
					type="button"
					onClick={handleDelete}
						className="text-xs px-3 py-1.5 rounded-lg border transition"
						style={{
							borderColor: confirmDelete
								? "rgb(239 68 68 / 0.5)"
								: "var(--color-border)",
							color: confirmDelete
								? "rgb(248 113 113)"
								: "var(--color-text-secondary)",
							backgroundColor: confirmDelete
								? "rgb(239 68 68 / 0.1)"
								: "transparent",
						}}
					>
						{confirmDelete ? "Confirm delete" : "Delete"}
					</button>
				</div>
			</div>

			{/* Expanded edit form */}
			{expanded && (
				<div
					className="space-y-3 pt-2 border-t"
					style={{ borderColor: "var(--color-border)" }}
				>
					<textarea
						value={draft.questionText}
						onChange={(e) =>
							setDraft((d) => ({ ...d, questionText: e.target.value }))
						}
						rows={2}
						placeholder="Question text"
						style={{ ...inputStyle, resize: "none" }}
					/>

					<div className="grid grid-cols-2 gap-2">
						{OPTION_KEYS.map((key, i) => (
							<div key={key} className="flex items-center gap-2">
								<button
									type="button"
								onClick={() =>
									setDraft((d) => ({ ...d, correctIndex: i as 0 | 1 | 2 | 3 }))
								}
									className="shrink-0 w-6 h-6 rounded-full text-xs font-bold transition flex items-center justify-center"
									style={{
										backgroundColor:
											draft.correctIndex === i
												? "var(--color-accent)"
												: "var(--color-border)",
										color:
											draft.correctIndex === i
												? "#0A0A0F"
												: "var(--color-text-secondary)",
									}}
								>
									{OPTION_LABELS[i]}
								</button>
								<input
									value={draft[key]}
									onChange={(e) =>
										setDraft((d) => ({ ...d, [key]: e.target.value }))
									}
									placeholder={`Option ${OPTION_LABELS[i]}`}
									style={{ ...inputStyle, flex: 1, padding: "6px 10px" }}
								/>
							</div>
						))}
					</div>

					<div className="flex items-center gap-3">
						<label
							className="text-xs"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Points
						</label>
						<input
							type="number"
							min={1}
							max={100}
							value={draft.points}
							onChange={(e) =>
								setDraft((d) => {
									const v = parseInt(e.target.value);
									return {
										...d,
										points: isNaN(v) ? 1 : Math.min(100, Math.max(1, v)),
									};
								})
							}
							style={{ ...inputStyle, width: "64px", padding: "4px 8px" }}
						/>
					</div>

					<div className="flex gap-2 pt-1">
			<button
				type="button"
				onClick={handleSave}
				disabled={saving}
							className="px-4 py-2 rounded-lg text-xs font-semibold transition"
							style={{
								backgroundColor: "var(--color-text-primary)",
								color: "var(--color-bg)",
								opacity: saving ? 0.6 : 1,
							}}
						>
							{saving ? "Saving..." : "Save question"}
						</button>
			<button
				type="button"
				onClick={handleCancel}
							className="px-4 py-2 rounded-lg text-xs border transition"
							style={{
								borderColor: "var(--color-border)",
								color: "var(--color-text-secondary)",
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
