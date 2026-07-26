"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import DocsSidebar from "./DocsSidebar";

const SECTIONS = [
	{ slug: "getting-started", label: "Getting Started" },
	{ slug: "csv-guide", label: "CSV Guide" },
	{ slug: "troubleshooting", label: "Troubleshooting" },
	{ slug: "question-tips", label: "Tips for Good Questions" },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();

	const currentSlug =
		SECTIONS.find(
			(s) =>
				pathname === `/docs/${s.slug}` ||
				(s.slug === "getting-started" && pathname === "/docs"),
		)?.slug ?? "getting-started";

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-5xl mx-auto px-4 py-12">
				<div className="md:hidden mb-6">
					<select
						value={currentSlug}
						onChange={(e) => router.push(`/docs/${e.target.value}`)}
						className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
					>
						{SECTIONS.map((s) => (
							<option key={s.slug} value={s.slug}>
								{s.label}
							</option>
						))}
					</select>
				</div>
				<div className="flex gap-10">
					<div className="hidden md:block">
						<DocsSidebar />
					</div>
					<main className="flex-1 min-w-0">{children}</main>
				</div>
			</div>
		</div>
	);
}
