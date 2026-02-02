import React from "react";
import { NAV_ITEMS } from "../constants/navItems";
import { SidebarLink } from "./SideBarLink";
import AnalyticsWidget from "./Analytics";
interface SideBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function SideBar({ isSidebarOpen, setIsSidebarOpen }: SideBarProps) {
	return (
		<>
			{" "}
			<aside
				className={`
              fixed lg:static inset-y-0 left-0 z-40 w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 transform transition-transform duration-200 ease-in-out mt-16 lg:mt-0
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
			>
				<div className="h-full overflow-y-auto p-4">
					{/* Navigation Links */}
					<nav className="space-y-2 mb-6">
						{NAV_ITEMS.map((item) => (
							<SidebarLink key={item.path} {...item} />
						))}
					</nav>

					{/* Analytics Section */}
					<div className="border-t border-white/10 pt-4">
						<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
							Analytics
						</h3>
						<AnalyticsWidget />
					</div>
				</div>
			</aside>
			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</>
	);
}
