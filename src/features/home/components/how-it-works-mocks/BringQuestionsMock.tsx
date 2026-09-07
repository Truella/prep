"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function BringQuestionsMock() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="w-full max-w-[320px] mx-auto h-[200px] bg-surface-raised rounded-xl p-4 overflow-hidden relative shadow-sm">
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
            <div className="space-y-3">
              <div className="h-4 w-2/3 bg-border rounded" />
              <div className="h-8 w-full border border-dashed border-border rounded-lg flex items-center justify-center text-xs text-text-secondary">Drag & Drop CSV</div>
            </div>
          )}
          {phase === 1 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Parsing questions...</div>
              <div className="h-2 w-full bg-border rounded overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 2 }}
                  className="h-full bg-sage-accent"
                />
              </div>
            </div>
          )}
          {phase === 2 && (
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-8 h-8 rounded-full bg-sage-accent text-bg flex items-center justify-center font-bold">✓</div>
              <div className="text-sm font-medium">24 questions imported</div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
