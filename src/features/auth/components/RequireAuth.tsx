"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import DashboardSkeleton from "@/features/dashboard/components/DashboardSkeleton";
import CreateQuizSkeleton from "@/features/quiz-management/components/create/CreateQuizSkeleton";
import QuizDetailSkeleton from "@/features/quiz-management/components/detail/QuizDetailSkeleton";
import { SkeletonBox } from "@/shared/ui/skeletons/SkeletonBase";
import QuizListLoading from "@/features/quiz-management/components/QuizListLoading";

interface RequireAuthProps {
	children: React.ReactNode;
}

function MyQuizzesSkeleton() {
	return (
		<div className="space-y-10 animate-pulse">
			<div className="flex justify-between items-center">
				<div className="space-y-2">
					<SkeletonBox className="h-8 w-40 rounded" />
					<SkeletonBox className="h-4 w-56 rounded" />
				</div>
				<SkeletonBox className="h-11 w-40 rounded-lg" />
			</div>
			<div className="space-y-6">
				<div>
					<SkeletonBox className="h-4 w-24 mb-4 rounded" />
					<QuizListLoading />
				</div>
				<div>
					<SkeletonBox className="h-4 w-28 mb-4 rounded" />
					<QuizListLoading />
				</div>
			</div>
		</div>
	);
}

function AuthSkeletonForPath(pathname: string) {
	if (pathname.startsWith("/dashboard/create")) return <CreateQuizSkeleton />;
	if (pathname.startsWith("/dashboard/quiz/")) return <QuizDetailSkeleton />;
	if (pathname.startsWith("/dashboard/my-quizzes")) return <MyQuizzesSkeleton />;
	return <DashboardSkeleton />;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user, initializing } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!initializing && !user) {
			router.replace("/auth");
		}
	}, [user, initializing, router]);

	if (initializing) {
		return (
			<div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
				<div className="hidden md:block w-64 shrink-0 border-r" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }} />
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					<div className="h-14 shrink-0 border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }} />
					<main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
						{AuthSkeletonForPath(pathname ?? "/dashboard")}
					</main>
				</div>
			</div>
		);
	}
	if (!user) return null;

	return <>{children}</>;
}
