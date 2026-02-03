import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import type { QuizDraft, PreviewQuestion } from "../lib/types";
import React from "react";
import { parseAndValidateCSV } from "./csvParser";
export const handleCreateQuiz = async (
	quiz: QuizDraft,
	setIsCreatingQuiz: React.Dispatch<React.SetStateAction<boolean>>,
	setQuiz: React.Dispatch<React.SetStateAction<QuizDraft >>,
) => {
	if (!quiz.title.trim()) {
		toast.error("Quiz title is required");
		return;
	}
	setIsCreatingQuiz(true);
	const { data: userData, error: userError } = await supabase.auth.getUser();
	if (userError) {
		toast.error("Failed to get user session");
		setIsCreatingQuiz(false);
		return;
	}
	const userId = userData?.user?.id;
	if (!userId) {
		toast.error("You must be logged in to create a quiz");
		setIsCreatingQuiz(false);
		return;
	}
	const { data, error } = await supabase
		.from("quizzes")
		.insert({
			title: quiz.title,
			description: quiz.description,
			created_by: userId,
		})
		.select()
		.single();
	setIsCreatingQuiz(false);
	if (error) {
		console.log("Supabase insert error:", error);
		toast.error("Failed to create quiz. Check console for details.");
		return;
	}
	if (!data?.id) {
		toast.error("Quiz creation failed, no ID returned");
		return;
	}
	setQuiz((prev) => ({ ...prev, id: data.id }));
	toast.success("Quiz created! Now upload questions.");
};

export const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>, setQuestions: React.Dispatch<React.SetStateAction<PreviewQuestion[]>>) => {
	const file = e.target.files?.[0];
	if (!file) return;

	if (file.type !== "text/csv") {
		toast.error("Please upload a valid CSV file");
		return;
	}
	parseAndValidateCSV(file)
		.then((result) => {
			if (!result.success) {
				toast.error(result.message);
				return;
			}
			const parsed = result.data.map((row) => ({
				text: row.Question,
				options: [row.Option_A, row.Option_B, row.Option_C, row.Option_D],
				answer: row.Correct_Answer,
				points: parseInt(row.Points),
			}));
			setQuestions(parsed);
			toast.success(`${parsed.length} questions loaded`);
		})
		.catch(() => {
			toast.error("Failed to parse CSV");
		});
};

export const handleUploadQuestions = async (quiz: QuizDraft, questions: PreviewQuestion[], setIsUploadingQuestions: React.Dispatch<React.SetStateAction<boolean>>, setShareableLink: React.Dispatch<React.SetStateAction<string | null>>) => {
	if (!quiz.id || questions.length === 0) {
		toast.error("Quiz ID missing or no questions to upload");
		return;
	}
	setIsUploadingQuestions(true);
	const payload = questions.map((q) => ({
		quiz_id: quiz.id,
		Question: q.text,
		Option_A: q.options[0],
		Option_B: q.options[1],
		Option_C: q.options[2],
		Option_D: q.options[3],
		Correct_Answer: q.answer,
		Points: q.points || 1,
	}));
	const { error } = await supabase.from("questions").insert(payload);
	setIsUploadingQuestions(false);
	if (error) {
		console.log("Full error:", error);
		toast.error(`Failed to save questions: ${error.message}`);
		return;
	}

	// Generate shareable link
	const quizLink = `${window.location.origin}/quiz/${quiz.id}`;
	setShareableLink(quizLink);

	// Copy to clipboard
	navigator.clipboard.writeText(quizLink);

	toast.success("Quiz published! Link copied to clipboard.");
};
