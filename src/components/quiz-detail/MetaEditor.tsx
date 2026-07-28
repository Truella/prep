"use client";

import { useState } from "react";
import { QUIZ_CATEGORIES } from "../../lib/types";
import type {
	QuizVisibility,
	QuizCategory,
	QuizDifficulty,
} from "../../lib/types";

interface MetaEditorProps {
	title: string;
	description: string;
	timeLimit: number | null;
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
	saving: boolean;
	onSave: (
		updates: Partial<{
			title: string;
			description: string;
			time_limit: number | null;
			visibility: QuizVisibility;
			category: QuizCategory | null;
			difficulty: QuizDifficulty | null;
		}>
	) => Promise<boolean>;
}

const VISIBILITY_OPTIONS: {
	value: QuizVisibility;
	label: string;
	desc: string;
}[] = [
	{ value: "private", label: "Private", desc: "Direct link only" },
	{ value: "unlisted", label: "Unlisted", desc: "Shareable, not in Quiz Bank" },
	{ value: "public", label: "Public", desc: "Listed in Quiz Bank" },
];

export default function MetaEditor({
	title,
	description,
	timeLimit,
	visibility,
	category,
	difficulty,
	saving,
	onSave,
}: MetaEditorProps) {
	const [localTitle, setLocalTitle] = useState(title);
	const [localDesc, setLocalDesc] = useState(description);

	const inputStyle = {
		backgroundColor: "var(--color-surface-raised)",
		border: "1px solid var(--color-border)",
		color: "var(--color-text-primary)",
		borderRadius: "10px",
		padding: "10px 14px",
		width: "100%",
		fontSize: "14px",
		outline: "none",
	};

	return (
		<div className="space-y-5">
			{/* Title */}
			<div>
				<label
					className="block text-xs font-medium mb-1.5"
					style={{ color: "var(--color-text-secondary)" }}
				>
					Title
				</label>
				<input
					type="text"
					value={localTitle}
					onChange={(e) => setLocalTitle(e.target.value)}
					onBlur={() => {
						if (localTitle !== title) onSave({ title: localTitle });
					}}
					style={inputStyle}
				/>
			</div>

			{/* Description */}
			<div>
				<label
					className="block text-xs font-medium mb-1.5"
					style={{ color: "var(--color-text-secondary)" }}
				>
					Description
				</label>
				<textarea
					value={localDesc}
					onChange={(e) => setLocalDesc(e.target.value)}
					onBlur={() => {
						if (localDesc !== description) onSave({ description: localDesc });
					}}
					rows={3}
					style={{ ...inputStyle, resize: "none" }}
				/>
			</div>

			{/* Time limit */}
			<div className="flex items-center gap-4">
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={timeLimit !== null}
						onChange={(e) =>
							onSave({ time_limit: e.target.checked ? 30 : null })
						}
						className="w-4 h-4 rounded"
					/>
					<span
						className="text-sm"
						style={{ color: "var(--color-text-primary)" }}
					>
						Time limit
					</span>
				</label>
const [localTimeLimit, setLocalTimeLimit] = useState(timeLimit);

				{timeLimit !== null && (
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							max={180}
							value={localTimeLimit ?? ""}
							onChange={(e) => setLocalTimeLimit(parseInt(e.target.value) || null)}
							onBlur={() => {
								if (
									localTimeLimit !== timeLimit &&
									localTimeLimit !== null &&
									localTimeLimit >= 1 &&
									localTimeLimit <= 180
								)
									onSave({ time_limit: localTimeLimit });
							}}
							style={{
								...inputStyle,
								width: "72px",
								padding: "6px 10px",
							}}
						/>
						<span
							className="text-sm"
							style={{ color: "var(--color-text-secondary)" }}
						>
							minutes
						</span>
					</div>
				)}
			</div>

			{/* Visibility */}
			<div>
				<label
					className="block text-xs font-medium mb-1.5"
					style={{ color: "var(--color-text-secondary)" }}
				>
					Visibility
				</label>
				<div className="space-y-2">
					{VISIBILITY_OPTIONS.map((opt) => (
						<label
							key={opt.value}
							className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"
							style={{
								backgroundColor:
									visibility === opt.value
										? "var(--color-accent-dim)"
										: "var(--color-surface-raised)",
								border: `1px solid ${
									visibility === opt.value
										? "var(--color-accent)"
										: "var(--color-border)"
								}`,
							}}
						>
							<input
								type="radio"
								name="visibility"
								value={opt.value}
								checked={visibility === opt.value}
								onChange={() => onSave({ visibility: opt.value })}
								className="mt-0.5"
							/>
							<div>
								<p
									className="text-sm font-medium"
									style={{
										color:
											visibility === opt.value
												? "var(--color-accent)"
												: "var(--color-text-primary)",
									}}
								>
									{opt.label}
								</p>
								<p
									className="text-xs"
									style={{ color: "var(--color-text-secondary)" }}
								>
									{opt.desc}
								</p>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Category + Difficulty — only when public */}
			{visibility === "public" && (
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label
							className="block text-xs font-medium mb-1.5"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Category
						</label>
						<select
							value={category ?? ""}
							onChange={(e) =>
								onSave({ category: (e.target.value as QuizCategory) || null })
							}
							style={inputStyle}
						>
							<option value="">No category</option>
							{QUIZ_CATEGORIES.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							className="block text-xs font-medium mb-1.5"
							style={{ color: "var(--color-text-secondary)" }}
						>
							Difficulty
						</label>
						<select
							value={difficulty ?? ""}
							onChange={(e) =>
								onSave({
									difficulty: (e.target.value as QuizDifficulty) || null,
								})
							}
							style={inputStyle}
						>
							<option value="">Not specified</option>
							{(
								["Beginner", "Intermediate", "Advanced"] as QuizDifficulty[]
							).map((d) => (
								<option key={d} value={d}>
									{d}
								</option>
							))}
						</select>
					</div>
				</div>
			)}

			{saving && (
				<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
					Saving...
				</p>
			)}
		</div>
	);
}
