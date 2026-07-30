"use client";

import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

interface SidebarItemLabelProps {
	label: string;
	collapsed: boolean;
	itemRef: RefObject<HTMLElement | null>;
	showLabel?: boolean;
}

export function SidebarItemLabel({ label, collapsed, itemRef, showLabel = true }: SidebarItemLabelProps) {
	const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

	useEffect(() => {
		const item = itemRef.current;
		if (!collapsed || !item) return;

		const showTooltip = () => {
			const bounds = item.getBoundingClientRect();
			setPosition({ left: bounds.right + 8, top: bounds.top + bounds.height / 2 });
		};
		const hideTooltip = () => setPosition(null);

		item.addEventListener("mouseenter", showTooltip);
		item.addEventListener("focus", showTooltip);
		item.addEventListener("mouseleave", hideTooltip);
		item.addEventListener("blur", hideTooltip);
		return () => {
			item.removeEventListener("mouseenter", showTooltip);
			item.removeEventListener("focus", showTooltip);
			item.removeEventListener("mouseleave", hideTooltip);
			item.removeEventListener("blur", hideTooltip);
		};
	}, [collapsed, itemRef]);

	return (
		<>
			<span className={!showLabel || collapsed ? "sr-only" : ""}>{label}</span>
			{collapsed && position && createPortal(
				<span
					className="pointer-events-none fixed z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md border px-2 py-1 text-xs shadow-lg lg:block"
					style={{
						left: position.left,
						top: position.top,
						backgroundColor: "var(--color-surface-raised)",
						borderColor: "var(--color-border)",
						color: "var(--color-text-primary)",
					}}
				>
					{label}
				</span>,
				document.body,
			)}
		</>
	);
}
