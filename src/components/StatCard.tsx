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
			className="block p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition group"
		>
			<div className="flex items-center gap-3">
				<div className="text-gray-400 group-hover:text-white transition">
					{icon}
				</div>
				<div>
					<p className="text-xs text-gray-400">{label}</p>
					<p className="text-xl font-bold text-white">{value}</p>
				</div>
			</div>
		</Link>
	);
}
