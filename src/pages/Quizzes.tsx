
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Quiz {
	id: string;
	title: string;
	description: string;
	created_at: string;
}

export default function Quizzes() {
	const [quizzes, setQuizzes] = useState<Quiz[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
	const fetchMyQuizzes = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return;

		const { data, error } = await supabase
			.from("quizzes")
			.select("*")
			.eq("created_by", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			toast.error("Failed to fetch quizzes");
			console.error(error);
			return;
		}

		setQuizzes(data || []);
		setLoading(false);
	};
		fetchMyQuizzes();
	}, []);


	const copyQuizLink = (quizId: string) => {
		const link = `${window.location.origin}/quiz/${quizId}`;
		navigator.clipboard.writeText(link);
		toast.success("Quiz link copied!");
	};

	if (loading) {
		return <div className="text-center py-10">Loading your quizzes...</div>;
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
				<Link
					to="/dashboard/create"
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Create New Quiz
				</Link>
			</div>

			{quizzes.length === 0 ? (
				<div className="text-center py-12 bg-white rounded-lg">
					<p className="text-gray-500 mb-4">
						You haven't created any quizzes yet.
					</p>
					<Link
						to="/dashboard/create"
						className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Create Your First Quiz
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{quizzes.map((quiz) => (
						<div
							key={quiz.id}
							className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
						>
							<h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
							<p className="text-gray-600 text-sm mb-4 line-clamp-2">
								{quiz.description || "No description"}
							</p>
							<p className="text-xs text-gray-400 mb-4">
								Created {new Date(quiz.created_at).toLocaleDateString()}
							</p>
							<div className="flex gap-2">
								<button
									onClick={() => copyQuizLink(quiz.id)}
									className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
								>
									Copy Link
								</button>
								<Link
									to={`/quiz/${quiz.id}`}
									className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm text-center"
								>
									View
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
