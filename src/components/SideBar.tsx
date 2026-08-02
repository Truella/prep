import React from "react";
import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Moon01Icon,
	Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { NAV_ITEMS } from "../constants/navItems";
import { useTheme } from "../lib/theme";
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
}
export default function SideBar({ isSidebarOpen, setIsSidebarOpen }: SideBarProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const isCollapsed = React.useSyncExternalStore(
		subscribeToCollapsedState,
		getCollapsedSnapshot,
		() => false,
	);
	const isDark = resolvedTheme === "dark";
	const themeLabel = isDark ? "Switch to light theme" : "Switch to dark theme";
	const themeButtonRef = React.useRef<HTMLButtonElement>(null);

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
					fixed bottom-0 left-0 top-16 z-40 h-[calc(100dvh-4rem)] w-64 ${isCollapsed ? "lg:w-[68px]" : "lg:w-64"} transform border-r backdrop-blur-xl transition-[width,transform] duration-200 ease-in-out lg:sticky lg:self-start
					${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
				`}
				style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
			>
				<div className={`flex h-full flex-col overflow-y-auto p-4 ${isCollapsed ? "lg:p-2" : ""}`}>
					<div className={`mb-4 hidden lg:flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
						<button
							type="button"
							onClick={toggleCollapsed}
							className="inline-flex rounded-lg p-2 hover:bg-surface-raised"
							style={{ color: "var(--color-text-secondary)" }}
							aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<HugeiconsIcon icon={isCollapsed ? ArrowRight01Icon : ArrowLeft01Icon} size={18} />
						</button>
					</div>
					<nav className="space-y-2">
						{NAV_ITEMS.map((item) => (
							<SidebarLink key={item.path} {...item} collapsed={isCollapsed} />
						))}
					</nav>
					<button
					ref={themeButtonRef}
						type="button"
						onClick={() => setTheme(isDark ? "light" : "dark")}
						className={`mt-auto flex rounded-lg p-3 transition hover:bg-surface-raised ${isCollapsed ? "lg:self-center" : ""}`}
						style={{ color: "var(--color-text-secondary)" }}
						aria-label={themeLabel}
					>
						<HugeiconsIcon icon={isDark ? Sun01Icon : Moon01Icon} />
						<SidebarItemLabel label={themeLabel} collapsed={isCollapsed} itemRef={themeButtonRef} showLabel={false} />
					</button>
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
