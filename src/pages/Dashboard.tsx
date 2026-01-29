
export default function Dashboard() {
	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Dashboard Overview
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h3 className="text-lg font-semibold mb-2">Welcome Back! 👋</h3>
					<p className="text-gray-600">
						Create a new quiz or view your existing quizzes from the sidebar.
					</p>
				</div>

				{/* Add more dashboard widgets here */}
			</div>
		</div>
	);
}
