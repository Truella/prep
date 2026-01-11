import React from "react";
import { useParams } from "react-router-dom";

const TakeQuiz: React.FC = () => {
	const { id } = useParams<{ id: string }>();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Take Quiz</h1>
				<p className="text-gray-600">Quiz ID: {id}</p>
			</div>
		</div>
	);
};

export default TakeQuiz;
