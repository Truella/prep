"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileUploadIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

export default function CSVImportMock() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2300);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="w-full max-w-[360px] mx-auto h-[240px] border border-border bg-surface-raised rounded-2xl p-5 overflow-hidden relative shadow-sm flex flex-col justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex flex-col justify-center"
        >
          {phase === 0 && (
            <div className="space-y-3 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent-dim flex items-center justify-center">
                <HugeiconsIcon
                  icon={FileUploadIcon}
                  size={24}
                  className="text-accent"
                />
              </div>
              <div className="text-sm font-medium text-text-primary">
                question_bank.csv
              </div>
              <div className="ml-auto text-xs text-text-secondary font-mono truncate max-w-full">
                Question, Option_A, Option_B, Option_C, Option_D, Correct_Answer
              </div>
            </div>
          )}
          {phase === 1 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-text-primary">
                Parsing and validating columns...
              </div>
              <div className="h-2 w-full bg-border rounded overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-accent"
                />
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Checking headers against Question / Option_A-D / Correct_Answer / Points
              </div>
            </div>
          )}
          {phase === 2 && (
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-accent text-bg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
              </div>
              <div className="text-sm font-medium text-text-primary">
                24 questions imported
              </div>
              <div className="text-xs text-text-secondary">
                Ready to build into a quiz
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}