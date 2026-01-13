import React from "react";
import { logout } from "../lib/auth";

const CreateQuiz = () => {
	return (
		<div className="container mx-auto px-4 py-8">
			<div>
				<button onClick={logout}>Log out</button>
			</div>
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					Create New Quiz
				</h1>
				<p className="text-gray-600">Quiz creation form coming next...</p>
			</div>
		</div>
	);
};

export default CreateQuiz;
