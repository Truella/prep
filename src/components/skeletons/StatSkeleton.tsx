import SkeletonCard from "./SkeletonCard";
import { SkeletonBox } from "./SkeletonBase";

export default function DashboardStatSkeleton() {
	return (
		<SkeletonCard className="p-2">
			<SkeletonBox className="h-2 w-20 mb-1" />
			<SkeletonBox className="h-3 w-16" />
		</SkeletonCard>
	);
}
