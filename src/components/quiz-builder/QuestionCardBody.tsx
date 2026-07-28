"use client";

import type { AppQuestion } from "../../lib/types";
import OptionInput from "./OptionInput";

const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"] as const;

interface QuestionCardBodyProps {
  question: AppQuestion;
  onChange: (updated: AppQuestion) => void;
  errors: string[];
  pointsInputId?: string;
}

export default function QuestionCardBody({
  question,
  onChange,
  errors,
  pointsInputId,
}: QuestionCardBodyProps) {
  const options = [
    question.optionA,
    question.optionB,
    question.optionC,
    question.optionD,
  ];

  const handleOptionChange = (i: number, value: string) => {
    onChange({ ...question, [OPTION_KEYS[i]]: value });
  };

  const handleCorrectSelect = (i: number) => {
    onChange({ ...question, correctIndex: i as 0 | 1 | 2 | 3 });
  };

  const inputBaseStyle = {
    backgroundColor: "var(--color-surface)",
    borderColor: "var(--color-border)",
    color: "var(--color-text-primary)",
  };

  return (
    <div className="space-y-4">
      <textarea
        value={question.questionText}
        onChange={(e) =>
          onChange({ ...question, questionText: e.target.value })
        }
        placeholder="Enter question text"
        rows={2}
        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition resize-none"
        style={inputBaseStyle}
      />

      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <OptionInput
            key={i}
            value={opt}
            index={i}
            correctIndex={question.correctIndex}
            onChange={handleOptionChange}
            onCorrectSelect={handleCorrectSelect}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor={pointsInputId} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Points:
        </label>
        <input
          id={pointsInputId}
          type="number"
          min={1}
          max={100}
          value={question.points}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            const clamped = Number.isNaN(parsed) ? 1 : Math.min(100, Math.max(1, parsed));
            onChange({ ...question, points: clamped });
          }}
          className="w-20 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-1 transition"
          style={inputBaseStyle}
        />
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Click a letter to mark the correct answer
        </span>
      </div>

      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((e, i) => (
            <li key={i} className="text-xs" style={{ color: "rgb(248 113 113)" }}>
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
