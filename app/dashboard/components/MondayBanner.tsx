"use client";

import { useState } from "react";
import { isMonday } from "@/lib/dates";
import { Job } from "@/lib/types";
import { daysSince } from "@/lib/dates";

interface MondayBannerProps {
  jobs: Job[];
}

export default function MondayBanner({ jobs }: MondayBannerProps) {
  const [closed, setClosed] = useState(false);

  if (!isMonday() || closed) return null;

  // Calculate stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newThisWeek = jobs.filter((j) => {
    if (!j.dateFound) return false;
    return new Date(j.dateFound + "T00:00:00") >= oneWeekAgo;
  }).length;

  const appliedCount = jobs.filter((j) => j.status === "Applied").length;
  const interviewCount = jobs.filter((j) => j.status === "Interview").length;

  const stats = [
    { value: newThisWeek, label: "New", color: "#b8860b" },
    { value: appliedCount, label: "Applied", color: "#5a7d6a" },
    { value: interviewCount, label: "Interviews", color: "#6b4c9a" },
  ];

  return (
    <div className="bg-text-primary rounded-card p-5 mb-5 relative text-white shadow-card overflow-hidden">
      {/* Subtle gold accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-[0.06] rounded-full"
        style={{ background: "radial-gradient(circle, #b8860b 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />

      <button
        onClick={() => setClosed(true)}
        className="absolute top-3.5 right-3.5 bg-transparent border-none text-white/30 text-sm cursor-pointer"
      >
        ✕
      </button>

      <div className="heading-serif text-[15px] text-white/40 mb-2">
        Monday Kickoff
      </div>

      <p className="text-[15px] leading-relaxed font-medium text-white/80 mb-4">
        You&apos;re building something real here. Let&apos;s make this week count.
      </p>

      <div className="flex rounded-std overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 text-center py-3"
            style={{
              borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <div
              className="text-xl font-bold font-mono"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[10px] text-white/40 font-semibold uppercase mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-std p-3.5" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1">
          This week&apos;s goal
        </div>
        <p className="text-white/70 text-[13px] leading-snug">
          Pick your highest-match job and research the company for 20 minutes.
        </p>
      </div>
    </div>
  );
}
