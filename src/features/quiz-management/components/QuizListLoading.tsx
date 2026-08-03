import QuizRowSkeleton from "./QuizRowSkeleton";

export default function QuizListLoading() {
	return (
		<div className="space-y-2">
			{Array.from({ length: 6 }).map((_, index) => (
				<QuizRowSkeleton key={index} />
			))}
		</div>
	);
}
