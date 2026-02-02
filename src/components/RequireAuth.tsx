
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

interface RequireAuthProps {
	children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user} = useAuth();

	if (!user) {
		return <Navigate to="/auth" replace />;
	}

	return children;
}
