import React from "react";
import { NAV_ITEMS } from "../constants/navItems";
import { SidebarLink } from "./SideBarLink";
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
              fixed lg:static inset-y-0 left-0 z-40 w-64 backdrop-blur-xl border-r transform transition-transform duration-200 ease-in-out mt-16 lg:mt-0
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
				style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
			>
				<div className="h-full overflow-y-auto p-4">
					<nav className="space-y-2">
						{NAV_ITEMS.map((item) => (
							<SidebarLink key={item.path} {...item} />
						))}
					</nav>
				</div>
			</aside>
			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 backdrop-blur-sm z-30 lg:hidden"
					style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)" }}
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</>
	);
}
