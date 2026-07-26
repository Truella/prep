export default function GettingStarted() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-white mb-3">Getting Started</h1>
				<p className="text-gray-300 leading-relaxed">
					PREP lets you create and share multiple-choice quizzes. Build questions
					manually or upload a CSV, then share a link with anyone.
				</p>
			</div>
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-white">Three steps</h2>
				{[
					{ n: "1", t: "Create an account", d: "Sign up and go to your dashboard." },
					{ n: "2", t: "Build your quiz", d: "Add questions manually in the builder, or upload a CSV. Set an optional time limit." },
					{ n: "3", t: "Share the link", d: "Copy the shareable link and send it to anyone. No account needed to take a quiz." },
				].map((s) => (
					<div key={s.n} className="flex gap-4 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
						<span className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
							{s.n}
						</span>
						<div>
							<p className="text-white font-medium">{s.t}</p>
							<p className="text-gray-400 text-sm mt-0.5">{s.d}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
