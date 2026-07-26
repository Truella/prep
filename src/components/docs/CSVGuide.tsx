"use client";

import { useState } from "react";
import { parseAndValidateCSV } from "../../utils/csvParser";
import { generateCSV } from "../../utils/csvGenerator";
import type { AppQuestion } from "../../lib/types";

const EXAMPLE_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is the capital of France?,London,Paris,Berlin,Rome,B,1
What is 2 + 2?,3,4,5,6,B,1`;

const EXAMPLE_QUESTIONS: AppQuestion[] = [
	{
		id: "ex1", quizId: "", order: 0, points: 1, correctIndex: 1,
		questionText: "What is the capital of France?",
		optionA: "London", optionB: "Paris", optionC: "Berlin", optionD: "Rome",
	},
	{
		id: "ex2", quizId: "", order: 1, points: 1, correctIndex: 1,
		questionText: "What is 2 + 2?",
		optionA: "3", optionB: "4", optionC: "5", optionD: "6",
	},
];

const COLUMNS = [
	{ name: "Question", required: true, notes: "The question text" },
	{ name: "Option_A", required: true, notes: "Answer choice A" },
	{ name: "Option_B", required: true, notes: "Answer choice B" },
	{ name: "Option_C", required: true, notes: "Answer choice C" },
	{ name: "Option_D", required: true, notes: "Answer choice D" },
	{ name: "Correct_Answer", required: true, notes: "Must be A, B, C, or D (case-insensitive)" },
	{ name: "Points", required: false, notes: "Integer point value, defaults to 1" },
];

export default function CSVGuide() {
	const [csvInput, setCsvInput] = useState("");
	const [validationResult, setValidationResult] = useState<{
		ok: boolean;
		message: string;
	} | null>(null);
	const [copied, setCopied] = useState(false);
	const [copyFailed, setCopyFailed] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(EXAMPLE_CSV);
			setCopied(true);
			setCopyFailed(false);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopyFailed(true);
			setTimeout(() => setCopyFailed(false), 2000);
		}
	};

	const handleDownload = () => {
		const csv = generateCSV(EXAMPLE_QUESTIONS);
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "prep-sample.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleValidate = async () => {
		const file = new File([csvInput], "validate.csv", { type: "text/csv" });
		const result = await parseAndValidateCSV(file);
		setValidationResult(
			result.success
				? {
						ok: true,
						message: `Valid! ${result.data.length} question${result.data.length !== 1 ? "s" : ""} found.`,
					}
				: { ok: false, message: result.message },
		);
	};

	return (
		<div className="space-y-10">
			<div>
				<h1 className="text-3xl font-bold text-white mb-3">CSV Guide</h1>
				<p className="text-gray-300">
					Upload questions as a CSV file. The file must have a header row with
					these exact column names.
				</p>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-white/10">
							<th className="text-left py-2 pr-4 text-gray-400 font-medium">Column</th>
							<th className="text-left py-2 pr-4 text-gray-400 font-medium">Required</th>
							<th className="text-left py-2 text-gray-400 font-medium">Notes</th>
						</tr>
					</thead>
					<tbody>
						{COLUMNS.map((col) => (
							<tr key={col.name} className="border-b border-white/5">
								<td className="py-2 pr-4 font-mono text-white">{col.name}</td>
								<td className="py-2 pr-4 text-gray-400">{col.required ? "Yes" : "No"}</td>
								<td className="py-2 text-gray-400">{col.notes}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">Example CSV</h2>
					<div className="flex gap-2">
						<button
							onClick={handleCopy}
							className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:text-white transition"
						>
							{copyFailed ? "Failed" : copied ? "Copied!" : "Copy"}
						</button>
						<button
							onClick={handleDownload}
							className="text-xs px-3 py-1.5 rounded-lg border border-white/20 text-gray-400 hover:text-white transition"
						>
							Download sample
						</button>
					</div>
				</div>
				<pre className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto">
					{EXAMPLE_CSV}
				</pre>
			</div>

			<div className="space-y-3">
				<h2 className="text-lg font-semibold text-white">Validate your CSV</h2>
				<label htmlFor="csv-input" className="text-sm text-gray-400">
					Paste your CSV below to check it before uploading.
				</label>
				<textarea
					id="csv-input"
					value={csvInput}
					onChange={(e) => { setCsvInput(e.target.value); setValidationResult(null); }}
					placeholder="Paste CSV content here..."
					rows={6}
					className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition resize-none"
				/>
				<button
					onClick={handleValidate}
					disabled={!csvInput.trim()}
					className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
				>
					Validate
				</button>
				{validationResult && (
					<p
						aria-live="polite"
						className={`text-sm font-medium ${
							validationResult.ok ? "text-green-400" : "text-red-400"
						}`}
					>
						{validationResult.message}
					</p>
				)}
			</div>
		</div>
	);
}
