import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const {error, signOut, loading } = useAuth();

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
		<div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
			{/* Top Navigation */}
			<TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
			<div className="flex">
				{/* Sidebar - Analytics & Navigation */}
				<SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

				{/* Main Content Area */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
