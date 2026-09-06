"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  QuestionIcon,
  Tick02Icon,
  DocumentAttachmentIcon,
  Time02Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

export default function HeroIconField() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* 5-7 static outline SVG icons scattered at irregular absolute positions */}
      
      {/* Icon 1: Timer/Clock */}
    <div
        className="absolute text-text-secondary"
        style={{
          top: "15%",
          left: "8%",
          opacity: 0.12,
          transform: "rotate(-10deg)",
        }}
      >
        <HugeiconsIcon icon={Clock01Icon} size={54} />
      </div>

      {/* Icon 2: Question mark */}
      <div
        className="absolute text-text-secondary"
        style={{
          top: "30%",
          right: "12%",
          opacity: 0.08,
          transform: "rotate(15deg)",
        }}
      >
        <HugeiconsIcon icon={QuestionIcon} size={48} />
      </div>

      {/* Icon 3: Checkmark */}
      <div
        className="absolute text-text-secondary"
        style={{
          bottom: "20%",
          left: "20%",
          opacity: 0.1,
          transform: "rotate(-5deg)",
        }}
      >
        <HugeiconsIcon icon={Tick02Icon} size={64} />
      </div>

      {/* Icon 4: Document/upload */}
      <div
        className="absolute text-text-secondary"
        style={{
          bottom: "35%",
          right: "22%",
          opacity: 0.09,
          transform: "rotate(12deg)",
        }}
      >
        <HugeiconsIcon icon={DocumentAttachmentIcon} size={42} />
      </div>

      {/* Icon 5: Extra Checkmark */}
      <div
        className="absolute text-text-secondary"
        style={{
          top: "65%",
          left: "45%",
          opacity: 0.11,
          transform: "rotate(-15deg)",
        }}
      >
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={36} />
      </div>
      
      {/* Icon 6: Extra Timer */}
      <div
        className="absolute text-text-secondary"
        style={{
          top: "10%",
          left: "60%",
          opacity: 0.08,
          transform: "rotate(5deg)",
        }}
      >
        <HugeiconsIcon icon={Time02Icon} size={32} />
      </div>
    </div>
  );
}
