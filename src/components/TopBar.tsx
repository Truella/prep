import React from "react";
interface TopBarProps {
	isSidebarOpen: boolean;
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	handleLogout: () => void;
}
export default function TopBar({
	isSidebarOpen,
	setIsSidebarOpen,
	handleLogout,
}: TopBarProps) {
	return (
		<nav className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
			<div className="max-w-full px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Left - Logo & Menu Toggle */}
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition text-white"
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
						<h1 className="text-xl font-bold text-white">Quiz Dashboard</h1>
					</div>

					{/* Right - Logout Button */}
					<button
						onClick={handleLogout}
						className="px-4 py-2 text-sm font-medium text-white border border-white/20 hover:bg-white/5 rounded-lg transition"
					>
						Log Out
					</button>
				</div>
			</div>
		</nav>
	);
}
