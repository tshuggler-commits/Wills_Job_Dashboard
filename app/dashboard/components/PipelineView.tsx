"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { daysUntil, daysSince, fmtDate } from "@/lib/dates";
import ResumeReview from "./ResumeReview";
import { followUpTemplates, fillTemplate } from "@/lib/templates/followup-emails";

interface PipelineViewProps {
  jobs: Job[];
  onApproveResume: (id: string) => void;
  onFollowUp: (id: string, notes?: string) => void;
}

function SectionHead({
  title,
  color,
  count,
}: {
  title: string;
  color: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-2.5 px-0.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
      />
      <span className="text-[13px] font-semibold text-text-primary">
        {title}
      </span>
      <span className="text-xs text-text-tertiary">({count})</span>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="p-4 text-[13px] text-text-tertiary bg-surface-alt rounded-std border border-border">
      {msg}
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ opacity: 0.6 }}
    >
      <path
        d="M2 10L10 2M10 2H4M10 2V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Pursuing Card ──

function PursuingCard({
  job,
  onApproveResume,
}: {
  job: Job;
  onApproveResume: (id: string) => void;
}) {
  const dLeft = daysUntil(job.applyBy);
  const showReview =
    job.resumeReviewStatus === "AI Draft Ready" &&
    job.tailoredSummary;
  const isApproved = job.resumeReviewStatus === "Approved";
  const isTailoring = job.resumeReviewStatus === "Not Started";

  return (
    <div className="bg-surface rounded-card border border-border p-3.5 mb-2">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-text-primary">
            {job.jobTitle}
          </div>
          <div className="text-xs text-text-secondary">
            {job.company} · {job.workType} ·{" "}
            {job.salaryRange || "Salary TBD"}
          </div>

          {job.applyBy && dLeft !== null && (
            <div
              className={`text-[11px] font-medium mt-0.5 ${
                dLeft <= 5 ? "text-amber" : "text-text-tertiary"
              }`}
            >
              Apply by {fmtDate(job.applyBy)} · {dLeft}d left
            </div>
          )}

          {isTailoring && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="spinner w-3 h-3 rounded-full border-2 border-text-tertiary border-t-transparent" />
              <span className="text-xs text-text-tertiary font-medium">
                Tailoring resume...
              </span>
            </div>
          )}

          {isApproved && (
            <span className="text-xs text-green font-semibold block mt-1.5">
              Resume approved. Ready to apply.
            </span>
          )}
        </div>
      </div>

      {showReview && (
        <div className="mt-3">
          <ResumeReview
            tailoredSummary={job.tailoredSummary}
            skillsEmphasized={job.skillsEmphasized}
            experienceFraming={job.experienceFraming}
            onApprove={() => onApproveResume(job.id)}
          />
        </div>
      )}

      {isApproved && job.applyLink && (
        <div className="mt-2.5 flex gap-2 items-center">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-text-primary text-white px-4 py-2 rounded-std text-[13px] font-semibold no-underline inline-flex items-center gap-1.5"
          >
            Apply <ExternalIcon />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Applied Card ──

function AppliedCard({
  job,
  onFollowUp,
}: {
  job: Job;
  onFollowUp: (id: string, notes?: string) => void;
}) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const d = daysSince(job.dateApplied);
  const lastFU = daysSince(job.lastFollowUpDate);

  // Nudge logic: if follow-up exists, nudge 7-10 days after that.
  // If no follow-up, nudge 10 days after application.
  let nudge = false;
  let strongNudge = false;
  if (lastFU !== null) {
    nudge = lastFU >= 7;
    strongNudge = lastFU >= 21;
  } else if (d !== null) {
    nudge = d >= 10;
    strongNudge = d >= 30;
  }

  function copyTemplate(templateId: number) {
    const template = followUpTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const filled = fillTemplate(template, {
      company: job.company,
      jobTitle: job.jobTitle,
      dateApplied: fmtDate(job.dateApplied) || "recently",
      contactName: job.recruiterName || undefined,
    });
    navigator.clipboard.writeText(filled);
    setCopied(templateId);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div
      className={`bg-surface rounded-std border p-3 pb-3.5 mb-1.5 ${
        nudge ? "border-amber/25" : "border-border"
      }`}
    >
      <div className="font-semibold text-sm text-text-primary">
        {job.jobTitle}
      </div>
      <div className="text-xs text-text-secondary">
        {job.company} · {job.workType}
      </div>
      <div
        className={`mt-0.5 text-xs ${
          nudge ? "text-amber font-semibold" : "text-text-tertiary"
        }`}
      >
        Applied {fmtDate(job.dateApplied)} · {d} days ago
        {strongNudge && " · Time to follow up"}
        {nudge && !strongNudge && " · Consider following up"}
      </div>

      {job.followUpCount > 0 && (
        <div className="text-[11px] text-text-tertiary mt-1">
          {job.followUpCount} follow-up{job.followUpCount > 1 ? "s" : ""} sent
          {job.lastFollowUpDate &&
            ` · Last: ${fmtDate(job.lastFollowUpDate)}`}
        </div>
      )}

      <div className="flex gap-2 mt-2.5 items-center">
        <button
          onClick={() => {
            onFollowUp(job.id);
          }}
          className="bg-surface-alt text-text-secondary border border-border px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer"
        >
          I followed up
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="bg-transparent text-text-tertiary border-none px-2 py-1.5 text-xs font-medium cursor-pointer"
        >
          {showTemplates ? "Hide templates" : "Email template"}
        </button>
      </div>

      {showTemplates && (
        <div className="mt-2.5 space-y-1.5">
          {followUpTemplates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-surface-alt rounded-md px-3 py-2 border border-border-light"
            >
              <div>
                <div className="text-xs font-medium text-text-primary">
                  {t.label}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {t.timing}
                </div>
              </div>
              <button
                onClick={() => copyTemplate(t.id)}
                className={`text-xs font-medium border-none cursor-pointer px-2.5 py-1 rounded ${
                  copied === t.id
                    ? "bg-green-light text-green"
                    : "bg-surface text-text-secondary border border-border"
                }`}
              >
                {copied === t.id ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Interviewing Card ──

function InterviewingCard({ job }: { job: Job }) {
  const hasPrep =
    job.notebookLMUrls && job.notebookLMStatus === "Prep Complete";
  const prepGenerating =
    job.notebookLMStatus &&
    job.notebookLMStatus !== "Not Started" &&
    job.notebookLMStatus !== "Prep Complete";

  return (
    <div className="bg-surface rounded-std border border-border p-3 pb-3.5 mb-1.5">
      <div className="font-semibold text-sm text-text-primary">
        {job.jobTitle}
      </div>
      <div className="text-xs text-text-secondary">
        {job.company} · {job.workType}
      </div>

      {job.interviewRound && (
        <div className="text-[11px] text-purple font-semibold mt-1">
          {job.interviewRound}
        </div>
      )}

      {job.interviewerName && (
        <div className="text-[11px] text-text-tertiary mt-0.5">
          with {job.interviewerName}
        </div>
      )}

      {job.nextStep && (
        <div className="text-[11px] text-text-secondary mt-1">
          Next: {job.nextStep}
        </div>
      )}

      {job.expectedResponseBy && (
        <div className="text-[11px] text-text-tertiary mt-0.5">
          Response expected by {fmtDate(job.expectedResponseBy)}
        </div>
      )}

      <div className="flex gap-2 mt-2.5 items-center">
        {hasPrep && (
          <a
            href={job.notebookLMUrls}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple text-white px-3.5 py-1.5 rounded-md text-xs font-semibold no-underline cursor-pointer"
          >
            Prep
          </a>
        )}
        {prepGenerating && (
          <div className="flex items-center gap-1.5">
            <div className="spinner w-3 h-3 rounded-full border-2 border-purple border-t-transparent" />
            <span className="text-xs text-text-tertiary font-medium">
              Prep materials generating
            </span>
          </div>
        )}
        {!hasPrep && !prepGenerating && (
          <span className="text-xs text-text-tertiary">
            Prep not started yet
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main PipelineView ──

export default function PipelineView({
  jobs,
  onApproveResume,
  onFollowUp,
}: PipelineViewProps) {
  const pursuing = jobs.filter(
    (j) => j.bookmarked && !j.applied && j.status !== "Interview"
  );
  const applied = jobs.filter((j) => j.status === "Applied");
  const interviewing = jobs.filter((j) => j.status === "Interview");

  return (
    <div>
      {/* Pursuing */}
      <div className="mb-7">
        <SectionHead title="Pursuing" color="#1a1a1a" count={pursuing.length} />
        {pursuing.length === 0 ? (
          <Empty msg="Bookmark jobs from the Review tab to start your shortlist." />
        ) : (
          pursuing.map((j) => (
            <PursuingCard
              key={j.id}
              job={j}
              onApproveResume={onApproveResume}
            />
          ))
        )}
      </div>

      {/* Applied */}
      <div className="mb-7">
        <SectionHead title="Applied" color="#1d4ed8" count={applied.length} />
        {applied.length === 0 ? (
          <Empty msg="No applications out yet." />
        ) : (
          applied.map((j) => (
            <AppliedCard key={j.id} job={j} onFollowUp={onFollowUp} />
          ))
        )}
      </div>

      {/* Interviewing */}
      <div className="mb-7">
        <SectionHead
          title="Interviewing"
          color="#5b21b6"
          count={interviewing.length}
        />
        {interviewing.length === 0 ? (
          <Empty msg="No active interviews." />
        ) : (
          interviewing.map((j) => (
            <InterviewingCard key={j.id} job={j} />
          ))
        )}
      </div>
    </div>
  );
}
