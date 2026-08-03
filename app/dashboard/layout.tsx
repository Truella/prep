"use client";

import { RequireAuth } from "@/features/auth/components/RequireAuth";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAuth>
			<DashboardLayout>{children}</DashboardLayout>
		</RequireAuth>
	);
}
