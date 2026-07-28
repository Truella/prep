"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "../constants/navItems";

export function SidebarLink({ label, path, icon }: NavItem) {
	const pathname = usePathname();
	const isActive = pathname === path;

	return (
		<Link
			href={path}
			className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
				isActive ? "" : "hover:bg-surface"
			}`}
			style={{
				backgroundColor: isActive ? "var(--color-text-primary)" : "transparent",
				color: isActive ? "var(--color-bg)" : "var(--color-text-secondary)",
			}}
			onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--color-text-primary)"; } }}
			onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
		>
			<HugeiconsIcon icon={icon} />
			{label}
		</Link>
	);
}
