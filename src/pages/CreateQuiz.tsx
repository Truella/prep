import React from "react";
import { useAuth } from "../context/AuthContext";

const CreateQuiz = () => {
  const {signOut} = useAuth()
	return (
		<div className="container mx-auto px-4 py-8">
			<div>
				<button onClick={signOut}>Log out</button>
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
