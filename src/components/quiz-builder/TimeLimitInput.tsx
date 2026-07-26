"use client";

import { useState, useEffect } from "react";

interface TimeLimitInputProps {
	value: number | null;
	onChange: (value: number | null) => void;
	disabled?: boolean;
}

export default function TimeLimitInput({
	value,
	onChange,
	disabled,
}: TimeLimitInputProps) {
	const enabled = value !== null;
	const [raw, setRaw] = useState(value !== null ? String(value) : "");

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRaw(value !== null ? String(value) : "");
	}, [value]);

	const commit = (s: string) => {
		const trimmed = s.trim();
		if (trimmed === "") {
			setRaw(value !== null ? String(value) : "");
			return;
		}
		if (!/^\d+$/.test(trimmed)) {
			setRaw(value !== null ? String(value) : "");
			return;
		}
		const v = parseInt(trimmed, 10);
		const clamped = Math.max(1, Math.min(180, v));
		onChange(clamped);
		setRaw(String(clamped));
	};

	return (
		<div className="flex items-center gap-4">
			<label className="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={enabled}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked ? 30 : null)}
					className="w-4 h-4 rounded"
				/>
				<span className={`text-sm ${disabled ? "text-gray-600" : "text-gray-300"}`}>
					Set a time limit
				</span>
			</label>
			{enabled && (
				<div className="flex items-center gap-2">
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
						className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
					/>
					<span className="text-sm text-gray-400">minutes</span>
				</div>
			)}
		</div>
	);
}
