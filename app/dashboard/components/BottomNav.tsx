"use client";

export type Screen = "today" | "review" | "pipeline" | "ask";

interface BottomNavProps {
  active: Screen;
  onChange: (screen: Screen) => void;
  onAddJob: () => void;
  unreadCount: number;
  pursuingCount: number;
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#1a4b58" : "none"} stroke={active ? "#1a4b58" : "#8a8580"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" stroke={active ? "#ffffff" : "#8a8580"} />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a4b58" : "#8a8580"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  );
}

function LayersIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a4b58" : "#8a8580"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1a4b58" : "#8a8580"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </div>
  );
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 -right-3 bg-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none shadow-sm">
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
    { id: "add", label: "Add", icon: <PlusIcon /> },
    { id: "pipeline", label: "Pipeline", icon: <LayersIcon active={active === "pipeline"} />, badge: pursuingCount },
    { id: "ask", label: "Ask", icon: <ChatIcon active={active === "ask"} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bottom-nav shadow-nav">
      <div className="max-w-app mx-auto flex h-16 items-center">
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
              className="flex-1 flex flex-col items-center justify-center gap-1 bg-transparent border-none cursor-pointer relative py-2"
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && <Badge count={item.badge} />}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  item.id === "add"
                    ? "text-teal"
                    : isActive
                    ? "text-teal"
                    : "text-text-tertiary"
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
