"use client";

interface BuilderToolbarProps {
  onAdd: () => void;
  onSubmit: () => void;
  isUploading: boolean;
  quizId?: string;
}

export default function BuilderToolbar({
  onAdd,
  onSubmit,
  isUploading,
  quizId,
}: BuilderToolbarProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onAdd}
        className="flex-1 px-4 py-3 rounded-xl border transition font-medium text-sm"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
      >
        + Add Question
      </button>
      <button
        onClick={onSubmit}
        disabled={isUploading || !quizId}
        className="flex-1 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        style={{ backgroundColor: "var(--color-text-primary)", color: "var(--color-bg)" }}
      >
        {isUploading ? "Publishing..." : "Publish Quiz"}
      </button>
    </div>
  );
}
