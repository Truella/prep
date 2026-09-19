import { ReactNode } from "react";

interface SkeletonCardProps {
	children: ReactNode;
	className?: string;
}

export default function SkeletonCard({
	children,
	className = "",
}: SkeletonCardProps) {
	return (
		<div
			className={`rounded-2xl p-6 border ${className}`}
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
		>
			{children}
		</div>
	);
}
