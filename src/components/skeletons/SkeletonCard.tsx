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
			className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}
		>
			{children}
		</div>
	);
}
