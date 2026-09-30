import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { BYPASS_AUTH } from "@/features/auth/context/AuthContext";
import { updateLocalQuiz } from "@/features/quiz-management/utils/localQuizStore";
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

		// TEMP (Supabase paused): update locally when bypassing auth.
		if (BYPASS_AUTH) {
			updateLocalQuiz(quizId, settings);
			setLoading(false);
			toast.success(
				settings.visibility === "public"
					? "Quiz published to the Quiz Bank!"
					: "Quiz visibility updated"
			);
			onSuccess();
			return;
		}
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
