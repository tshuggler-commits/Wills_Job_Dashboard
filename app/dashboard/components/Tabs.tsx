"use client";

interface TabsProps {
  active: "review" | "pipeline";
  onChange: (tab: "review" | "pipeline") => void;
  unreadCount: number;
  pursuingCount: number;
}

export default function Tabs({
  active,
  onChange,
  unreadCount,
  pursuingCount,
}: TabsProps) {
  const tabs = [
    { id: "review" as const, label: "Review", badge: unreadCount },
    { id: "pipeline" as const, label: "Pipeline", badge: pursuingCount },
  ];

  return (
    <div className="flex bg-surface-alt rounded-std p-[3px] mb-4 border border-border">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-2 border-none rounded-md text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
            active === t.id
              ? "bg-surface text-text-primary shadow-sm"
              : "bg-transparent text-text-tertiary"
          }`}
        >
          {t.label}
          {t.badge > 0 && (
            <span
              className={`text-[11px] text-white rounded-md px-1.5 py-px font-bold ${
                t.id === "review" ? "bg-green" : "bg-text-primary"
              }`}
            >
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
