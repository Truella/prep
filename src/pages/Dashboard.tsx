export default function Dashboard() {
	return (
		<div>
			<h2 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-white/10 rounded-xl">
							<svg
								className="w-6 h-6 text-white"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7 10L12 15L17 10"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white mb-2">
								Welcome Back!
							</h3>
							<p className="text-gray-400 text-sm">
								Create a new quiz or view your existing quizzes from the
								sidebar.
							</p>
						</div>
					</div>
				</div>

				{/* You can add more cards here */}
			</div>
		</div>
	);
}
