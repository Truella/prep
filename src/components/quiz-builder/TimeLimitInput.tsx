"use client";

interface TimeLimitInputProps {
	value: number | null;
	onChange: (value: number | null) => void;
}

export default function TimeLimitInput({
	value,
	onChange,
}: TimeLimitInputProps) {
	const enabled = value !== null;

	return (
		<div className="flex items-center gap-4">
			<label className="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					checked={enabled}
					onChange={(e) => onChange(e.target.checked ? 30 : null)}
					className="w-4 h-4 rounded"
				/>
				<span className="text-sm text-gray-300">Set a time limit</span>
			</label>
			{enabled && (
				<div className="flex items-center gap-2">
					<input
						type="number"
						min={1}
						max={180}
						value={value ?? 30}
						onChange={(e) => {
							const v = parseInt(e.target.value);
							if (!isNaN(v) && v >= 1 && v <= 180) onChange(v);
						}}
						className="w-20 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition"
					/>
					<span className="text-sm text-gray-400">minutes</span>
				</div>
			)}
		</div>
	);
}
