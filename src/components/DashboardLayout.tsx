// components/DashboardLayout.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const handleLogout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast.error("Failed to log out");
			return;
		}
		toast.success("Logged out successfully");
		navigate("/auth");
	};

	const isActive = (path: string) => location.pathname === path;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navigation */}
			<nav className="bg-white shadow-sm border-b sticky top-0 z-50">
				<div className="max-w-full px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Left - Logo & Menu Toggle */}
						<div className="flex items-center gap-4">
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="lg:hidden p-2 rounded-md hover:bg-gray-100"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							</button>
							<h1 className="text-xl font-bold text-gray-900">
								Quiz Dashboard
							</h1>
						</div>

						{/* Right - Logout Button */}
						<button
							onClick={handleLogout}
							className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
						>
							Log Out
						</button>
					</div>
				</div>
			</nav>

			<div className="flex">
				{/* Sidebar - Analytics & Navigation */}
				<aside
					className={`
            fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out mt-16 lg:mt-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
				>
					<div className="h-full overflow-y-auto p-4">
						{/* Navigation Links */}
						<nav className="space-y-2 mb-6">
							<Link
								to="/dashboard"
								className={`block px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard")
										? "bg-blue-50 text-blue-700"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								📊 Dashboard
							</Link>
							<Link
								to="/dashboard/create"
								className={`block px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard/create")
										? "bg-blue-50 text-blue-700"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								➕ Create Quiz
							</Link>
							<Link
								to="/dashboard/my-quizzes"
								className={`block px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard/my-quizzes")
										? "bg-blue-50 text-blue-700"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								📝 My Quizzes
							</Link>
						</nav>

						{/* Analytics Section */}
						<div className="border-t pt-4">
							<h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
								Analytics
							</h3>
							<AnalyticsWidget />
						</div>
					</div>
				</aside>

				{/* Overlay for mobile */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
						onClick={() => setIsSidebarOpen(false)}
					/>
				)}

				{/* Main Content Area */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
					{children}
				</main>
			</div>
		</div>
	);
}

function AnalyticsWidget() {
	const [stats, setStats] = useState({
		totalQuizzes: 0,
		totalQuestions: 0,
		totalAttempts: 0,
	});

	useEffect(() => {
		const fetchStats = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Get total quizzes
			const { count: quizCount } = await supabase
				.from("quizzes")
				.select("*", { count: "exact", head: true })
				.eq("created_by", user.id);

			const { data: userQuizzes } = await supabase
				.from("quizzes")
				.select("id")
				.eq("created_by", user.id);

			const quizIds = userQuizzes?.map((q) => q.id) || [];

			let questionCount = 0;
			if (quizIds.length > 0) {
				const { count } = await supabase
					.from("questions")
					.select("*", { count: "exact", head: true })
					.in("quiz_id", quizIds);

				questionCount = count || 0;
			}

			setStats({
				totalQuizzes: quizCount || 0,
				totalQuestions: questionCount,
				totalAttempts: 0, 
			});
		};

		fetchStats();
	}, []);
	return (
		<div className="space-y-3">
			<StatCard
				icon="📚"
				label="Total Quizzes"
				value={stats.totalQuizzes}
				linkTo="/dashboard/my-quizzes"
			/>
			<StatCard
				icon="❓"
				label="Total Questions"
				value={stats.totalQuestions}
				linkTo="/dashboard/create"
			/>
			<StatCard
				icon="👥"
				label="Total Attempts"
				value={stats.totalAttempts}
				linkTo="/dashboard"
			/>
		</div>
	);
}

interface StatCardProps {
	icon: string;
	label: string;
	value: number;
	linkTo: string;
}

function StatCard({ icon, label, value, linkTo }: StatCardProps) {
	return (
		<Link
			to={linkTo}
			className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
		>
			<div className="flex items-center gap-3">
				<span className="text-2xl">{icon}</span>
				<div>
					<p className="text-xs text-gray-500">{label}</p>
					<p className="text-xl font-bold text-gray-900">{value}</p>
				</div>
			</div>
		</Link>
	);
}
