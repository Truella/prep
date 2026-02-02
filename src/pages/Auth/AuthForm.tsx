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
			className=" backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
		>
			{/* Icon */}
			<div className="mx-auto w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-2">
				<svg
					className="w-8 h-8 text-white"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>

			<div className="text-center">
				<h2 className="text-3xl font-bold text-white mb-2">
					{isSignup ? "Create Account" : "Welcome Back"}
				</h2>
				<p className="text-gray-400 text-sm">
					{isSignup ? "Sign up to get started" : "Sign in to continue"}
				</p>
			</div>

			<div className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Email
					</label>
					<input
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-300 mb-2">
						Password
					</label>
					<input
						type="password"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
			>
				{loading ? (
					<span className="flex items-center justify-center gap-2">
						<svg
							className="animate-spin h-5 w-5"
							viewBox="0 0 24 24"
							fill="none"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						Please wait...
					</span>
				) : (
					<span>{isSignup ? "Create Account" : "Sign In"}</span>
				)}
			</button>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-white/10" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 bg-black/50 text-gray-400">
						{isSignup ? "Already have an account?" : "Don't have an account?"}
					</span>
				</div>
			</div>

			<button
				type="button"
				onClick={() => setIsSignup((v) => !v)}
				className="w-full px-6 py-3 rounded-xl border border-white/20 text-white font-medium backdrop-blur-sm hover:bg-white/5 transition-all"
			>
				{isSignup ? "Sign In Instead" : "Create Account"}
			</button>
		</form>
	);
}
