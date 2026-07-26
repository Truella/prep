"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
	{ slug: "getting-started", label: "Getting Started" },
	{ slug: "csv-guide", label: "CSV Guide" },
	{ slug: "troubleshooting", label: "Troubleshooting" },
	{ slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsSidebar() {
	const pathname = usePathname();

	return (
		<nav className="w-56 shrink-0">
			<ul className="space-y-1">
				{SECTIONS.map((s) => {
					const isActive =
						pathname === `/docs/${s.slug}` ||
						(s.slug === "getting-started" && pathname === "/docs");
					return (
						<li key={s.slug}>
							<Link
								href={`/docs/${s.slug}`}
								className={`block px-3 py-2 rounded-lg text-sm transition ${
									isActive
										? "bg-white/10 text-white font-medium"
										: "text-gray-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{s.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
