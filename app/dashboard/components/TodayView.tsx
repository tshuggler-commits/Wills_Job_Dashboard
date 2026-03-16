"use client";

import { Job } from "@/lib/types";
import { daysUntil, daysSince, fmtDate, isMonday, todayFormatted } from "@/lib/dates";
import { CONTEXTUAL_MESSAGES } from "@/lib/content/contextual-messages";
import { selectTip, TipCategory } from "@/lib/content/daily-tips";
import MondayBanner from "./MondayBanner";
import ResumeReview from "./ResumeReview";

interface TodayViewProps {
  jobs: Job[];
  userName: string;
  onApproveResume: (id: string) => void;
  onNavigateToReview: () => void;
}

// Category display names
const CATEGORY_LABELS: Record<TipCategory, string> = {
  interview_prep: "Interview Prep",
  career_gap: "Career Gap",
  networking: "Networking",
  application_strategy: "Application Strategy",
  mindset: "Mindset",
  followup: "Follow-Up",
  self_care: "Self-Care",
};

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function getContextualMessage(jobs: Job[]): string {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const active = jobs.filter((j) => !j.dismissed);
  const pursuing = active.filter((j) => j.bookmarked && !j.applied && j.status !== "Interview");
  const applied = active.filter((j) => j.status === "Applied");
  const interviewing = active.filter((j) => j.status === "Interview");

  // Priority 1: Interview within 48 hours
  const upcomingInterview = interviewing.find((j) => {
    const d = daysUntil(j.expectedResponseBy);
    return d !== null && d >= 0 && d <= 2;
  });
  if (upcomingInterview) {
    const d = daysUntil(upcomingInterview.expectedResponseBy);
    const timeframe = d === 0 ? "today" : d === 1 ? "tomorrow" : "in 2 days";
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "interview_within_48h")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg.replace(/{company}/g, upcomingInterview.company).replace(/{timeframe}/g, timeframe);
  }

  if (interviewing.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "interview_within_48h")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, interviewing[0].company)
      .replace(/{timeframe}/g, "soon");
  }

  const recentlyApproved = active.find(
    (j) => j.resumeReviewStatus === "Approved" && j.bookmarked && !j.applied
  );
  if (recentlyApproved) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "resume_just_approved")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, recentlyApproved.company)
      .replace(/{jobTitle}/g, recentlyApproved.jobTitle);
  }

  const resumeReady = active.find((j) => j.resumeReviewStatus === "AI Draft Ready");
  if (resumeReady) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "resume_ready_for_review")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, resumeReady.company)
      .replace(/{jobTitle}/g, resumeReady.jobTitle);
  }

  const followUpDue = applied.find((j) => {
    const d = daysSince(j.lastFollowUpDate || j.dateApplied);
    return d !== null && d >= 10;
  });
  if (followUpDue) {
    const d = daysSince(followUpDue.lastFollowUpDate || followUpDue.dateApplied)!;
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "followup_due")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, followUpDue.company)
      .replace(/{days}/g, String(d));
  }

  const newToday = active.filter((j) => j.dateFound === todayStr);
  if (newToday.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "new_jobs_found")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg.replace(/{count}/g, String(newToday.length));
  }

  const appliedYesterday = applied.find((j) => j.dateApplied === yesterdayStr);
  if (appliedYesterday) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "application_sent_yesterday")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, appliedYesterday.company)
      .replace(/{totalApplied}/g, String(applied.length));
  }

  if (pursuing.length > 0 || applied.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "pipeline_active_nothing_urgent")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{pursuing}/g, String(pursuing.length))
      .replace(/{applied}/g, String(applied.length));
  }

  const lastAppliedDate = applied
    .map((j) => j.dateApplied)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  const daysSinceLastApp = daysSince(lastAppliedDate || null);
  if (daysSinceLastApp !== null && daysSinceLastApp >= 5) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "dry_spell_5_plus_days")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg.replace(/{days}/g, String(daysSinceLastApp));
  }

  const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "nothing_happening")!.messages;
  return msgs[getDayOfYear() % msgs.length];
}

function getPipelineStates(jobs: Job[]): string[] {
  const states: string[] = [];
  const active = jobs.filter((j) => !j.dismissed);
  const interviewing = active.filter((j) => j.status === "Interview");
  const pursuing = active.filter((j) => j.bookmarked && !j.applied && j.status !== "Interview");
  const applied = active.filter((j) => j.status === "Applied");

  if (interviewing.length > 0) states.push("has_active_interview");
  if (pursuing.length >= 3 && applied.length === 0) states.push("pursuing_not_applied");

  const hasOverdueFollowUp = applied.some((j) => {
    const d = daysSince(j.lastFollowUpDate || j.dateApplied);
    return d !== null && d >= 10;
  });
  if (hasOverdueFollowUp) states.push("followup_overdue");

  const lastApplied = applied.map((j) => j.dateApplied).filter(Boolean).sort().reverse()[0];
  const daysSinceApp = daysSince(lastApplied || null);
  if ((daysSinceApp === null || daysSinceApp >= 5) && applied.length === 0) {
    states.push("no_activity_5_days");
  }

  return states;
}

