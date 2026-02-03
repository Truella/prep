import SkeletonGrid from "../components/skeletons/SkeletonGrid";
import QuizCardSkeleton from "../components/skeletons/QuizSkeleton";

export default function QuizListLoading() {
	return (
		<SkeletonGrid count={6} columns={{ default: 1, md: 2, lg: 3 }}>
			<QuizCardSkeleton />
		</SkeletonGrid>
	);
}
