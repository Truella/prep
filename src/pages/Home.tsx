import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-2xl mx-auto text-center">
				<h1 className="text-4xl font-bold text-gray-900 mb-4">Quiz App</h1>
				<p className="text-xl text-gray-600 mb-8">
					Create and share quizzes for studying
				</p>
				<Link
					to="/create"
					className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
				>
					Create New Quiz
				</Link>
			</div>
		</div>
	);
};

export default Home;
