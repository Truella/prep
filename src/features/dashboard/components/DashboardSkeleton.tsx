"use client";

import { SkeletonBox } from "@/shared/ui/skeletons/SkeletonBase";
import QuizRowSkeleton from "@/features/quiz-management/components/QuizRowSkeleton";

export default function DashboardSkeleton() {
	return (
		<div className="space-y-10 animate-pulse">
			{/* Header — mirrors Dashboard.tsx Overview */}
			<div>
				<SkeletonBox className="h-7 w-32 mb-2 rounded-lg" />
				<SkeletonBox className="h-4 w-64 rounded" />
			</div>

			{/* Stats grid — mirrors 3 cards */}
			<div className="grid grid-cols-3 gap-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="p-4 rounded-xl border space-y-3"
						style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
					>
						<div className="flex items-center justify-between">
							<SkeletonBox className="h-3 w-16 rounded" />
							<SkeletonBox className="h-5 w-5 rounded-full" />
						</div>
						<SkeletonBox className="h-9 w-12 rounded" />
						<SkeletonBox className="h-3 w-28 rounded" />
					</div>
				))}
			</div>

			{/* Continue where you left off */}
			<section>
				<div className="mb-4 flex items-center justify-between">
					<SkeletonBox className="h-5 w-48 rounded" />
					<SkeletonBox className="h-4 w-16 rounded" />
				</div>
				<div className="space-y-2">
					<QuizRowSkeleton />
					<QuizRowSkeleton />
				</div>
			</section>

			{/* Recent quizzes */}
			<div>
				<div className="flex items-center justify-between mb-4">
					<SkeletonBox className="h-5 w-32 rounded" />
					<SkeletonBox className="h-4 w-16 rounded" />
				</div>
				<div className="space-y-2">
					<QuizRowSkeleton />
					<QuizRowSkeleton />
					<QuizRowSkeleton />
				</div>
			</div>
		</div>
	);
}
