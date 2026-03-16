"use client";

export type Screen = "today" | "review" | "pipeline";

interface BottomNavProps {
  active: Screen;
  onChange: (screen: Screen) => void;
  onAddJob: () => void;
  unreadCount: number;
  pursuingCount: number;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a1a1a" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a1a1a" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function LayersIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a1a1a" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-2.5 bg-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function BottomNav({
  active,
  onChange,
  onAddJob,
  unreadCount,
  pursuingCount,
}: BottomNavProps) {
  const items: {
    id: Screen | "add";
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: "today", label: "Today", icon: <HomeIcon active={active === "today"} /> },
    { id: "review", label: "Review", icon: <InboxIcon active={active === "review"} />, badge: unreadCount },
    { id: "pipeline", label: "Pipeline", icon: <LayersIcon active={active === "pipeline"} />, badge: pursuingCount },
    { id: "add", label: "Add", icon: <PlusIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-surface border-t border-border">
      <div className="max-w-app mx-auto flex h-14">
        {items.map((item) => {
          const isActive = item.id !== "add" && active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "add") {
                  onAddJob();
                } else {
                  onChange(item.id);
                }
              }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer relative"
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-text-primary rounded-b" />
              )}
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && <Badge count={item.badge} />}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-text-primary" : "text-text-tertiary"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
