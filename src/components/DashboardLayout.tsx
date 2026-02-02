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
		<div className="min-h-screen bg-black">
			{/* Top Navigation */}
			<nav className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
				<div className="max-w-full px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Left - Logo & Menu Toggle */}
						<div className="flex items-center gap-4">
							<button
								onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition text-white"
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
							<h1 className="text-xl font-bold text-white">Quiz Dashboard</h1>
						</div>

						{/* Right - Logout Button */}
						<button
							onClick={handleLogout}
							className="px-4 py-2 text-sm font-medium text-white border border-white/20 hover:bg-white/5 rounded-lg transition"
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
            fixed lg:static inset-y-0 left-0 z-40 w-64 backdrop-blur-xl bg-white/5 border-r border-white/10 transform transition-transform duration-200 ease-in-out mt-16 lg:mt-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
				>
					<div className="h-full overflow-y-auto p-4">
						{/* Navigation Links */}
						<nav className="space-y-2 mb-6">
							<Link
								to="/dashboard"
								className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard")
										? "bg-white text-black"
										: "text-gray-300 hover:bg-white/5 hover:text-white"
								}`}
							>
								<svg
									className="w-5 h-5"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<rect
										x="3"
										y="3"
										width="7"
										height="7"
										rx="1"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<rect
										x="14"
										y="3"
										width="7"
										height="7"
										rx="1"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<rect
										x="14"
										y="14"
										width="7"
										height="7"
										rx="1"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<rect
										x="3"
										y="14"
										width="7"
										height="7"
										rx="1"
										stroke="currentColor"
										strokeWidth="2"
									/>
								</svg>
								Dashboard
							</Link>
							<Link
								to="/dashboard/create"
								className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard/create")
										? "bg-white text-black"
										: "text-gray-300 hover:bg-white/5 hover:text-white"
								}`}
							>
								<svg
									className="w-5 h-5"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M12 5V19M5 12H19"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
									/>
								</svg>
								Create Quiz
							</Link>
							<Link
								to="/dashboard/my-quizzes"
								className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
									isActive("/dashboard/my-quizzes")
										? "bg-white text-black"
										: "text-gray-300 hover:bg-white/5 hover:text-white"
								}`}
							>
								<svg
									className="w-5 h-5"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<path
										d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
										stroke="currentColor"
										strokeWidth="2"
									/>
								</svg>
								My Quizzes
							</Link>
						</nav>

						{/* Analytics Section */}
						<div className="border-t border-white/10 pt-4">
							<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
								Analytics
							</h3>
							<AnalyticsWidget />
						</div>
					</div>
				</aside>

				{/* Overlay for mobile */}
				{isSidebarOpen && (
					<div
						className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
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
				icon={
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
						<path
							d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				}
				label="Total Quizzes"
				value={stats.totalQuizzes}
				linkTo="/dashboard/my-quizzes"
			/>
			<StatCard
				icon={
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<path
							d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M12 17H12.01"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				}
				label="Total Questions"
				value={stats.totalQuestions}
				linkTo="/dashboard/create"
			/>
			<StatCard
				icon={
					<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
						<path
							d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle
							cx="9"
							cy="7"
							r="4"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				}
				label="Total Attempts"
				value={stats.totalAttempts}
				linkTo="/dashboard"
			/>
		</div>
	);
}

interface StatCardProps {
	icon: React.ReactNode;
	label: string;
	value: number;
	linkTo: string;
}

function StatCard({ icon, label, value, linkTo }: StatCardProps) {
	return (
		<Link
			to={linkTo}
			className="block p-3 backdrop-blur-sm bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition group"
		>
			<div className="flex items-center gap-3">
				<div className="text-gray-400 group-hover:text-white transition">
					{icon}
				</div>
				<div>
					<p className="text-xs text-gray-400">{label}</p>
					<p className="text-xl font-bold text-white">{value}</p>
				</div>
			</div>
		</Link>
	);
}
