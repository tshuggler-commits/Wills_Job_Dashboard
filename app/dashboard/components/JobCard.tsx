"use client";

import { useState } from "react";
import { Job, DismissReason } from "@/lib/types";
import { daysUntil, daysSince, fmtDate } from "@/lib/dates";
import ResumeReview from "./ResumeReview";

const DISMISS_REASONS: DismissReason[] = [
  "Low Pay",
  "Wrong Location",
  "Bad Fit",
  "Company Red Flags",
  "Expired/Filled",
  "Other",
];

interface JobCardProps {
  job: Job;
  onBookmark: (id: string, bookmarked: boolean) => void;
  onDismiss: (id: string, reason: DismissReason) => void;
  onApply: (id: string) => void;
  onApproveResume: (id: string) => void;
  onSaveNote: (id: string, notes: string) => void;
}

function ScoreBlock({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="w-10 h-10 rounded-std flex-shrink-0 bg-surface-alt text-text-tertiary flex items-center justify-center font-semibold text-[11px]">
        NEW
      </div>
    );
  }
  const isHigh = score >= 8;
  const isMid = score >= 6;
  return (
    <div
      className={`w-10 h-10 rounded-std flex-shrink-0 flex items-center justify-center font-bold text-[15px] font-mono ${
        isHigh
          ? "bg-green-light text-green"
          : isMid
          ? "bg-amber-light text-amber"
          : "bg-surface-alt text-text-tertiary"
      }`}
    >
      {score}
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width={18} height={18} viewBox="0 0 16 16" fill="#1a1a1a">
        <path d="M3 2.5A1.5 1.5 0 014.5 1h7A1.5 1.5 0 0113 2.5v12.207a.5.5 0 01-.777.416L8 12.118l-4.223 3.005A.5.5 0 013 14.707V2.5z" />
      </svg>
    );
  }
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 16 16"
      fill="none"
      stroke="#9a9a9a"
      strokeWidth="1.3"
    >
      <path d="M3.5 2.5A1 1 0 014.5 1.5h7a1 1 0 011 1v11.207a.25.25 0 01-.389.208L8 11.118l-4.111 2.797A.25.25 0 013.5 13.707V2.5z" />
    </svg>
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

