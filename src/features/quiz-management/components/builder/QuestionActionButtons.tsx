"use client";

interface QuestionActionButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function QuestionActionButtons({
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: QuestionActionButtonsProps) {
  const btnStyle = {
    color: "var(--color-text-secondary)",
    borderColor: "var(--color-border)",
  };

  return (
    <div
      className="shrink-0 flex gap-1.5 ml-1"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="disabled:opacity-30 transition text-xs px-2 py-1 rounded border"
        style={btnStyle}
      >
        ↑
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="disabled:opacity-30 transition text-xs px-2 py-1 rounded border"
        style={btnStyle}
      >
        ↓
      </button>
      <button
        onClick={onDelete}
        className="transition text-xs px-2 py-1 rounded border border-red-500/20"
        style={{ color: "rgb(248 113 113)" }}
      >
        Delete
      </button>
    </div>
  );
}
