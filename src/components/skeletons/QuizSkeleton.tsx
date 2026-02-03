import SkeletonCard from "./SkeletonCard";
import { SkeletonBox, SkeletonText, SkeletonButton } from "./SkeletonBase";

export default function QuizCardSkeleton() {
	return (
		<SkeletonCard>
			{/* Title */}
			<SkeletonBox className="h-6 w-3/4 mb-3" />

			{/* Description */}
			<SkeletonText lines={2} className="mb-4" />

			{/* Date */}
			<SkeletonBox className="h-3 w-1/2 mb-4" />

			{/* Buttons */}
			<div className="flex gap-2">
				<SkeletonButton className="flex-1" />
				<SkeletonButton className="flex-1" />
			</div>
		</SkeletonCard>
	);
}
