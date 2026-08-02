import { SkeletonBox } from "./SkeletonBase";

export default function QuizRowSkeleton() {
	return (
		<div
			className="flex min-h-16 items-center gap-3 rounded-xl border px-4 py-2"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
		>
			<SkeletonBox className="h-2 w-2 shrink-0 rounded-full" />
			<div className="min-w-0 flex-1 space-y-2">
				<SkeletonBox className="h-4 w-1/3" />
				<SkeletonBox className="h-3 w-1/4" />
			</div>
			<SkeletonBox className="h-9 w-24 rounded-lg" />
			<SkeletonBox className="h-8 w-8 rounded-lg" />
		</div>
	);
}
