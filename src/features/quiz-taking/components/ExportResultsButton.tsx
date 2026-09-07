"use client";

import type { AppQuestion } from "@/lib/types";
import {
	downloadFile,
	generateResultsCSV,
	generateResultsJSON,
	getExportFilename,
} from "@/features/quiz-taking/utils/exportResults";

interface ExportResultsButtonProps {
	quizTitle: string;
	questions: AppQuestion[];
	userAnswers: Record<number, number>;
	variant?: "default" | "compact";
}

function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M12 3V15M12 15L7 10M12 15L17 10M4 19H20"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function ExportResultsButton({
	quizTitle,
	questions,
	userAnswers,
	variant = "default",
}: ExportResultsButtonProps) {
	const handleDownload = (format: "csv" | "json") => {
		const content =
			format === "csv"
				? generateResultsCSV(questions, userAnswers)
				: generateResultsJSON(quizTitle, questions, userAnswers);
		downloadFile(
			getExportFilename(quizTitle, format),
			content,
			format === "csv" ? "text/csv" : "application/json"
		);
	};

	if (variant === "compact") {
		return (
			<div className="flex items-center gap-2" role="group" aria-label="Download results">
				<button
					type="button"
					onClick={() => handleDownload("csv")}
					className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
				>
					<DownloadIcon className="w-3.5 h-3.5" />
					CSV
				</button>
				<button
					type="button"
					onClick={() => handleDownload("json")}
					className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
				>
					<DownloadIcon className="w-3.5 h-3.5" />
					JSON
				</button>
			</div>
		);
	}

	return (
		<div
			className="flex items-center justify-center gap-2 mt-4"
			role="group"
			aria-label="Download results"
		>
			<span className="text-xs text-gray-500">Download:</span>
			<button
				type="button"
				onClick={() => handleDownload("csv")}
				className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
			>
				<DownloadIcon className="w-3.5 h-3.5" />
				CSV
			</button>
			<button
				type="button"
				onClick={() => handleDownload("json")}
				className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
			>
				<DownloadIcon className="w-3.5 h-3.5" />
				JSON
			</button>
		</div>
	);
}