export default function JobCard({
  job,
  onBookmark,
  onDismiss,
  onApply,
  onApproveResume,
  onSaveNote,
}: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [noteText, setNoteText] = useState(job.notes || "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isNew = job.status === "New";
  const hasRedFlags = job.redFlags && job.redFlags.length > 0;
  const dLeft = daysUntil(job.applyBy);
  const showDeadline = dLeft !== null && dLeft >= 0 && dLeft <= 7 && !job.applied;
  const dAgo = daysSince(job.dateApplied);

  const hasContact =
    job.recruiterName || job.recruiterContact || job.internalConnection;

  const hasResume =
    job.resumeReviewStatus === "AI Draft Ready" ||
    job.resumeReviewStatus === "Approved";

  return (
    <div className="bg-surface rounded-card mb-2 overflow-hidden border border-border">
      {/* Collapsed row */}
      <div className="px-2.5 py-3 pl-4 flex gap-2.5 items-start">
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(job.id, !job.bookmarked);
          }}
          className="bg-transparent border-none cursor-pointer p-0.5 flex-shrink-0 mt-2.5"
          style={{ opacity: job.bookmarked ? 1 : 0.4 }}
        >
          <BookmarkIcon filled={job.bookmarked} />
        </button>

        {/* Content area - tap to expand */}
        <div
          onClick={() => {
            setExpanded(!expanded);
            setDismissing(false);
          }}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-1.5">
            <ScoreBlock score={job.matchScore} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-text-primary leading-tight">
                  {job.jobTitle}
                </span>
                {isNew && (
                  <span className="w-1.5 h-1.5 rounded-full bg-text-primary flex-shrink-0" />
                )}
              </div>
              <div className="text-[13px] text-text-secondary mt-px">
                {job.company}{" "}
                <span className="text-text-tertiary">
                  · {job.workType} · {job.salaryRange || "Salary TBD"}
                </span>
              </div>
            </div>
          </div>

          {/* Status line */}
          <div className="flex gap-2.5 mt-1.5 ml-[50px] items-center flex-wrap">
            {job.status === "Applied" && (
              <span className="text-[11px] font-semibold text-blue">
                Applied {fmtDate(job.dateApplied)}
                {dAgo !== null && dAgo >= 10 && (
                  <span className="text-amber">
                    {" "}
                    · {dAgo}d ago, follow up?
                  </span>
                )}
              </span>
            )}
            {job.status === "Interview" && (
              <span className="text-[11px] font-semibold text-purple">
                Interview upcoming
              </span>
            )}
            {showDeadline && (
              <span
                className={`text-[11px] font-semibold ${
                  dLeft! <= 3 ? "text-red" : "text-amber"
                }`}
              >
                {dLeft === 0
                  ? "Due today"
                  : dLeft === 1
                  ? "Due tomorrow"
                  : `${dLeft}d left to apply`}
              </span>
            )}
          </div>
        </div>

        {/* Dismiss X */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissing(!dismissing);
            setExpanded(false);
          }}
          className="bg-transparent border-none text-text-tertiary text-sm cursor-pointer px-1 py-0.5 flex-shrink-0 mt-2.5 opacity-40"
        >
          ✕
        </button>
      </div>

      {/* Dismiss reasons */}
      {dismissing && (
        <div className="px-4 py-3 bg-surface-alt border-t border-border">
          <div className="text-xs text-text-secondary font-semibold mb-2">
            Why are you passing?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DISMISS_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDismissing(false);
                  onDismiss(job.id, r);
                }}
                className="bg-surface border border-border text-text-primary px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer"
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => setDismissing(false)}
              className="bg-transparent border-none text-text-tertiary px-2 py-1.5 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && !dismissing && (
        <div className="expand-in border-t border-border-light">
          {/* Company Intel */}
          {job.companyIntel && (
            <div className="px-4 pt-3.5">
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
                Company Intel
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-1.5">
                {job.companyIntel}
              </p>
              {hasRedFlags && (
                <p className="text-[13px] text-red mb-1.5">
                  {job.redFlags.join(", ")}
                </p>
              )}
              <div className="text-xs text-text-tertiary pb-3.5">
                {[
                  job.companySize && `${job.companySize}`,
                  job.industry,
                  job.dateFound && `Found ${fmtDate(job.dateFound)}`,
                  job.source !== "Manual"
                    ? `via ${job.source}`
                    : "Added manually",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          )}

          {/* Contact info */}
          {hasContact && (
            <div className="px-4 pb-3 border-t border-border-light pt-3">
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
                Contacts
              </div>
              {job.recruiterName && (
                <p className="text-[13px] text-text-secondary">
                  {job.recruiterName}
                  {job.recruiterContact && ` · ${job.recruiterContact}`}
                </p>
              )}
              {job.internalConnection && (
                <p className="text-[13px] text-text-secondary mt-0.5">
                  Internal: {job.internalConnection}
                </p>
              )}
            </div>
          )}

          {/* Resume review */}
          {hasResume && (
            <div className="px-4 pb-3.5">
              <ResumeReview
                tailoredSummary={job.tailoredSummary}
                skillsEmphasized={job.skillsEmphasized}
                experienceFraming={job.experienceFraming}
                onApprove={() => onApproveResume(job.id)}
              />
            </div>
          )}

          {/* Notes */}
          {(showNotes || job.notes) && (
            <div className="px-4 py-2.5 border-t border-border-light">
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  setNoteSaved(false);
                }}
                placeholder="Quick notes..."
                className="w-full min-h-[48px] p-2.5 border border-border rounded-std text-[13px] resize-y outline-none text-text-primary bg-surface-alt"
              />
              <div className="flex justify-end mt-1.5">
                <button
                  onClick={() => {
                    onSaveNote(job.id, noteText);
                    setNoteSaved(true);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer border-none ${
                    noteSaved
                      ? "bg-green-light text-green"
                      : "bg-text-primary text-white"
                  }`}
                >
                  {noteSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-border-light items-center">
            {!job.applied ? (
              <>
                <a
                  href={job.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-text-primary text-white px-4 py-2 rounded-std text-[13px] font-semibold no-underline inline-flex items-center gap-1.5"
                >
                  Apply <ExternalIcon />
                </a>
                <button
                  onClick={() => onApply(job.id)}
                  className="bg-green-light text-green border border-green/10 px-4 py-2 rounded-std text-[13px] font-semibold cursor-pointer"
                >
                  Mark Applied
                </button>
              </>
            ) : (
              <span className="text-[13px] text-green font-medium">
                Applied {fmtDate(job.dateApplied)}
              </span>
            )}
            {job.status === "Interview" && (
              <button className="bg-purple-light text-purple border border-purple/10 px-4 py-2 rounded-std text-[13px] font-semibold cursor-pointer">
                Interview Prep
              </button>
            )}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="bg-transparent text-text-tertiary border-none px-2.5 py-2 text-[13px] font-medium cursor-pointer ml-auto"
            >
              {showNotes || job.notes ? "Notes" : "+ Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
