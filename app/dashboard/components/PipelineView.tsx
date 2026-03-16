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
  count,
  colorClass,
}: {
  title: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className={`text-[15px] font-bold ${colorClass}`}>
        {title}
      </span>
      <span className="text-xs font-semibold text-text-tertiary bg-surface-alt px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

// ── Empty state icons ──

function BookmarkEmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SendEmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicEmptyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a8580" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function Empty({ msg, subMsg, icon }: { msg: string; subMsg?: string; icon: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="text-sm text-text-secondary">{msg}</p>
      {subMsg && <p className="text-xs text-text-tertiary mt-1">{subMsg}</p>}
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
    <div className="bg-surface rounded-card shadow-card border border-border-light p-4 mb-2.5">
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-text-primary">
            {job.jobTitle}
          </div>
          <div className="text-xs text-text-secondary mt-0.5">
            {job.company} · {job.workType} ·{" "}
            {job.salaryRange || "Salary TBD"}
          </div>

          {job.applyBy && dLeft !== null && (
            <div
              className={`text-[11px] font-semibold mt-1 ${
                dLeft <= 5 ? "text-amber" : "text-text-tertiary"
              }`}
            >
              Apply by {fmtDate(job.applyBy)} · {dLeft}d left
            </div>
          )}

          {isTailoring && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <div className="spinner w-3.5 h-3.5 rounded-full border-2 border-teal/30 border-t-teal" />
              <span className="text-xs text-teal font-medium">
                Tailoring resume...
              </span>
            </div>
          )}

          {isApproved && (
            <div className="flex items-center gap-1.5 mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs text-green font-bold">
                Resume approved — ready to apply
              </span>
            </div>
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
        <div className="mt-3 flex gap-2 items-center">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal text-white px-5 py-2.5 rounded-std text-[13px] font-bold no-underline inline-flex items-center gap-1.5 shadow-sm"
          >
            Apply Now <ExternalIcon />
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
      className={`bg-surface rounded-card shadow-card p-4 mb-2.5 border ${
        nudge ? "border-amber/20" : "border-border-light"
      }`}
    >
      <div className="font-bold text-sm text-text-primary">
        {job.jobTitle}
      </div>
      <div className="text-xs text-text-secondary mt-0.5">
        {job.company} · {job.workType}
      </div>
      <div
        className={`mt-1 text-xs font-medium ${
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

      <div className="flex gap-2 mt-3 items-center">
        <button
          onClick={() => {
            onFollowUp(job.id);
          }}
          className="bg-surface-alt text-text-primary border border-border px-3.5 py-2 rounded-std text-xs font-semibold cursor-pointer"
        >
          I followed up
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="bg-transparent text-teal border-none px-2 py-2 text-xs font-semibold cursor-pointer"
        >
          {showTemplates ? "Hide templates" : "Email template"}
        </button>
      </div>

      {showTemplates && (
        <div className="mt-3 space-y-1.5 expand-in">
          {followUpTemplates.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-surface-alt rounded-std px-3.5 py-2.5 border border-border-light"
            >
              <div>
                <div className="text-xs font-semibold text-text-primary">
                  {t.label}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {t.timing}
                </div>
              </div>
              <button
                onClick={() => copyTemplate(t.id)}
                className={`text-xs font-semibold border-none cursor-pointer px-3 py-1.5 rounded-std transition-colors ${
                  copied === t.id
                    ? "bg-green-light text-green"
                    : "bg-surface text-text-secondary border border-border"
                }`}
              >
                {copied === t.id ? "Copied!" : "Copy"}
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
    <div className="bg-surface rounded-card shadow-card border border-purple/10 p-4 mb-2.5">
      <div className="font-bold text-sm text-text-primary">
        {job.jobTitle}
      </div>
      <div className="text-xs text-text-secondary mt-0.5">
        {job.company} · {job.workType}
      </div>

      {job.interviewRound && (
        <div className="inline-block text-[11px] text-purple font-bold mt-1.5 bg-purple-light px-2 py-0.5 rounded-full">
          {job.interviewRound}
        </div>
      )}

      {job.interviewerName && (
        <div className="text-[11px] text-text-tertiary mt-1">
          with {job.interviewerName}
        </div>
      )}

      {job.nextStep && (
        <div className="text-[11px] text-text-secondary mt-1 font-medium">
          Next: {job.nextStep}
        </div>
      )}

      {job.expectedResponseBy && (
        <div className="text-[11px] text-text-tertiary mt-0.5">
          Response expected by {fmtDate(job.expectedResponseBy)}
        </div>
      )}

      <div className="flex gap-2 mt-3 items-center">
        {hasPrep && (
          <a
            href={job.notebookLMUrls}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple text-white px-4 py-2 rounded-std text-xs font-bold no-underline cursor-pointer shadow-sm"
          >
            Open Prep
          </a>
        )}
        {prepGenerating && (
          <div className="flex items-center gap-1.5">
            <div className="spinner w-3.5 h-3.5 rounded-full border-2 border-purple/30 border-t-purple" />
            <span className="text-xs text-text-tertiary font-medium">
              Generating prep materials
            </span>
          </div>
        )}
        {!hasPrep && !prepGenerating && (
          <span className="text-xs text-text-tertiary font-medium">
            Prep materials coming soon
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
      <div className="pipeline-section pipeline-pursuing">
        <SectionHead title="Pursuing" count={pursuing.length} colorClass="text-text-primary" />
        {pursuing.length === 0 ? (
          <Empty
            msg="Bookmark jobs from Review to start building your pipeline."
            subMsg="Jobs you're interested in will appear here."
            icon={<BookmarkEmptyIcon />}
          />
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
      <div className="pipeline-section pipeline-applied">
        <SectionHead title="Applied" count={applied.length} colorClass="text-blue" />
        {applied.length === 0 ? (
          <Empty
            msg="No active applications yet."
            subMsg="When you apply, they'll show up here with follow-up reminders."
            icon={<SendEmptyIcon />}
          />
        ) : (
          applied.map((j) => (
            <AppliedCard key={j.id} job={j} onFollowUp={onFollowUp} />
          ))
        )}
      </div>

      {/* Interviewing */}
      <div className="pipeline-section pipeline-interviewing">
        <SectionHead title="Interviewing" count={interviewing.length} colorClass="text-purple" />
        {interviewing.length === 0 ? (
          <Empty
            msg="No interviews scheduled."
            subMsg="When it's time, you'll be ready."
            icon={<MicEmptyIcon />}
          />
        ) : (
          interviewing.map((j) => (
            <InterviewingCard key={j.id} job={j} />
          ))
        )}
      </div>
    </div>
  );
}
