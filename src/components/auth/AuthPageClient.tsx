"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import AuthForm from "../../views/Auth/AuthForm";

export default function AuthPageClient() {
	const { user } = useAuth();
	const router = useRouter();

	// Redirect if logged in
	useEffect(() => {
		if (user) {
			router.push("/dashboard");
		}
	}, [user, router]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
			{/* Back button */}
			<button
				onClick={() => router.push("/")}
				className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-20"
			>
				<svg
					className="w-5 h-5 transition-transform group-hover:-translate-x-1"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M19 12H5M5 12L12 19M5 12L12 5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span className="text-sm font-medium">Back to home</span>
			</button>

			{/* Form */}
			<div className="relative z-10 w-[90vw] max-w-md">
				<AuthForm />
			</div>
		</div>
	);
}
