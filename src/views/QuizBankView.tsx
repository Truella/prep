"use client";

import { useQuizBank } from "../hooks/useQuizBank";
import QuizBankFilters from "../components/quiz-bank/QuizBankFilters";
import QuizBankCard from "../components/quiz-bank/QuizBankCard";

export default function QuizBankView() {
	const {
		quizzes,
		loading,
		error,
		filters,
		setFilter,
		searchQuery,
		setSearchQuery,
	} = useQuizBank();

	return (
		<div className="min-h-screen bg-black">
			<div className="container mx-auto px-4 py-8 space-y-6 max-w-5xl">
				<div>
					<h1 className="text-3xl font-bold text-white mb-1">
						Quiz Bank
					</h1>
					<p className="text-gray-400 text-sm">
						Browse and take public quizzes created by the community.
					</p>
				</div>

				<QuizBankFilters
					category={filters.category}
					difficulty={filters.difficulty}
					sort={filters.sort}
					searchQuery={searchQuery}
					onCategoryChange={(v) => setFilter("category", v)}
					onDifficultyChange={(v) => setFilter("difficulty", v)}
					onSortChange={(v) => setFilter("sort", v)}
					onSearchChange={setSearchQuery}
				/>

				{loading && (
					<div className="text-center text-gray-400 py-12">
						Loading quizzes...
					</div>
				)}

				{error && (
					<div className="text-center text-red-400 py-12">
						Failed to load quizzes: {error}
					</div>
				)}

				{!loading && !error && quizzes.length === 0 && (
					<div className="text-center text-gray-400 py-12">
						No quizzes found. Try adjusting your filters.
					</div>
				)}

				{!loading && !error && quizzes.length > 0 && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{quizzes.map((quiz) => (
							<QuizBankCard key={quiz.id} quiz={quiz} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
