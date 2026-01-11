import { createClient } from "@supabase/supabase-js";
import {type Quiz } from "./types";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const quizService = {
	async createQuiz(quiz: Quiz) {
		const { data, error } = await supabase
			.from("quizzes")
			.insert({
				title: quiz.title,
				questions: quiz.questions,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},

	async getQuiz(id: string) {
		const { data, error } = await supabase
			.from("quizzes")
			.select("*")
			.eq("id", id)
			.single();

		if (error) throw error;
		return data as Quiz;
	},

	async getAllQuizzes() {
		const { data, error } = await supabase
			.from("quizzes")
			.select("id, title, created_at")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data;
	},
};
