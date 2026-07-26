"use client";

import { useState } from "react";
import { useRating } from "../../hooks/useRating";
import { useAuth } from "../../hooks/useAuth";

export default function RatingWidget({ quizId }: { quizId: string }) {
	const { user } = useAuth();
	const { currentRating, loading, submitRating } = useRating(quizId);
	const [hovered, setHovered] = useState<number | null>(null);
	const [submitted, setSubmitted] = useState(false);

	if (!user) {
		return (
			<p className="text-sm text-gray-400">Sign in to rate this quiz</p>
		);
	}

	if (submitted || currentRating !== null) {
		return (
			<p className="text-sm text-gray-400">
				Your rating:{" "}
				{"★".repeat(currentRating ?? 0)}
				{"☆".repeat(5 - (currentRating ?? 0))}{" "}
				Thanks!
			</p>
		);
	}

	return (
		<div className="flex items-center gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					disabled={loading}
					onClick={async () => {
						const success = await submitRating(star);
						if (success) setSubmitted(true);
					}}
					onMouseEnter={() => setHovered(star)}
					onMouseLeave={() => setHovered(null)}
					className="text-2xl transition disabled:cursor-not-allowed"
				>
					<span
						className={
							(hovered ?? currentRating ?? 0) >= star
								? "text-yellow-400"
								: "text-gray-600"
						}
					>
						★
					</span>
				</button>
			))}
		</div>
	);
}
