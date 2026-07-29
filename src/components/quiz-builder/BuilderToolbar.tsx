"use client";

interface BuilderToolbarProps {
  onAdd: () => void;
  onSaveAsDraft: () => void;
  onPublish: () => void;
  isUploading: boolean;
  quizId?: string;
}

export default function BuilderToolbar({
  onAdd,
  onSaveAsDraft,
  onPublish,
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
        onClick={onSaveAsDraft}
        disabled={isUploading || !quizId}
        className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
      >
        {isUploading ? "Saving..." : "Save as Draft"}
      </button>
      <button
        onClick={onPublish}
        disabled={isUploading || !quizId}
        className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        style={{ backgroundColor: "var(--color-accent)", color: "#0A0A0F" }}
      >
        Publish
      </button>
    </div>
  );
}
