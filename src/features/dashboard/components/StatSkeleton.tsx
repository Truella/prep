import SkeletonCard from "@/shared/ui/skeletons/SkeletonCard";
import { SkeletonBox } from "@/shared/ui/skeletons/SkeletonBase";

export default function DashboardStatSkeleton() {
	return (
		<SkeletonCard className="p-2">
			<SkeletonBox className="h-2 w-20 mb-1" />
			<SkeletonBox className="h-3 w-16" />
		</SkeletonCard>
	);
}
