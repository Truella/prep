import Link from "next/link";

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	linkTo: string;
}

export default function StatCard({ icon, label, value, linkTo }: StatCardProps) {
	return (
		<Link
			href={linkTo}
			className="block p-3 backdrop-blur-sm border rounded-lg hover:bg-surface-raised transition group"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
		>
			<div className="flex items-center gap-3">
				<div style={{ color: "var(--color-text-secondary)" }}>
					{icon}
				</div>
				<div>
					<p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
					<p className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</p>
				</div>
			</div>
		</Link>
	);
}
