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

  // For interviews, also check if any interview exists at all (generic)
  if (interviewing.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "interview_within_48h")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, interviewing[0].company)
      .replace(/{timeframe}/g, "soon");
  }

  // Priority 2: Resume just approved (within 24 hours)
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

  // Priority 3: Resume ready for review
  const resumeReady = active.find((j) => j.resumeReviewStatus === "AI Draft Ready");
  if (resumeReady) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "resume_ready_for_review")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, resumeReady.company)
      .replace(/{jobTitle}/g, resumeReady.jobTitle);
  }

  // Priority 4: Follow-up due
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

  // Priority 5: New jobs found today
  const newToday = active.filter((j) => j.dateFound === todayStr);
  if (newToday.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "new_jobs_found")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg.replace(/{count}/g, String(newToday.length));
  }

  // Priority 6: Application sent yesterday
  const appliedYesterday = applied.find((j) => j.dateApplied === yesterdayStr);
  if (appliedYesterday) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "application_sent_yesterday")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{company}/g, appliedYesterday.company)
      .replace(/{totalApplied}/g, String(applied.length));
  }

  // Priority 7: Pipeline active, nothing urgent
  if (pursuing.length > 0 || applied.length > 0) {
    const msgs = CONTEXTUAL_MESSAGES.find((m) => m.trigger === "pipeline_active_nothing_urgent")!.messages;
    const msg = msgs[getDayOfYear() % msgs.length];
    return msg
      .replace(/{pursuing}/g, String(pursuing.length))
      .replace(/{applied}/g, String(applied.length));
  }

  // Priority 8: Dry spell
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

  // Priority 9: Nothing happening
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

export default function TodayView({
  jobs,
  userName,
  onApproveResume,
  onNavigateToReview,
}: TodayViewProps) {
  const active = jobs.filter((j) => !j.dismissed && j.workType !== "On-site");

  // Attention items: interviews within 7 days + deadlines within 3 days
  const attentionJobs = active.filter(
    (j) =>
      j.status === "Interview" ||
      (daysUntil(j.applyBy) !== null &&
        daysUntil(j.applyBy)! >= 0 &&
        daysUntil(j.applyBy)! <= 3 &&
        !j.applied)
  );

  // Resume reviews pending
  const resumeReviews = active.filter(
    (j) => j.resumeReviewStatus === "AI Draft Ready" && j.tailoredSummary
  );

  // Stats
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const reviewedCount = active.filter((j) => {
    if (j.status === "New") return false;
    return true;
  }).length;
  const pursuingCount = active.filter(
    (j) => j.bookmarked && !j.applied && j.status !== "Interview"
  ).length;
  const appliedCount = active.filter((j) => j.status === "Applied").length;
  const interviewCount = active.filter((j) => j.status === "Interview").length;

  const newJobCount = active.filter((j) => j.status === "New").length;

  // Contextual message
  const contextualMessage = getContextualMessage(jobs);

  // Daily tip
  const pipelineStates = getPipelineStates(jobs);
  const tip = selectTip(pipelineStates, getDayOfYear());

  // Progress bar: how many moved past Pursuing
  const totalDiscovered = active.length;
  const converted = appliedCount + interviewCount;
  const progressPct = totalDiscovered > 0 ? Math.round((converted / totalDiscovered) * 100) : 0;

  const stats = [
    { value: reviewedCount, label: "Reviewed", color: "" },
    { value: pursuingCount, label: "Pursuing", color: "" },
    { value: appliedCount, label: "Applied", color: "text-blue" },
    { value: interviewCount, label: "Interview", color: "text-purple" },
  ];

  return (
    <div>
      {/* Greeting */}
      <div className="pt-5 pb-4">
        <h1 className="text-xl font-bold text-text-primary">Hey, {userName}</h1>
        <p className="text-[13px] text-text-tertiary mt-0.5">{todayFormatted()}</p>
      </div>

      {/* Contextual message */}
      <div className="bg-surface rounded-card border border-border p-4 mb-4">
        <p className="text-[14px] text-text-primary leading-relaxed">
          {contextualMessage}
        </p>
      </div>

      {/* Monday Banner */}
      <MondayBanner jobs={active} />

      {/* Needs Attention */}
      {attentionJobs.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-0.5">
            Needs attention
          </div>
          {attentionJobs.map((j) => (
            <div
              key={j.id + "-attn"}
              className={`rounded-std p-3 mb-1.5 flex items-center justify-between ${
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
                  className={`text-xs font-medium mt-0.5 ${
                    j.status === "Interview" ? "text-purple" : "text-amber"
                  }`}
                >
                  {j.status === "Interview"
                    ? "Interview upcoming"
                    : `Deadline ${fmtDate(j.applyBy)}`}
                </div>
              </div>
              {j.status === "Interview" && (
                <button className="bg-purple text-white border-none px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer">
                  Prep
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resume Reviews */}
      {resumeReviews.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-0.5">
            Resume reviews
          </div>
          {resumeReviews.map((j) => (
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
          ))}
        </div>
      )}

      {/* Stats Row */}
      <div className="mb-3">
        <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-2 px-0.5">
          Your search
        </div>
        <div className="flex gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex-1 bg-surface rounded-std border border-border py-2.5 text-center"
            >
              <div className={`text-lg font-bold font-mono ${s.color || "text-text-primary"}`}>
                {s.value}
              </div>
              <div className="text-[10px] font-semibold text-text-tertiary uppercase mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4 px-0.5">
        <div className="h-2 bg-surface-alt rounded-full overflow-hidden border border-border-light">
          <div
            className="h-full bg-green rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>
        <div className="text-[11px] text-text-tertiary mt-1">
          {converted} of {totalDiscovered} &rarr; applied or interviewing
        </div>
      </div>

      {/* Daily Tip */}
      <div className="bg-surface rounded-card border border-border p-4 mb-4">
        <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-1.5">
          {CATEGORY_LABELS[tip.category]}
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {tip.text}
        </p>
      </div>

      {/* Review link */}
      {newJobCount > 0 && (
        <button
          onClick={onNavigateToReview}
          className="w-full bg-surface rounded-std border border-border py-3.5 text-[13px] font-semibold text-text-primary cursor-pointer flex items-center justify-center gap-1.5 mb-4"
        >
          Review {newJobCount} new {newJobCount === 1 ? "job" : "jobs"} &rarr;
        </button>
      )}
    </div>
  );
}
