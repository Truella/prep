"use client";

import { motion } from "framer-motion";
import {
  OPTION_FADE_MS,
  OPTION_STAGGER_MS,
  QUIZ_BUILD_MOCK,
} from "../../constants/quizBuildMock";
import ToolbarButton from "./ToolbarButton";
import Typewriter from "./Typewriter";

const OPTION_LABELS = ["A", "B", "C", "D"];

function CollapsedQuestion({ shouldAnimate }: { shouldAnimate: boolean }) {
  return (
    <motion.div
      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5"
      initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: OPTION_FADE_MS / 1000, ease: "easeOut" }}
    >
      <svg className="h-3.5 w-3.5 shrink-0 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      <span className="w-6 shrink-0 text-xs font-semibold text-text-secondary">Q2</span>
      <span className="min-w-0 flex-1 truncate text-xs text-text-primary">
        {QUIZ_BUILD_MOCK.secondQuestion}
      </span>
      <span className="text-[10px] text-text-secondary">1pt</span>
    </motion.div>
  );
}

export default function BuilderState({ phase }: { phase: number }) {
  const titleComplete = phase > 0;
  const questionVisible = phase >= 1;
  const questionComplete = phase > 1;
  const optionsVisible = phase >= 2;
  const secondQuestionVisible = phase >= 4;

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 border-b border-border">
        <span className="-mb-px border-b-2 border-text-primary px-3 py-1.5 text-xs font-medium text-text-primary">Build manually</span>
        <span className="px-3 py-1.5 text-xs font-medium text-text-secondary">Upload CSV</span>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">Quiz Title</label>
        <div className="h-10 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-text-primary">
          {titleComplete ? QUIZ_BUILD_MOCK.title : <Typewriter text={QUIZ_BUILD_MOCK.title} />}
          {!titleComplete && <span className="ml-0.5 animate-pulse text-sage-accent">|</span>}
        </div>
      </div>

      {questionVisible && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="text-xs font-semibold text-text-secondary">Q1</span>
            <span className="min-w-0 flex-1 text-xs text-text-primary">
              {questionComplete ? QUIZ_BUILD_MOCK.question : <Typewriter text={QUIZ_BUILD_MOCK.question} />}
            </span>
            <span className="text-[10px] text-text-secondary">1pt</span>
          </div>
          {optionsVisible && (
            <div className="space-y-2 border-t border-border px-3 pb-3 pt-2.5">
              {QUIZ_BUILD_MOCK.options.map((option, index) => {
                const isCorrect = index === QUIZ_BUILD_MOCK.correctAnswerIndex;
                return (
                  <motion.div
                    key={option}
                    className="flex items-center gap-2"
                    initial={phase === 2 ? { opacity: 0, x: -8 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: phase === 2 ? (index * OPTION_STAGGER_MS) / 1000 : 0,
                      duration: OPTION_FADE_MS / 1000,
                    }}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${isCorrect ? "border-text-primary bg-text-primary text-bg" : "border-border text-text-secondary"}`}>
                      {OPTION_LABELS[index]}
                    </span>
                    <span className="flex-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-xs text-text-primary">{option}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {secondQuestionVisible && <CollapsedQuestion shouldAnimate={phase === 4} />}
      {optionsVisible && (
        <div className="flex gap-2 pt-1">
          <ToolbarButton label="+ Add Question" target={phase === 3} />
          <ToolbarButton label="Save as Draft" target={false} />
          <ToolbarButton label="Publish" target={phase === 5} />
        </div>
      )}
    </div>
  );
}
