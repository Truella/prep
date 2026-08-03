import { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import type { QuizVisibility, QuizDifficulty, QuizCategory } from "@/lib/types";

interface PublishSettings {
	visibility: QuizVisibility;
	category: QuizCategory | null;
	difficulty: QuizDifficulty | null;
}

export function usePublishQuiz(quizId: string, onSuccess: () => void) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const publish = async (settings: PublishSettings) => {
		setLoading(true);
		setError(null);

		const { error: updateError } = await supabase
			.from("quizzes")
			.update(settings)
			.eq("id", quizId);

		setLoading(false);

		if (updateError) {
			setError(updateError.message);
			toast.error("Failed to update quiz visibility");
			return;
		}

		toast.success(
			settings.visibility === "public"
				? "Quiz published to the Quiz Bank!"
				: "Quiz visibility updated"
		);
		onSuccess();
	};

	return { publish, loading, error };
}
