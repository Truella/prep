import React from "react";
import {
	SidebarLeft01Icon,
	Moon01Icon,
	Sun01Icon,
	Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NAV_ITEMS } from "../constants/navItems";
import { useTheme } from "@/lib/theme";
import { SidebarLink } from "./SideBarLink";
import { SidebarItemLabel } from "./SidebarItemLabel";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

function getCollapsedSnapshot() {
	try {
		return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
	} catch {
		return false;
	}
}

function subscribeToCollapsedState(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener("sidebar-collapse-change", callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener("sidebar-collapse-change", callback);
	};
}

interface SideBarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleLogout: () => void;
}
export default function SideBar({ isSidebarOpen, setIsSidebarOpen, handleLogout }: SideBarProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const isCollapsed = React.useSyncExternalStore(
		subscribeToCollapsedState,
		getCollapsedSnapshot,
		() => false,
	);
	const isDark = resolvedTheme === "dark";
	const themeLabel = isDark ? "Switch to light theme" : "Switch to dark theme";
	const themeButtonRef = React.useRef<HTMLButtonElement>(null);
	const logoutButtonRef = React.useRef<HTMLButtonElement>(null);

	const toggleCollapsed = () => {
		try {
			localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(!isCollapsed));
		} catch {}
		window.dispatchEvent(new Event("sidebar-collapse-change"));
	};

	return (
		<>
			<aside
				className={`
					fixed bottom-0 left-0 top-0 z-[60] h-screen w-64 overflow-hidden ${isCollapsed ? "lg:w-[68px]" : "lg:w-64"} transform backdrop-blur-xl lg:sticky lg:self-start
					${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
				`}
				style={{
					backgroundColor: "var(--color-surface)",
					transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				<div className="flex h-full flex-col overflow-hidden">
					<div className={`hidden lg:flex h-16 shrink-0 items-center ${isCollapsed ? "justify-center" : "justify-end"}`}>
						<button
							type="button"
							onClick={toggleCollapsed}
							className="inline-flex items-center justify-center rounded-lg p-2 transition"
							style={{
								backgroundColor: "transparent",
								color: "var(--color-text-secondary)",
							}}
							onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-accent-dim)"; e.currentTarget.style.color = "var(--color-accent)"; }}
							onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--color-text-secondary)"; }}
							aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<HugeiconsIcon
								icon={SidebarLeft01Icon}
								size={18}
								style={{
									transform: isCollapsed ? "rotate(180deg)" : "none",
									transition: "transform 0.3s ease",
								}}
							/>
						</button>
					</div>
					<div
						className="flex flex-1 flex-col overflow-hidden"
						style={{
							padding: isCollapsed ? "0 0.5rem 0.5rem" : "0 1rem 1rem",
							transition: "padding 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					>
						<nav className="mt-6 space-y-3 overflow-y-auto">
							{NAV_ITEMS.map((item) => (
								<SidebarLink key={item.path} {...item} collapsed={isCollapsed} />
							))}
						</nav>

						<div className="mt-auto space-y-3">
						<button
							ref={themeButtonRef}
							type="button"
							onClick={() => setTheme(isDark ? "light" : "dark")}
							className={`flex w-full rounded-lg p-3 transition hover:bg-surface-raised ${isCollapsed ? "lg:justify-center" : ""}`}
							style={{ color: "var(--color-text-secondary)" }}
							aria-label={themeLabel}
						>
							<HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} />
							<SidebarItemLabel label={themeLabel} collapsed={isCollapsed} itemRef={themeButtonRef} showLabel={false} />
						</button>

						<button
							ref={logoutButtonRef}
							type="button"
							onClick={handleLogout}
							className={`flex w-full rounded-lg p-3 transition hover:bg-surface-raised ${isCollapsed ? "lg:justify-center" : ""}`}
							style={{ color: "var(--color-text-secondary)" }}
							aria-label="Log out"
						>
							<HugeiconsIcon icon={Logout01Icon} />
							<SidebarItemLabel label="Log out" collapsed={isCollapsed} itemRef={logoutButtonRef} showLabel={false} />
						</button>
						</div>
					</div>
				</div>
			</aside>
			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 backdrop-blur-sm z-[55] lg:hidden sidebar-overlay"
					style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 80%, transparent)" }}
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}
		</>
	);
}
