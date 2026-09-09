"use client";

import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  QuestionIcon,
  Tick02Icon,
  DocumentAttachmentIcon,
  Time02Icon,
  CheckmarkCircle01Icon,
  FileEditIcon,
  CheckListIcon,
  TaskEdit01Icon,
  CheckmarkCircle02Icon,
  FileUploadIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

interface FieldIcon {
  label: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  colorClass: string;
  size: number;
  opacity: number;
  rotate: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

// Static outline SVG icons scattered at irregular absolute positions.
// Muted by design: quiet preview of the section-hue palette, no animation.
const FIELD_ICONS: FieldIcon[] = [
  { label: "Clock", icon: Clock01Icon, colorClass: "text-sage-accent", size: 54, opacity: 0.18, rotate: "-10deg", position: { top: "15%", left: "8%" } },
  { label: "Question", icon: QuestionIcon, colorClass: "text-coral-accent", size: 48, opacity: 0.15, rotate: "15deg", position: { top: "30%", right: "12%" } },
  { label: "Checkmark", icon: Tick02Icon, colorClass: "text-sky-accent", size: 64, opacity: 0.22, rotate: "-5deg", position: { bottom: "20%", left: "20%" } },
  { label: "Document", icon: DocumentAttachmentIcon, colorClass: "text-amber-accent", size: 42, opacity: 0.16, rotate: "12deg", position: { bottom: "35%", right: "22%" } },
  { label: "Checkmark circle", icon: CheckmarkCircle01Icon, colorClass: "text-magenta-accent", size: 36, opacity: 0.2, rotate: "-15deg", position: { top: "65%", left: "45%" } },
  { label: "Timer", icon: Time02Icon, colorClass: "text-teal-accent", size: 32, opacity: 0.17, rotate: "5deg", position: { top: "10%", left: "60%" } },
  { label: "File edit", icon: FileEditIcon, colorClass: "text-sage-accent", size: 40, opacity: 0.19, rotate: "8deg", position: { top: "52%", right: "5%" } },
  { label: "Checklist", icon: CheckListIcon, colorClass: "text-coral-accent", size: 44, opacity: 0.16, rotate: "-12deg", position: { bottom: "10%", left: "8%" } },
  { label: "Task edit", icon: TaskEdit01Icon, colorClass: "text-sky-accent", size: 30, opacity: 0.15, rotate: "10deg", position: { top: "6%", left: "38%" } },
  { label: "Checkmark circle alt", icon: CheckmarkCircle02Icon, colorClass: "text-amber-accent", size: 46, opacity: 0.18, rotate: "-8deg", position: { bottom: "12%", right: "8%" } },
  { label: "File upload", icon: FileUploadIcon, colorClass: "text-magenta-accent", size: 34, opacity: 0.16, rotate: "12deg", position: { top: "42%", left: "2%" } },
  { label: "Plus", icon: PlusSignIcon, colorClass: "text-teal-accent", size: 38, opacity: 0.2, rotate: "-6deg", position: { bottom: "6%", right: "32%" } },
];

export default function HeroIconField({ sparse = false }: { sparse?: boolean }) {
  const icons = sparse
    ? FIELD_ICONS.filter((icon) =>
        ["Clock", "Question", "Checklist", "Checkmark circle alt", "Timer", "File upload"].includes(icon.label),
      ).map((icon) => ({ ...icon, opacity: Math.min(icon.opacity, 0.12) }))
    : FIELD_ICONS;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {icons.map(({ label, icon, colorClass, size, opacity, rotate, position }) => (
        <div
          key={label}
          className={`absolute ${colorClass}`}
          style={{
            ...position,
            opacity,
            transform: `rotate(${rotate})`,
          }}
        >
          <HugeiconsIcon icon={icon} size={size} />
        </div>
      ))}
    </div>
  );
}
