import React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeft01Icon } from "@hugeicons/core-free-icons";

interface TopBarProps {
	isSidebarOpen: boolean;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function TopBar({
	isSidebarOpen,
	setIsSidebarOpen,
}: TopBarProps) {
	return (
		<nav className="backdrop-blur-xl sticky top-0 z-50"
			style={{ backgroundColor: "var(--color-surface)" }}>
			<div className="px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Left - Menu Toggle */}
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg transition"
							style={{
								backgroundColor: "transparent",
								color: "var(--color-text-secondary)",
							}}
							onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-accent-dim)"; e.currentTarget.style.color = "var(--color-accent)"; }}
							onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
							aria-label={isSidebarOpen ? "Close sidebar menu" : "Open sidebar menu"}
						>
							<HugeiconsIcon
								icon={SidebarLeft01Icon}
								size={20}
								style={{
									transform: isSidebarOpen ? "rotate(180deg)" : "none",
									transition: "transform 0.3s ease",
								}}
							/>
						</button>
					</div>

					{/* Right - Create Quiz CTA */}
					<Link
						href="/dashboard/create"
						className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
						style={{
							backgroundColor: "var(--color-accent)",
							color: "var(--color-bg)",
						}}
					>
						Create Quiz
					</Link>
				</div>
			</div>
		</nav>
	);
}
