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
    { value: newThisWeek, label: "New", color: "#4ade80" },
    { value: appliedCount, label: "Applied", color: "#60a5fa" },
    { value: interviewCount, label: "Interviews", color: "#a78bfa" },
  ];

  return (
    <div className="bg-text-primary rounded-card p-5 mb-4 relative text-white">
      <button
        onClick={() => setClosed(true)}
        className="absolute top-3.5 right-3.5 bg-transparent border-none text-[#555] text-sm cursor-pointer"
      >
        ✕
      </button>

      <div className="text-[11px] font-semibold text-[#666] uppercase tracking-wider mb-2">
        Monday Kickoff
      </div>

      <p className="text-[15px] leading-relaxed font-medium text-[#e5e5e5] mb-4">
        You&apos;re building something real here. Let&apos;s make this week count.
      </p>

      <div className="flex rounded-std overflow-hidden border border-[#333] mb-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 text-center py-3 bg-[#222]"
            style={{
              borderRight: i < 2 ? "1px solid #333" : "none",
            }}
          >
            <div
              className="text-xl font-bold font-mono"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[10px] text-[#777] font-semibold uppercase mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#222] rounded-std p-3.5 border border-[#333]">
        <div className="text-[10px] font-semibold text-[#777] uppercase tracking-wide mb-1">
          This week&apos;s goal · Application Prep
        </div>
        <p className="text-[#ccc] text-[13px] leading-snug">
          Pick your highest-match job and research the company for 20 minutes.
        </p>
      </div>
    </div>
  );
}
