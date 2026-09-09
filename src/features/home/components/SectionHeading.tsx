import type { CSSProperties, ReactNode } from "react";

export type HeadingAccent =
  | "sage"
  | "coral"
  | "sky"
  | "amber"
  | "magenta"
  | "teal"
  | "neutral";

const ACCENT_VAR: Record<HeadingAccent, string> = {
  sage: "var(--color-sage-accent)",
  coral: "var(--color-coral-accent)",
  sky: "var(--color-sky-accent)",
  amber: "var(--color-amber-accent)",
  magenta: "var(--color-magenta-accent)",
  teal: "var(--color-teal-accent)",
  neutral: "var(--color-text-primary)",
};

type Props = {
  children: ReactNode;
  accent?: HeadingAccent;
  eyebrow?: string;
  className?: string;
  as?: "h1" | "h2";
};

/**
 * Section heading with Fraunces display font + one accent word.
 * Usage: wrap the accent word in <em>:
 *   <SectionHeading accent="sky">... what to do <em>next.</em></SectionHeading>
 * The <em> picks up the section hue via --heading-accent (see globals.css).
 */
export default function SectionHeading({
  children,
  accent = "neutral",
  eyebrow,
  className = "text-4xl md:text-5xl leading-tight",
  as = "h2",
}: Props) {
  const Tag = as;
  return (
    <div>
      {eyebrow ? (
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: ACCENT_VAR[accent] }}
        >
          {eyebrow}
        </p>
      ) : null}
      <Tag
        className={`section-heading text-text-primary ${className}`}
        style={
          {
            fontFamily: "var(--font-display)",
            "--heading-accent": ACCENT_VAR[accent],
          } as CSSProperties
        }
      >
        {children}
      </Tag>
    </div>
  );
}
