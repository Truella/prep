"use client";

import { useState } from "react";
import { parseAndValidateCSV } from "../../utils/csvParser";
import { generateCSV } from "../../utils/csvGenerator";
import type { AppQuestion } from "../../lib/types";

const EXAMPLE_CSV = `Question,Option_A,Option_B,Option_C,Option_D,Correct_Answer,Points
What is the capital of France?,London,Paris,Berlin,Rome,B,1
What is 2 + 2?,3,4,5,6,B,1`;

const EXAMPLE_QUESTIONS: AppQuestion[] = [
  {
    id: "ex1",
    quizId: "",
    order: 0,
    points: 1,
    correctIndex: 1,
    questionText: "What is the capital of France?",
    optionA: "London",
    optionB: "Paris",
    optionC: "Berlin",
    optionD: "Rome",
  },
  {
    id: "ex2",
    quizId: "",
    order: 1,
    points: 1,
    correctIndex: 1,
    questionText: "What is 2 + 2?",
    optionA: "3",
    optionB: "4",
    optionC: "5",
    optionD: "6",
  },
];

const COLUMNS = [
  { name: "Question", required: true, notes: "The question text" },
  { name: "Option_A", required: true, notes: "Answer choice A" },
  { name: "Option_B", required: true, notes: "Answer choice B" },
  { name: "Option_C", required: true, notes: "Answer choice C" },
  { name: "Option_D", required: true, notes: "Answer choice D" },
  { name: "Correct_Answer", required: true, notes: "Must be A, B, C, or D (case-insensitive)" },
  { name: "Points", required: false, notes: "Integer point value, defaults to 1" },
];

export default function CSVGuide() {
  const [csvInput, setCsvInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_CSV);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  const handleDownload = () => {
    const csv = generateCSV(EXAMPLE_QUESTIONS);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prep-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    const file = new File([csvInput], "validate.csv", { type: "text/csv" });
    const result = await parseAndValidateCSV(file);
    setValidationResult(
      result.success
        ? {
            ok: true,
            message: `Valid! ${result.data.length} question${result.data.length !== 1 ? "s" : ""} found.`,
          }
        : { ok: false, message: result.message },
    );
  };

  return (
    <div className="space-y-10">
      <div>
        <h1
          className="text-3xl font-bold mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          CSV Guide
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Upload questions as a CSV file. The file must have a header row with
          these exact column names.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{
            fontFamily: "var(--font-ui)",
          }}
        >
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <th
                className="text-left py-2 pr-4 font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Column
              </th>
              <th
                className="text-left py-2 pr-4 font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Required
              </th>
              <th
                className="text-left py-2 font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {COLUMNS.map((col) => (
              <tr
                key={col.name}
                className="border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <td
                  className="py-2 pr-4"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {col.name}
                </td>
                <td
                  className="py-2 pr-4"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {col.required ? "Yes" : "No"}
                </td>
                <td
                  className="py-2"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {col.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Example CSV
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg border text-sm transition"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              {copyFailed ? "Failed" : copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg border text-sm transition"
              style={{
                backgroundColor: "var(--color-surface-raised)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Download sample
            </button>
          </div>
        </div>
        <pre
          className="p-4 rounded-2xl border text-xs overflow-x-auto"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {EXAMPLE_CSV}
        </pre>
      </div>

      <div className="space-y-3">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Validate your CSV
        </h2>
        <label
          htmlFor="csv-input"
          className="text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Paste your CSV below to check it before uploading.
        </label>
        <textarea
          id="csv-input"
          value={csvInput}
          onChange={(e) => {
            setCsvInput(e.target.value);
            setValidationResult(null);
          }}
          placeholder="Paste CSV content here..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl text-sm resize-none transition"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        />
        <button
          onClick={handleValidate}
          disabled={!csvInput.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "#0A0A0F",
          }}
        >
          Validate
        </button>
        {validationResult && (
          <p
            aria-live="polite"
            className="text-sm font-medium"
            style={{
              color: validationResult.ok
                ? "var(--color-accent)"
                : "#EF4444",
            }}
          >
            {validationResult.message}
          </p>
        )}
      </div>
    </div>
  );
}