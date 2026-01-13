import { useState } from "react";
import { useAuth } from "../../context/AuthContext"; 
import toast from "react-hot-toast";

export default function AuthForm() {
	const { signUp, signIn } = useAuth();
	const [isSignup, setIsSignup] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isSignup) {
				await signUp(email, password);
				toast.success("Account created successfully!");
			} else {
				await signIn(email, password);
				toast.success("Logged in successfully!");
			}
		} catch (err: any) {
			toast.error(err.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-sm space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
		>
			<h2 className="text-2xl font-semibold text-gray-900 text-center">
				{isSignup ? "Create an account" : "Sign in"}
			</h2>

			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>

			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
				className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
			/>

			<button
				type="submit"
				disabled={loading}
				className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
			>
				{loading ? "Please wait..." : isSignup ? "Sign up" : "Sign in"}
			</button>

			<p className="text-center text-sm text-gray-600">
				{isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
				<button
					type="button"
					onClick={() => setIsSignup((v) => !v)}
					className="font-medium text-blue-600 hover:underline"
				>
					{isSignup ? "Sign in" : "Sign up"}
				</button>
			</p>
		</form>
	);
}
