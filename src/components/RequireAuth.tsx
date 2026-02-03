import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

interface RequireAuthProps {
	children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user, initializing } = useAuth();
	if (initializing) {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
					<p className="text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}
	if (!user) {
		return <Navigate to="/auth" replace />;
	}

	return children;
}
