"use client";

import type { QuizAttempt } from "../../lib/types";

type AttemptRow = Pick<
	QuizAttempt,
	"id" | "score" | "total_points" | "elapsed_seconds" | "completed_at"
>;

interface AttemptStatsProps {
	attempts: AttemptRow[];
}

export default function AttemptStats({ attempts }: AttemptStatsProps) {
	if (attempts.length === 0) {
		return (
			<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
				No attempts yet.
			</p>
		);
	}

	const avgScore =
		attempts.reduce((sum, a) => sum + (a.total_points > 0 ? (a.score / a.total_points) * 100 : 0), 0) /
		attempts.length;

	const avgElapsed =
		attempts
			.filter((a) => a.elapsed_seconds != null)
			.reduce((sum, a) => sum + (a.elapsed_seconds ?? 0), 0) /
		(attempts.filter((a) => a.elapsed_seconds != null).length || 1);

	const formatTime = (s: number) =>
		`${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;

	return (
		<div className="space-y-4">
			{/* Summary */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{ label: "Attempts", value: attempts.length.toString() },
					{ label: "Avg score", value: `${Math.round(avgScore)}%` },
					{ label: "Avg time", value: formatTime(avgElapsed) },
				].map((s) => (
					<div
						key={s.label}
						className="p-4 rounded-xl border text-center space-y-1"
						style={{
							backgroundColor: "var(--color-surface-raised)",
							borderColor: "var(--color-border)",
						}}
					>
						<p
							className="text-xs"
							style={{ color: "var(--color-text-secondary)" }}
						>
							{s.label}
						</p>
						<p
							className="text-xl font-bold font-mono"
							style={{ color: "var(--color-text-primary)" }}
						>
							{s.value}
						</p>
					</div>
				))}
			</div>

			{/* Recent attempts list */}
			<div className="space-y-2">
				<p
					className="text-xs font-medium"
					style={{ color: "var(--color-text-secondary)" }}
				>
					Recent attempts
				</p>
				{attempts.slice(0, 10).map((a) => {
					const pct = a.total_points > 0 ? Math.round((a.score / a.total_points) * 100) : 0;
					return (
						<div
							key={a.id}
							className="flex items-center justify-between px-3 py-2 rounded-lg"
							style={{ backgroundColor: "var(--color-surface-raised)" }}
						>
							<span
								className="text-xs"
								style={{ color: "var(--color-text-secondary)" }}
							>
								{new Date(a.completed_at).toLocaleDateString("en-CA")}
							</span>
							<span
								className="text-xs font-mono font-semibold"
								style={{
									color:
										pct >= 70
											? "rgb(74 222 128)"
											: pct >= 50
											? "var(--color-accent)"
											: "rgb(248 113 113)",
								}}
							>
								{pct}% ({a.score}/{a.total_points})
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
