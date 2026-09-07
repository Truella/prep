import React from "react";
import Link from "next/link";

interface TopBarProps {
	isSidebarOpen: boolean;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function TopBar({
	isSidebarOpen,
	setIsSidebarOpen,
}: TopBarProps) {
	return (
		<nav className="backdrop-blur-xl border-b sticky top-0 z-50"
			style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Left - Logo & Menu Toggle */}
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:hidden p-2 rounded-lg hover:bg-surface transition"
							style={{ color: "var(--color-text-primary)" }}
							aria-label={isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
						<h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Quiz Dashboard</h1>
					</div>

					{/* Right - Create Quiz CTA */}
					<Link
						href="/dashboard/create"
						className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
						style={{
							backgroundColor: "var(--color-accent)",
							color: "#fff",
						}}
					>
						Create Quiz
					</Link>
				</div>
			</div>
		</nav>
	);
}
