"use client";

import { useState, useEffect } from "react";

interface TimeLimitInputProps {
	value: number | null;
	onChange: (value: number | null) => void;
	disabled?: boolean;
}

const PRESETS: { label: string; value: number | null }[] = [
	{ label: "No limit", value: null },
	{ label: "10m", value: 10 },
	{ label: "20m", value: 20 },
	{ label: "30m", value: 30 },
	{ label: "60m", value: 60 },
];

export default function TimeLimitInput({
	value,
	onChange,
	disabled,
}: TimeLimitInputProps) {
	const isCustom = value !== null && !PRESETS.some((p) => p.value === value);
	const [raw, setRaw] = useState(value !== null ? String(value) : "45");

	useEffect(() => {
		if (value !== null && !PRESETS.some((p) => p.value === value)) {
			setRaw(String(value));
		} else if (value === null) {
			// keep current custom draft, don't overwrite with preset value
			setRaw((prev) => (prev && !PRESETS.some((p) => String(p.value) === prev) ? prev : "45"));
		}
	}, [value]);

	const commit = (s: string) => {
		const trimmed = s.trim();
		if (trimmed === "") {
			setRaw(isCustom && value !== null ? String(value) : "45");
			return;
		}
		if (!/^\d+$/.test(trimmed)) {
			setRaw(isCustom && value !== null ? String(value) : "45");
			return;
		}
		const v = parseInt(trimmed, 10);
		const clamped = Math.max(1, Math.min(180, v));
		onChange(clamped);
		setRaw(String(clamped));
	};

	const handleCustomClick = () => {
		if (isCustom) return;
		const parsed = parseInt(raw, 10);
		const isPresetValue = PRESETS.some((p) => p.value === parsed);
		const next = !isNaN(parsed) && !isPresetValue && parsed >= 1 && parsed <= 180 ? parsed : 45;
		onChange(next);
		setRaw(String(next));
	};

	return (
		<div className="space-y-3">
			<div>
				<p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
					Time limit
				</p>
				<p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
					Optional countdown for timed quizzes.
				</p>
			</div>

			<div className="flex flex-wrap gap-2">
				{PRESETS.map((preset) => {
					const active = value === preset.value;
					return (
						<button
							key={preset.label}
							type="button"
							disabled={disabled}
							onClick={() => onChange(preset.value)}
							className="px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							style={{
								backgroundColor: active ? "var(--color-accent)" : "var(--color-surface-raised)",
								color: active ? "#0A0A0F" : "var(--color-text-secondary)",
								borderColor: active ? "var(--color-accent)" : "var(--color-border)",
							}}
						>
							{preset.label}
						</button>
					);
				})}
				<button
					type="button"
					disabled={disabled}
					onClick={handleCustomClick}
					className="px-3.5 py-2 rounded-full text-xs font-semibold border transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					style={{
						backgroundColor: isCustom ? "var(--color-accent)" : "var(--color-surface-raised)",
						color: isCustom ? "#0A0A0F" : "var(--color-text-secondary)",
						borderColor: isCustom ? "var(--color-accent)" : "var(--color-border)",
					}}
				>
					Custom
				</button>
			</div>

			{isCustom && (
				<div className="flex items-center gap-2">
					<div className="relative">
						<input
							type="number"
							min={1}
							max={180}
							disabled={disabled}
							aria-label="Time limit in minutes"
							value={raw}
							onChange={(e) => setRaw(e.target.value)}
							onBlur={(e) => commit(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
							}}
							className="w-28 pl-3 pr-12 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
							style={{
								backgroundColor: "var(--color-surface-raised)",
								borderColor: "var(--color-border)",
								color: "var(--color-text-primary)",
							}}
						/>
						<span
							className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
							style={{ color: "var(--color-text-secondary)" }}
						>
							min
						</span>
					</div>
					<span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
						1 – 180 minutes
					</span>
				</div>
			)}
		</div>
	);
}
