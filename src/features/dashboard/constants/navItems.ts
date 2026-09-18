
import {
	DashboardSquare02Icon,
	AddSquareIcon,
	Quiz03Icon,
} from "@hugeicons/core-free-icons";

export interface NavItem {
	label: string;
	path: string;
	icon: typeof DashboardSquare02Icon;
};

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", path: "/dashboard", icon: DashboardSquare02Icon },
	{ label: "Create Quiz", path: "/dashboard/create", icon: AddSquareIcon },
	{ label: "My Quizzes", path: "/dashboard/my-quizzes", icon: Quiz03Icon },
];
