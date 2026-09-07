"use client";

import { useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import {
  CLICK_PRESS_MS,
  CLICK_TRAVEL_MS,
} from "../../constants/quizBuildMock";

export default function ToolbarButton({
  label,
  target,
}: {
  label: string;
  target: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const cursorScale = useMotionValue(1);
  const buttonScale = useMotionValue(1);
  const rippleOpacity = useMotionValue(0);
  const rippleScale = useMotionValue(0.4);

  useLayoutEffect(() => {
    if (!target) return;
    const cursor = cursorRef.current;
    const button = buttonRef.current;
    if (!cursor || !button) return;

    const cursorRect = cursor.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    const targetX =
      buttonRect.left + buttonRect.width / 2 - (cursorRect.left + cursorRect.width / 2);
    const targetY =
      buttonRect.top + buttonRect.height / 2 - (cursorRect.top + cursorRect.height / 2);
    const travelX = animate(cursorX, targetX, {
      duration: CLICK_TRAVEL_MS / 1000,
      ease: "easeInOut",
    });
    const travelY = animate(cursorY, targetY, {
      duration: CLICK_TRAVEL_MS / 1000,
      ease: "easeInOut",
    });
    const contactAnimations: Array<{ stop: () => void }> = [];
    let active = true;

    Promise.all([travelX, travelY]).then(() => {
      if (!active) return;
      const duration = CLICK_PRESS_MS / 1000;
      contactAnimations.push(
        animate(buttonScale, [1, 0.95, 1], { duration, times: [0, 0.5, 1] }),
        animate(cursorScale, [1, 0.72, 1], { duration, times: [0, 0.5, 1] }),
        animate(rippleOpacity, [0, 0.8, 0], { duration }),
        animate(rippleScale, [0.4, 1.6], { duration }),
      );
    });

    return () => {
      active = false;
      travelX.stop();
      travelY.stop();
      contactAnimations.forEach((animation) => animation.stop());
    };
  }, [
    buttonScale,
    cursorScale,
    cursorX,
    cursorY,
    rippleOpacity,
    rippleScale,
    target,
  ]);

  const isPublish = label === "Publish";
  return (
    <div className="relative flex-1">
      <motion.button
        ref={buttonRef}
        type="button"
        tabIndex={-1}
        className={`w-full rounded-lg px-2 py-2 text-[10px] font-semibold ${
          isPublish
            ? "bg-accent text-bg"
            : "border border-border text-text-primary"
        }`}
        style={{ scale: buttonScale }}
      >
        {label}
      </motion.button>
      {target && (
        <motion.div
          ref={cursorRef}
          aria-hidden="true"
          className="absolute -left-8 -top-10 h-3.5 w-3.5 rounded-full border-2 border-bg bg-text-primary"
          style={{ x: cursorX, y: cursorY, scale: cursorScale }}
        >
          <motion.span
            className="absolute -inset-2 rounded-full border border-accent"
            style={{ opacity: rippleOpacity, scale: rippleScale }}
          />
        </motion.div>
      )}
    </div>
  );
}
