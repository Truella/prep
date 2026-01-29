// App.tsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import MyQuizzes from "./pages/Quizzes";
import { RequireAuth } from "./components/RequireAuth";
import AuthPage from "./pages/Auth/Auth";
import DashboardLayout from "./components/DashboardLayout";
import { Toaster } from "react-hot-toast";

function App() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Toaster position="top-right" reverseOrder={false} />
			<Routes>
				{/* Public routes */}
				<Route path="/" element={<Home />} />
				<Route path="/auth" element={<AuthPage />} />
				<Route path="/quiz/:quizId" element={<TakeQuiz />} />
				<Route path="/results" element={<Results />} />

				{/* Protected dashboard routes */}
				<Route
					path="/dashboard"
					element={
						<RequireAuth>
							<DashboardLayout>
								<Dashboard />
							</DashboardLayout>
						</RequireAuth>
					}
				/>
				<Route
					path="/dashboard/create"
					element={
						<RequireAuth>
							<DashboardLayout>
								<CreateQuiz />
							</DashboardLayout>
						</RequireAuth>
					}
				/>
				<Route
					path="/dashboard/my-quizzes"
					element={
						<RequireAuth>
							<DashboardLayout>
								<MyQuizzes />
							</DashboardLayout>
						</RequireAuth>
					}
				/>

				<Route
					path="*"
					element={<p className="text-center mt-10">Page not found</p>}
				/>
			</Routes>
		</div>
	);
}

export default App;
