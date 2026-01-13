import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import Results from "./pages/Results";
import { RequireAuth } from "./components/RequireAuth";
import AuthPage from "./pages/Auth/Auth";

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				<Routes>
					{/* Protected route */}
					<Route
						path="/create"
						element={
							<RequireAuth>
								<CreateQuiz />
							</RequireAuth>
						}
					/>

					{/* Public routes */}
					<Route path="/" element={<Home />} />
					<Route path="/auth" element={<AuthPage/>} />
					<Route path="/quiz/:id" element={<TakeQuiz />} />
					<Route path="/results" element={<Results />} />
					<Route
						path="*"
						element={<p className="text-center mt-10">Page not found</p>}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
