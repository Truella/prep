import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import Results from "./pages/Results";

function App() {
	return (
		<Router>
			<div className="min-h-screen bg-gray-50">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/create" element={<CreateQuiz />} />
					<Route path="/quiz/:id" element={<TakeQuiz />} />
					<Route path="/results" element={<Results />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
