"use client";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface OptionInputProps {
  value: string;
  index: number;
  correctIndex: number;
  onChange: (index: number, value: string) => void;
  onCorrectSelect: (index: number) => void;
}

export default function OptionInput({
  value,
  index,
  correctIndex,
  onChange,
  onCorrectSelect,
}: OptionInputProps) {
  const isCorrect = correctIndex === index;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onCorrectSelect(index)}
        className="shrink-0 w-7 h-7 rounded-full border text-xs font-bold transition"
        style={{
          backgroundColor: isCorrect ? "var(--color-text-primary)" : "transparent",
          color: isCorrect ? "var(--color-bg)" : "var(--color-text-secondary)",
          borderColor: isCorrect ? "var(--color-text-primary)" : "var(--color-border)",
        }}
      >
        {OPTION_LABELS[index]}
      </button>
      <input
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`Option ${OPTION_LABELS[index]}`}
        className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 transition text-sm"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
      />
    </div>
  );
}
