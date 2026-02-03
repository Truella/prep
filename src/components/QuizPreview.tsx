import React from "react";
import type { PreviewQuestion } from "../lib/types";
import { letterToIndex } from "../utils/helpers";

export default function QuizPreview({ questions }: { questions: PreviewQuestion[] }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-white">Questions Preview</h3>
				<span className="px-3 py-1 rounded-full bg-white/10 text-sm text-gray-300">
					{questions.length} question{questions.length !== 1 ? "s" : ""}
				</span>
			</div>

			<div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
				{questions.map((q, idx) => (
					<div
						key={idx}
						className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
					>
						<p className="text-white font-medium mb-3">
							<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs mr-2">
								{idx + 1}
							</span>
							{q.text}
						</p>

						<ul className="space-y-2 mb-3">
							{q.options.map((option, i) => (
								<li
									key={i}
									className={`flex items-start gap-2 text-sm ${
										i === letterToIndex(q.answer) ? "text-green-400" : "text-gray-400"
									}`}
								>
									<span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-xs flex-shrink-0 mt-0.5">
										{String.fromCharCode(65 + i)}
									</span>
									<span>{option}</span>
									{i === letterToIndex(q.answer) && (
										<svg
											className="w-4 h-4 shrink-0 mt-0.5"
											viewBox="0 0 24 24"
											fill="none"
										>
											<path
												d="M20 6L9 17L4 12"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									)}
								</li>
							))}
						</ul>

						{q.points && (
							<p className="text-xs text-gray-400">
								Points:{" "}
								<span className="text-white font-medium">{q.points}</span>
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
