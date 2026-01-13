import { Link } from "react-router-dom";

const Home = () => {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-xl text-center space-y-6">
				<h1 className="text-4xl font-semibold tracking-tight">
					Simple Quiz Builder
				</h1>

				<p className="text-gray-600 text-lg">
					Create, upload, and share quizzes effortlessly.
				</p>

				<div className="flex items-center justify-center gap-4">
					<Link
						to="/auth"
						className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
					>
						Get Started
					</Link>

					<Link
						to="/quizzes"
						className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
					>
						View Quizzes
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Home;
