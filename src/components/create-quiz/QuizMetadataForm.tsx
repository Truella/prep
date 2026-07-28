"use client";

import TimeLimitInput from "../quiz-builder/TimeLimitInput";

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
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Quiz Title
        </label>
        <input
          type="text"
          placeholder="Enter quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!!quizId}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={inputBaseStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
          Description
        </label>
        <textarea
          placeholder="Enter quiz description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!!quizId}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          style={inputBaseStyle}
        />
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
