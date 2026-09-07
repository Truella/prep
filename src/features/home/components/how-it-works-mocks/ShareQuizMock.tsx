"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function ShareQuizMock() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="w-full max-w-[320px] mx-auto h-[200px] bg-surface-raised rounded-xl p-4 overflow-hidden relative shadow-sm flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 rounded-full bg-amber-accent text-bg flex items-center justify-center font-bold text-lg mb-3">✓</div>
      <div className="text-sm font-medium mb-4">Quiz Published Successfully!</div>
      
      <div className="flex items-center w-full max-w-[240px] bg-surface rounded-lg overflow-hidden">
        <div className="px-3 py-2 text-xs text-text-secondary truncate flex-1 text-left bg-surface-raised">prep.app/q/8f2a...</div>
        <motion.div 
          animate={phase === 1 ? { scale: [1, 0.9, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className="px-3 py-2 bg-amber-accent text-bg text-xs font-semibold"
        >
          Copy
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 bg-surface text-text-primary text-xs px-3 py-1.5 rounded-full shadow-md border border-border"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
