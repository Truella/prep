
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

interface RequireAuthProps {
	children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return <p className="text-center mt-10">Loading...</p>; 
	}

	if (!user) {
		return <Navigate to="/auth" replace />;
	}

	return children;
}
