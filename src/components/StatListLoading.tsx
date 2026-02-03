import SkeletonGrid from "../components/skeletons/SkeletonGrid";
import DashboardStatSkeleton from "./skeletons/StatSkeleton";

export default function StatListLoading() {
    return (
        <SkeletonGrid count={3} columns={{ default: 1, md:  1, lg: 1 }}>
            <DashboardStatSkeleton/>
        </SkeletonGrid>
    );
}
