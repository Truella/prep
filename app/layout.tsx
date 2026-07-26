import type { Metadata } from "next";
import { AuthProvider } from "../src/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../src/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "PREP — Quiz Builder & Study Tool",
		template: "%s — PREP",
	},
	description:
		"Create and share multiple-choice quizzes. Build manually or upload a CSV. Get AI-powered performance reviews.",
	openGraph: {
		type: "website",
		siteName: "PREP",
		title: "PREP — Quiz Builder & Study Tool",
		description:
			"Create and share multiple-choice quizzes. Build manually or upload a CSV.",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-gray-50">
				<AuthProvider>
					<Toaster position="top-right" reverseOrder={false} />
					<ErrorBoundary>{children}</ErrorBoundary>
				</AuthProvider>
			</body>
		</html>
	);
}
