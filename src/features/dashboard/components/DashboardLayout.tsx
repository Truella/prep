import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { error, signOut, loading } = useAuth();

	const handleLogout = async () => {
		await signOut();
		if (error) {
			toast.error("Failed to log out");
			return;
		}
		if (loading) {
			toast.loading("Logging out...");
		}
		toast.success("Logged out successfully");
	};

	return (
		<div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
			{/* Sidebar navigation - full height */}
			<SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />

			{/* Content area */}
			<div className="flex flex-col min-w-0 flex-1 overflow-hidden">
				{/* Top Navigation - only spans content area */}
				<TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

				{/* Main Content Area */}
				<main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
					{children}
				</main>
			</div>
		</div>
	);
}
