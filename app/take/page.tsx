"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";

export default function TakeQuizInput() {
	const [input, setInput] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!input.trim()) {
			toast.error("Please enter a quiz link or ID");
			return;
		}

		// Extract ID from full link or use directly
		let quizId = input.trim();

		// If it's a full URL, extract the ID
		if (input.includes("/quiz/")) {
			const parts = input.split("/quiz/");
			quizId = parts[1].split("?")[0]; // Remove query params if any
		}

		if (!quizId) {
			toast.error("Invalid quiz link or ID");
			return;
		}

		router.push(`/quiz/${quizId}`);
	};

	return (
		<div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
			<div className="relative z-10 max-w-md w-full">
				<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
					<div className="text-center space-y-6">
						{/* Icon */}
						<div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
							<HugeiconsIcon icon={FlashIcon} color="white" />
						</div>

						<div>
							<h1 className="text-3xl font-bold text-white mb-2">
								Take a Quiz
							</h1>
							<p className="text-gray-400">
								Enter the quiz link or ID to get started
							</p>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Paste quiz link or enter ID"
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
							/>

							<button
								type="submit"
								className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all shadow-lg"
							>
								Start Quiz
							</button>
						</form>

						<button
							onClick={() => router.push("/")}
							className="text-gray-400 hover:text-white transition text-sm"
						>
							← Back to home
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
