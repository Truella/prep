export interface Question {
	text: string;
	options: string[];
	correctIndex: number;
	points: number;
}

export interface Quiz {
	id?: string;
	created_at?: string;
	title: string;
	questions: Question[];
}

export interface QuizSubmission {
	quizId: string;
	answers: number[];
	score?: number;
	totalPoints?: number;
}
