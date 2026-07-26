import type { ReactNode } from "react";
import DocsSidebar from "./DocsSidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-5xl mx-auto px-4 py-12 flex gap-10">
				<div className="hidden md:block">
					<DocsSidebar />
				</div>
				<main className="flex-1 min-w-0">{children}</main>
			</div>
		</div>
	);
}
