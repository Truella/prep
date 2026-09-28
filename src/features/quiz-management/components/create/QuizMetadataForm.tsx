"use client";

import TimeLimitInput from "../builder/TimeLimitInput";

interface QuizMetadataFormProps {
  title: string;
  description: string;
  timeLimit: number | null;
  quizId: string | undefined;
  isCreatingQuiz: boolean;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setTimeLimit: (minutes: number | null) => void;
  createQuiz: () => void;
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 120;

export default function QuizMetadataForm({
  title,
  description,
  timeLimit,
  quizId,
  isCreatingQuiz,
  setTitle,
  setDescription,
  setTimeLimit,
  createQuiz,
}: QuizMetadataFormProps) {
  const inputBaseStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="quiz-title" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Quiz Title
        </label>
        <input
          id="quiz-title"
          type="text"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
          disabled={!!quizId}
          maxLength={TITLE_LIMIT}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={inputBaseStyle}
        />
        <div className="mt-1.5 flex justify-end">
          <span className="text-xs" style={{ color: title.length >= TITLE_LIMIT ? "var(--color-incorrect)" : "var(--color-text-secondary)" }}>
            {title.length}/{TITLE_LIMIT}
          </span>
        </div>
      </div>
      <div>
        <label htmlFor="quiz-description" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Description
        </label>
        <textarea
          id="quiz-description"
          placeholder="Enter quiz description"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
          disabled={!!quizId}
          rows={3}
          maxLength={DESCRIPTION_LIMIT}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          style={inputBaseStyle}
        />
        <div className="mt-1.5 flex justify-end">
          <span className="text-xs" style={{ color: description.length >= DESCRIPTION_LIMIT ? "var(--color-incorrect)" : "var(--color-text-secondary)" }}>
            {description.length}/{DESCRIPTION_LIMIT}
          </span>
        </div>
      </div>
      <TimeLimitInput value={timeLimit} onChange={setTimeLimit} disabled={!!quizId} />
      {!quizId && (
        <button
          onClick={createQuiz}
          disabled={isCreatingQuiz}
          className="w-full px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
        >
          {isCreatingQuiz ? "Creating..." : "Create Quiz"}
        </button>
      )}
    </div>
  );
}
