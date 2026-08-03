"use client";

interface QuestionStatusBadgeProps {
  incomplete: boolean;
  correctLetter: string;
  correctText: string;
}

export default function QuestionStatusBadge({
  incomplete,
  correctLetter,
  correctText,
}: QuestionStatusBadgeProps) {
  if (incomplete) {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-xs font-medium">
        ⚠ Incomplete
      </span>
    );
  }

  return (
    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
      ✓ {correctLetter}: {correctText}
    </span>
  );
}
