"use client";

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, info);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;
			return (
				<div className="min-h-screen bg-black flex items-center justify-center px-4">
					<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
						<h2 className="text-2xl font-bold text-white">
							Something went wrong
						</h2>
						<p className="text-gray-400">
							An unexpected error occurred. Please reload the page.
						</p>
						<button
							onClick={() => window.location.reload()}
							className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition"
						>
							Reload
						</button>
					</div>
				</div>
			);
		}
		return this.props.children;
	}
}
