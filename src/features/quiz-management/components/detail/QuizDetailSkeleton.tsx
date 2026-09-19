"use client";

import { SkeletonBox } from "@/shared/ui/skeletons/SkeletonBase";

export default function QuizDetailSkeleton() {
	return (
		<div className="space-y-6 max-w-3xl animate-pulse">
			{/* Back + header — mirrors QuizDetailView.tsx:101 */}
			<div className="flex items-start gap-4">
				<SkeletonBox className="mt-1 w-8 h-8 rounded-lg shrink-0" />
				<div className="flex-1 min-w-0 space-y-2">
					<SkeletonBox className="h-7 w-3/5 rounded" />
					<SkeletonBox className="h-4 w-40 rounded" />
				</div>
				<div className="flex gap-2 shrink-0">
					<SkeletonBox className="h-8 w-24 rounded-lg" />
					<SkeletonBox className="h-8 w-20 rounded-lg" />
				</div>
			</div>

			{/* Tabs — mirrors TABS */}
			<div className="flex gap-1 border-b pb-0" style={{ borderColor: "var(--color-border)" }}>
				<SkeletonBox className="h-9 w-28 rounded-t" />
				<SkeletonBox className="h-9 w-24 rounded-t" />
				<SkeletonBox className="h-9 w-20 rounded-t" />
			</div>

			{/* Tab content — questions skeleton, 3 cards */}
			<div className="space-y-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="rounded-xl border p-4 space-y-3"
						style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" } as React.CSSProperties}
					>
						<div className="flex justify-between gap-3">
							<div className="flex-1 space-y-2">
								<SkeletonBox className="h-3 w-8 rounded" />
								<SkeletonBox className="h-4 w-4/5 rounded" />
							</div>
							<div className="flex gap-2">
								<SkeletonBox className="h-7 w-14 rounded-lg" />
								<SkeletonBox className="h-7 w-14 rounded-lg" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function QuizDetailSettingsSkeleton() {
	return (
		<div className="space-y-5 animate-pulse">
			<div className="space-y-2">
				<SkeletonBox className="h-3 w-12 rounded" />
				<SkeletonBox className="h-11 w-full rounded-xl" style={{ backgroundColor: "var(--color-surface-raised)" } as React.CSSProperties} />
			</div>
			<div className="space-y-2">
				<SkeletonBox className="h-3 w-20 rounded" />
				<SkeletonBox className="h-24 w-full rounded-xl" />
			</div>
			<div className="space-y-2">
				<SkeletonBox className="h-3 w-20 rounded" />
				<div className="space-y-2">
					<SkeletonBox className="h-16 w-full rounded-xl" />
					<SkeletonBox className="h-16 w-full rounded-xl" />
				</div>
			</div>
		</div>
	);
}
