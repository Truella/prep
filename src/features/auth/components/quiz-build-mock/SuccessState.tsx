"use client";

import { useEffect, useState } from "react";
import { QUIZ_BUILD_MOCK } from "../../constants/quizBuildMock";

export default function SuccessState() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setCopied(true), 700);
    const hideTimer = window.setTimeout(() => setCopied(false), 1500);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-amber-accent/25 bg-amber-surface p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-amber-accent/15 p-2 text-amber-accent">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Quiz Published Successfully!</h3>
          <p className="mt-1 text-xs text-text-secondary">Share this link with students to take the quiz</p>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1 truncate rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-text-primary">
          {QUIZ_BUILD_MOCK.shareableLink}
        </div>
        <button type="button" tabIndex={-1} className="flex items-center gap-1 rounded-xl bg-text-primary px-3 py-2 text-xs font-semibold text-bg">
          {copied && <span aria-hidden="true">✓</span>}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-amber-accent/25 pt-4">
        <p className="text-xs text-text-secondary">
          Share code: <span className="ml-1 font-mono font-bold text-text-primary">{QUIZ_BUILD_MOCK.shareCode}</span>
        </p>
        <button type="button" tabIndex={-1} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-primary">Copy code</button>
      </div>
    </div>
  );
}
