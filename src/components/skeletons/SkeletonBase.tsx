interface SkeletonBaseProps {
	className?: string;
	variant?: "pulse" | "wave";
}

export function SkeletonBox({
	className = "",
	variant = "pulse",
}: SkeletonBaseProps) {
	return (
		<div
			className={`bg-white/10 rounded ${variant === "pulse" ? "animate-pulse" : ""} ${className}`}
		/>
	);
}

export function SkeletonText({
	className = "",
	variant = "pulse",
	lines = 1,
}: SkeletonBaseProps & { lines?: number }) {
	if (lines === 1) {
		return <SkeletonBox className={`h-4 ${className}`} variant={variant} />;
	}

	return (
		<div className="space-y-2">
			{Array.from({ length: lines }).map((_, i) => (
				<SkeletonBox
					key={i}
					className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"} ${className}`}
					variant={variant}
				/>
			))}
		</div>
	);
}

export function SkeletonCircle({
	className = "",
	variant = "pulse",
	size = "md",
}: SkeletonBaseProps & { size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
	};

	return (
		<SkeletonBox
			className={`rounded-full ${sizeClasses[size]} ${className}`}
			variant={variant}
		/>
	);
}

export function SkeletonButton({
	className = "",
	variant = "pulse",
}: SkeletonBaseProps) {
	return (
		<SkeletonBox className={`h-10 rounded-lg ${className}`} variant={variant} />
	);
}
