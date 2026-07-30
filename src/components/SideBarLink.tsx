"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { NavItem } from "../constants/navItems";
import { SidebarItemLabel } from "./SidebarItemLabel";

interface SidebarLinkProps extends NavItem {
	collapsed?: boolean;
}

export function SidebarLink({ label, path, icon, collapsed = false }: SidebarLinkProps) {
	const pathname = usePathname();
	const isActive = pathname === path;
	const linkRef = useRef<HTMLAnchorElement>(null);

	return (
		<Link
			ref={linkRef}
			href={path}
			className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
				isActive ? "" : "hover:bg-surface"
			} ${collapsed ? "relative group lg:justify-center lg:px-3" : ""}`}
			style={{
				backgroundColor: isActive ? "var(--color-text-primary)" : "transparent",
				color: isActive ? "var(--color-bg)" : "var(--color-text-secondary)",
			}}
			onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--color-text-primary)"; } }}
			onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.color = "var(--color-text-secondary)"; } }}
		>
			<HugeiconsIcon icon={icon} />
			<SidebarItemLabel label={label} collapsed={collapsed} itemRef={linkRef} />
		</Link>
	);
}
