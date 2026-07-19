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
				isActive
					? "bg-white text-black"
					: "text-gray-300 hover:bg-white/5 hover:text-white"
			}`}
		>
			<HugeiconsIcon icon={icon} />
			{label}
		</Link>
	);
}
