import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

export function useRating(quizId: string) {
	const { user } = useAuth();
	const [currentRating, setCurrentRating] = useState<number | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user || !quizId) return;
		let mounted = true;
		supabase
			.from("quiz_ratings")
			.select("rating")
			.eq("quiz_id", quizId)
			.eq("user_id", user.id)
			.maybeSingle()
			.then(({ data }) => {
				if (mounted && data) setCurrentRating(data.rating);
			});
		return () => {
			mounted = false;
		};
	}, [quizId, user]);

	const submitRating = async (rating: number) => {
		if (!user) return;
		setLoading(true);
		setError(null);

		const { error: upsertError } = await supabase
			.from("quiz_ratings")
			.upsert(
				{ quiz_id: quizId, user_id: user.id, rating },
				{ onConflict: "quiz_id,user_id" }
			);

		if (upsertError) {
			setError(upsertError.message);
			setLoading(false);
			return false;
		}

		setCurrentRating(rating);
		setLoading(false);
		toast.success("Rating submitted!");
		return true;
	};

	return { currentRating, loading, error, submitRating };
}
