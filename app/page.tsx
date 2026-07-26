import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	IceCubesIcon,
	TaskEdit01Icon,
	LibraryIcon,
} from "@hugeicons/core-free-icons";

export default function Home() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
			{/* Main content */}
			<div className="relative z-10 max-w-2xl w-full">
				{/* Glass card */}
				<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
					<div className="text-center space-y-8">
						<h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
							Simple Quiz Builder
						</h1>

						<p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto">
							Create, upload, and share quizzes effortlessly.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
							{/* Get Started button */}
							<Link
								href="/auth"
								className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
							>
								<HugeiconsIcon icon={IceCubesIcon} />
								Get Started
							</Link>

							<Link
								href="/take"
								className="group w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-semibold backdrop-blur-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
							>
								<HugeiconsIcon icon={TaskEdit01Icon} />
								Take a Quiz
							</Link>
							<Link
								href="/quiz-bank"
								className="group w-full sm:w-auto px-8 py-4 rounded-xl border border-white/20 text-white font-semibold backdrop-blur-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
							>
								<HugeiconsIcon icon={LibraryIcon} />
								Quiz Bank
							</Link>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 mt-8 text-center">
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
						<p className="text-2xl font-bold text-white">Fast</p>
						<p className="text-sm text-gray-400 mt-1">Quick setup</p>
					</div>
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
						<p className="text-2xl font-bold text-white">Simple</p>
						<p className="text-sm text-gray-400 mt-1">Easy to use</p>
					</div>
					<div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
						<p className="text-2xl font-bold text-white">Free</p>
						<p className="text-sm text-gray-400 mt-1">No cost</p>
					</div>
				</div>
			</div>
		</div>
	);
}
