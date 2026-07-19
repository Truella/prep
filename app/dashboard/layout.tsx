"use client";

import { RequireAuth } from "../../src/components/RequireAuth";
import DashboardLayout from "../../src/components/DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<RequireAuth>
			<DashboardLayout>{children}</DashboardLayout>
		</RequireAuth>
	);
}
