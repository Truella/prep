"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function TimerSettingsMock() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <div className="w-full max-w-[320px] mx-auto h-[200px] bg-surface-raised rounded-xl p-4 overflow-hidden relative shadow-sm flex flex-col justify-center">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Time Limit</span>
          <div className="flex items-center gap-1 border border-border rounded px-2 py-1 bg-surface w-16 h-7 overflow-hidden">
            <AnimatePresence mode="wait">
              {phase > 0 ? (
                <motion.span 
                  key="filled"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-mono"
                >
                  30
                </motion.span>
              ) : (
                <motion.span key="empty" className="text-sm text-text-secondary opacity-50">--</motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Visibility</span>
          <div className="flex flex-col gap-2">
            <div className={`p-2 rounded border flex items-center gap-2 transition-colors duration-300 ${phase < 2 ? 'border-coral-accent bg-coral-surface' : 'border-border bg-surface'}`}>
              <div className={`w-3 h-3 rounded-full border ${phase < 2 ? 'border-coral-accent bg-coral-accent' : 'border-border'}`} />
              <div className="text-xs font-medium">Private</div>
            </div>
            <div className={`p-2 rounded border flex items-center gap-2 transition-colors duration-300 ${phase >= 2 ? 'border-coral-accent bg-coral-surface' : 'border-border bg-surface'}`}>
              <div className={`w-3 h-3 rounded-full border ${phase >= 2 ? 'border-coral-accent bg-coral-accent' : 'border-border'}`} />
              <div className="text-xs font-medium">Public</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
