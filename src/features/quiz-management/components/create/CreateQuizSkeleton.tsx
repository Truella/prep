"use client";

import { SkeletonBox } from "@/shared/ui/skeletons/SkeletonBase";

export default function CreateQuizSkeleton() {
	return (
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			<div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl animate-pulse">
				{/* Header — mirrors CreateQuiz.tsx */}
				<div className="space-y-2">
					<SkeletonBox className="h-3 w-32 rounded" />
					<SkeletonBox className="h-7 w-64 rounded" />
					<SkeletonBox className="h-4 w-full max-w-xl rounded" />
				</div>

				{/* Stepper — 2 cards + connector */}
				<div className="flex items-center gap-3">
					<SkeletonBox className="h-20 flex-1 rounded-xl" />
					<SkeletonBox className="hidden sm:block w-8 h-px shrink-0 rounded" />
					<SkeletonBox className="h-20 flex-1 rounded-xl" />
				</div>

				{/* Details step — Basics card */}
				<div className="rounded-2xl border p-6 space-y-5" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" } as React.CSSProperties}>
					<div className="space-y-2">
						<SkeletonBox className="h-4 w-16 rounded" />
						<SkeletonBox className="h-3 w-64 rounded" />
					</div>
					<div className="space-y-2">
						<SkeletonBox className="h-4 w-24 rounded" />
						<SkeletonBox className="h-12 w-full rounded-xl" />
					</div>
					<div className="space-y-2">
						<SkeletonBox className="h-4 w-24 rounded" />
						<SkeletonBox className="h-20 w-full rounded-xl" />
						<SkeletonBox className="h-3 w-48 rounded" />
					</div>
				</div>

				{/* Discovery card */}
				<div className="rounded-2xl border p-6 space-y-4" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" } as React.CSSProperties}>
					<div className="space-y-2">
						<SkeletonBox className="h-4 w-20 rounded" />
						<SkeletonBox className="h-3 w-72 rounded" />
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<SkeletonBox className="h-20 w-full rounded-xl" />
						<SkeletonBox className="h-20 w-full rounded-xl" />
					</div>
				</div>

				{/* Timing card */}
				<div className="rounded-2xl border p-6 space-y-3" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" } as React.CSSProperties}>
					<SkeletonBox className="h-4 w-20 rounded" />
					<SkeletonBox className="h-3 w-80 rounded" />
					<div className="flex gap-2">
						<SkeletonBox className="h-8 w-20 rounded-full" />
						<SkeletonBox className="h-8 w-16 rounded-full" />
						<SkeletonBox className="h-8 w-16 rounded-full" />
						<SkeletonBox className="h-8 w-16 rounded-full" />
						<SkeletonBox className="h-8 w-16 rounded-full" />
					</div>
				</div>

				<SkeletonBox className="h-12 w-full rounded-xl" />
			</div>
		</div>
	);
}

export function CreateQuizQuestionsSkeleton() {
	return (
		<div className="rounded-2xl border p-6 sm:p-8 space-y-6" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" } as React.CSSProperties}>
			<div className="flex justify-between gap-4">
				<div className="space-y-2 flex-1">
					<SkeletonBox className="h-4 w-40 rounded" />
					<SkeletonBox className="h-3 w-64 rounded" />
				</div>
				<SkeletonBox className="h-8 w-24 rounded-lg" />
			</div>
			<SkeletonBox className="h-9 w-full rounded border-b" />
			<div className="space-y-3">
				<SkeletonBox className="h-20 w-full rounded-xl" />
				<SkeletonBox className="h-20 w-full rounded-xl" />
				<SkeletonBox className="h-12 w-full rounded-xl" />
			</div>
		</div>
	);
}
