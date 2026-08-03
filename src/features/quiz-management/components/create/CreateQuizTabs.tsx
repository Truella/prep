"use client";

type Tab = "build" | "csv";

interface CreateQuizTabsProps {
  activeTab: Tab;
  onTabSwitch: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "build", label: "Build manually" },
  { id: "csv", label: "Upload CSV" },
];

export default function CreateQuizTabs({
  activeTab,
  onTabSwitch,
}: CreateQuizTabsProps) {
  return (
    <div className="flex gap-2 border-b" style={{ borderColor: "var(--color-border)" }}>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onTabSwitch(t.id)}
          className="px-4 py-2 text-sm font-medium transition border-b-2 -mb-px"
          style={{
            color: activeTab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            borderColor: activeTab === t.id ? "var(--color-text-primary)" : "transparent",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
