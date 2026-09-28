"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface RequireAuthProps {
	children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user, initializing } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!initializing && !user) {
			router.replace("/auth");
		}
	}, [user, initializing, router]);

	if (initializing || !user) {
		return (
			<div className="min-h-screen bg-bg flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-text-primary mb-4"></div>
					<p className="text-text-secondary">Loading...</p>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
