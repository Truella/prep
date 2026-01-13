import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "./AuthForm";

export default function AuthPage() {
	const { user } = useAuth();
	const navigate = useNavigate();

	// Redirect if logged in
	useEffect(() => {
		if (user) {
			navigate("/create"); // or your dashboard page
		}
	}, [user, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<AuthForm />
		</div>
	);
}
