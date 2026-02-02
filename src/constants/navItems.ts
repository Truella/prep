
import {
	DashboardSquare01Icon,
	PlusSignIcon,
	TaskEdit01Icon,
} from "@hugeicons/core-free-icons";

export interface NavItem {
	label: string;
	path: string;
	icon: typeof DashboardSquare01Icon;
};

export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", path: "/dashboard", icon: DashboardSquare01Icon },
	{ label: "Create Quiz", path: "/dashboard/create", icon: PlusSignIcon },
	{ label: "My Quizzes", path: "/dashboard/my-quizzes", icon: TaskEdit01Icon },
];
