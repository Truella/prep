import type { Metadata } from "next";
import { AuthProvider } from "../src/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../src/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
	title: "Prep - Quiz Builder",
	description: "Create, upload, and share quizzes effortlessly.",
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
