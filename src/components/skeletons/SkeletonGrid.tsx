import { ReactNode } from "react";

interface SkeletonGridProps {
	children: ReactNode;
	count?: number;
	columns?: {
		default?: number;
		md?: number;
		lg?: number;
	};
}

export default function SkeletonGrid({
	children,
	count = 3,
	columns = { default: 1, md: 2, lg: 3 },
}: SkeletonGridProps) {
	const gridCols = `grid-cols-${columns.default || 1} md:grid-cols-${columns.md || 2} lg:grid-cols-${columns.lg || 3}`;

	return (
		<div className={`grid ${gridCols} gap-6`}>
			{Array.from({ length: count }).map((_, i) => (
				<div key={i}>{children}</div>
			))}
		</div>
	);
}