// ── SVG icons for empty states ──

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export default function TodayView({
  jobs,
  userName,
  onApproveResume,
  onNavigateToReview,
}: TodayViewProps) {
  const active = jobs.filter((j) => !j.dismissed && j.workType !== "On-site");

  const attentionJobs = active.filter(
    (j) =>
      j.status === "Interview" ||
      (daysUntil(j.applyBy) !== null &&
        daysUntil(j.applyBy)! >= 0 &&
        daysUntil(j.applyBy)! <= 3 &&
        !j.applied)
  );

  const resumeReviews = active.filter(
    (j) => j.resumeReviewStatus === "AI Draft Ready" && j.tailoredSummary
  );

  const reviewedCount = active.filter((j) => j.status !== "New").length;
  const pursuingCount = active.filter(
    (j) => j.bookmarked && !j.applied && j.status !== "Interview"
  ).length;
  const appliedCount = active.filter((j) => j.status === "Applied").length;
  const interviewCount = active.filter((j) => j.status === "Interview").length;

  const newJobCount = active.filter((j) => j.status === "New").length;

  const contextualMessage = getContextualMessage(jobs);

  const pipelineStates = getPipelineStates(jobs);
  const tip = selectTip(pipelineStates, getDayOfYear());

  const totalDiscovered = active.length;
  const converted = appliedCount + interviewCount;
  const progressPct = totalDiscovered > 0 ? Math.round((converted / totalDiscovered) * 100) : 0;

  const stats = [
    { value: reviewedCount, label: "Reviewed", color: "text-text-primary" },
    { value: pursuingCount, label: "Pursuing", color: "text-teal" },
    { value: appliedCount, label: "Applied", color: "text-blue" },
    { value: interviewCount, label: "Interview", color: "text-purple" },
  ];

  return (
    <div>
      {/* Gradient header */}
      <div className="today-header mb-5">
        <p className="text-[13px] text-white/50 font-medium">{todayFormatted()}</p>
        <h1 className="text-[22px] font-bold text-white mt-1">Hey, {userName}</h1>
        <p className="text-[14px] text-white/85 leading-relaxed mt-3">
          {contextualMessage}
        </p>
      </div>

      {/* Monday Banner */}
      <MondayBanner jobs={active} />

      {/* Needs Attention */}
      <div className="mb-5">
        <div className="section-label mb-2.5 px-0.5">Needs attention</div>
        {attentionJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircleIcon />
            </div>
            <p className="text-sm text-text-secondary">
              Nothing urgent today. You&apos;re on track.
            </p>
          </div>
        ) : (
          attentionJobs.map((j) => (
            <div
              key={j.id + "-attn"}
              className={`rounded-card p-3.5 mb-2 flex items-center justify-between shadow-card ${
                j.status === "Interview"
                  ? "bg-purple-light border border-purple/10"
                  : "bg-amber-light border border-amber/15"
              }`}
            >
              <div>
                <div className="text-[13px] font-semibold text-text-primary">
                  {j.jobTitle} at {j.company}
                </div>
                <div
                  className={`text-xs font-semibold mt-0.5 ${
                    j.status === "Interview" ? "text-purple" : "text-amber"
                  }`}
                >
                  {j.status === "Interview"
                    ? "Interview upcoming"
                    : `Deadline ${fmtDate(j.applyBy)}`}
                </div>
              </div>
              {j.status === "Interview" && (
                <button className="bg-purple text-white border-none px-4 py-2 rounded-std text-xs font-bold cursor-pointer shadow-sm">
                  Prep
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Resume Reviews */}
      <div className="mb-5">
        <div className="section-label mb-2.5 px-0.5">Resume reviews</div>
        {resumeReviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileIcon />
            </div>
            <p className="text-sm text-text-secondary">
              No resumes waiting for review.
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Bookmark a job and we&apos;ll tailor one for you.
            </p>
          </div>
        ) : (
          resumeReviews.map((j) => (
            <div key={j.id + "-resume"} className="mb-2">
              <div className="text-[13px] font-semibold text-text-primary mb-1.5 px-0.5">
                {j.company} · {j.jobTitle}
              </div>
              <ResumeReview
                tailoredSummary={j.tailoredSummary}
                skillsEmphasized={j.skillsEmphasized}
                experienceFraming={j.experienceFraming}
                onApprove={() => onApproveResume(j.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Stats Row */}
      <div className="mb-4">
        <div className="section-label mb-2.5 px-0.5">Your search</div>
        <div className="flex gap-2">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`text-lg font-bold font-mono ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] font-bold text-text-tertiary uppercase mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5 px-0.5">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.max(progressPct, 3)}%` }}
          />
        </div>
        <div className="text-[11px] text-text-tertiary mt-1.5 font-medium">
          {converted} of {totalDiscovered} &rarr; applied or interviewing
        </div>
      </div>

      {/* Daily Tip */}
      <div className="tip-card mb-5">
        <div className="text-[10px] font-bold text-teal uppercase tracking-wider mb-1.5 pl-1">
          {CATEGORY_LABELS[tip.category]}
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed pl-1">
          {tip.text}
        </p>
      </div>

      {/* Review link */}
      {newJobCount > 0 && (
        <button
          onClick={onNavigateToReview}
          className="review-cta mb-5"
        >
          Review {newJobCount} new {newJobCount === 1 ? "job" : "jobs"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
