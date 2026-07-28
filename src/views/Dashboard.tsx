export default function Dashboard() {
	return (
		<div>
			<h2 className="text-3xl font-bold mb-6" style={{ color: "var(--color-text-primary)" }}>Dashboard Overview</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="backdrop-blur-xl border p-6 rounded-2xl"
					style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
					<div className="flex items-start gap-4">
						<div className="p-3 rounded-xl" style={{ backgroundColor: "var(--color-surface-raised)" }}>
							<svg
								className="w-6 h-6" style={{ color: "var(--color-text-primary)" }}
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
							<h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
								Welcome Back!
							</h3>
							<p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
								Create a new quiz or view your existing quizzes from the
								sidebar.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
