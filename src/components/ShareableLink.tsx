import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ShareableLink({
	shareableLink,
	quizCode,
}: {
	shareableLink: string;
	quizCode?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [codeCopied, setCodeCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(shareableLink);
		setCopied(true);
		toast.success("Link copied!");
		setTimeout(() => setCopied(false), 2000);
	};

	const handleCodeCopy = () => {
		if (!quizCode) return;
		navigator.clipboard.writeText(quizCode);
		setCodeCopied(true);
		toast.success("Code copied!");
		setTimeout(() => setCodeCopied(false), 2000);
	};

	return (
		<div className="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
			<div className="flex items-start gap-3 mb-4">
				<div className="p-2 bg-green-500/20 rounded-lg">
					<svg
						className="w-6 h-6 text-green-400"
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
				</div>
				<div>
					<h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
						Quiz Published Successfully!
					</h3>
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						Share this link with students to take the quiz
					</p>
				</div>
			</div>

			<div className="flex gap-2">
				<input
					type="text"
					value={shareableLink}
					readOnly
					className="flex-1 px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition cursor-pointer"
					style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
					onClick={(e) => e.currentTarget.select()}
				/>

				<button
					type="button"
					onClick={handleCopy}
					className="px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
					style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
				>
					{copied ? (
						<>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
								<path
									d="M20 6L9 17L4 12"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Copied
						</>
					) : (
						<>
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
								<rect
									x="9"
									y="9"
									width="13"
									height="13"
									rx="2"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							Copy
						</>
					)}
				</button>
			</div>

			{quizCode && (
				<div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-green-500/20">
					<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
						Share code: <span className="ml-2 font-mono font-bold text-base" style={{ color: "var(--color-text-primary)" }}>{quizCode}</span>
					</p>
					<button
						type="button"
						onClick={handleCodeCopy}
						className="px-4 py-2 rounded-lg border text-sm font-medium transition"
						style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
					>
						{codeCopied ? "Copied" : "Copy code"}
					</button>
				</div>
			)}
		</div>
	);
}
