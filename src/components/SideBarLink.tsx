import { HugeiconsIcon } from "@hugeicons/react";
import { Link, useLocation } from "react-router-dom";
import { NavItem } from "../constants/navItems";

export function SidebarLink({ label, path, icon }: NavItem) {
	const location = useLocation();
	const isActive = location.pathname === path;

	return (
		<Link
			to={path}
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
