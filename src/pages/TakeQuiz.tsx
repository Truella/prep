// pages/TakeQuiz.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Question {
	id: string;
	Question: string;
	Option_A: string;
	Option_B: string;
	Option_C: string;
	Option_D: string;
	Correct_Answer: string;
	Points: number;
}

interface Quiz {
	id: string;
	title: string;
	description: string;
}

export default function TakeQuiz() {
	const { quizId } = useParams<{ quizId: string }>();
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<number, string>
	>({});
	const [showResults, setShowResults] = useState(false);

useEffect(() => {
	const fetchQuizData = async () => {
		console.log("Fetching quiz data for ID:", quizId);

		if (!quizId) {
			console.log("No quizId provided");
			setLoading(false);
			return;
		}

		setLoading(true);

		// Fetch quiz details
		const { data: quizData, error: quizError } = await supabase
			.from("quizzes")
			.select("*")
			.eq("id", quizId)
			.single();

		console.log("Quiz data:", quizData);
		console.log("Quiz error:", quizError);

		// Fetch questions
		const { data: questionsData, error: questionsError } = await supabase
			.from("questions")
			.select("*")
			.eq("quiz_id", quizId);

		console.log("Questions data:", questionsData);
		console.log("Questions error:", questionsError);

		if (quizError || questionsError) {
			console.error("Error fetching quiz:", quizError || questionsError);
			setLoading(false);
			return;
		}

		setQuiz(quizData);
		setQuestions(questionsData || []);
		setLoading(false);
		console.log("Loading complete");
	};

	fetchQuizData();
}, [quizId]);

	const handleAnswerSelect = (answer: string) => {
		setSelectedAnswers({
			...selectedAnswers,
			[currentQuestionIndex]: answer,
		});
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const handleSubmit = () => {
		setShowResults(true);
	};

	const calculateScore = () => {
		let score = 0;
		questions.forEach((question, index) => {
			if (selectedAnswers[index] === question.Correct_Answer) {
				score += question.Points;
			}
		});
		return score;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl">Loading quiz...</div>
			</div>
		);
	}

	if (!quiz || questions.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl text-red-600">
					Quiz not found or has no questions
				</div>
			</div>
		);
	}

	if (showResults) {
		const score = calculateScore();
		const totalPoints = questions.reduce((sum, q) => sum + q.Points, 0);

		return (
			<div className="max-w-2xl mx-auto p-6">
				<h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-2xl mb-4">{quiz.title}</h2>
					<p className="text-4xl font-bold text-green-600 mb-4">
						{score} / {totalPoints} points
					</p>
					<p className="text-lg mb-4">
						You got{" "}
						{
							questions.filter(
								(q, i) => selectedAnswers[i] === q.Correct_Answer,
							).length
						}{" "}
						out of {questions.length} questions correct!
					</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Retake Quiz
					</button>
				</div>
			</div>
		);
	}

	const currentQuestion = questions[currentQuestionIndex];

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
			{quiz.description && (
				<p className="text-gray-600 mb-6">{quiz.description}</p>
			)}

			<div className="mb-4 text-sm text-gray-500">
				Question {currentQuestionIndex + 1} of {questions.length}
			</div>

			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">
					{currentQuestion.Question}
				</h2>

				<div className="space-y-3">
					{["Option_A", "Option_B", "Option_C", "Option_D"].map((option) => {
						const optionValue = currentQuestion[
							option as keyof Question
						] as string;
						const optionLetter = option.split("_")[1];
						const isSelected =
							selectedAnswers[currentQuestionIndex] === optionLetter;

						return (
							<button
								key={option}
								onClick={() => handleAnswerSelect(optionLetter)}
								className={`w-full text-left p-4 rounded border-2 transition ${
									isSelected
										? "border-blue-600 bg-blue-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								<span className="font-semibold">{optionLetter}.</span>{" "}
								{optionValue}
							</button>
						);
					})}
				</div>
			</div>

			<div className="flex justify-between">
				<button
					onClick={handlePrevious}
					disabled={currentQuestionIndex === 0}
					className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>

				{currentQuestionIndex === questions.length - 1 ? (
					<button
						onClick={handleSubmit}
						className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
					>
						Submit Quiz
					</button>
				) : (
					<button
						onClick={handleNext}
						className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
					>
						Next
					</button>
				)}
			</div>
		</div>
	);
}
