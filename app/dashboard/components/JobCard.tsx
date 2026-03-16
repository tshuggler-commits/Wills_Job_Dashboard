"use client";

import { useState } from "react";
import { Job, DismissReason } from "@/lib/types";
import { daysUntil, fmtDate } from "@/lib/dates";
import ScoreBadges from "./ScoreBadges";
import RoleDetails from "./RoleDetails";

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
  onSaveNote: (id: string, notes: string) => void;
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg width={18} height={18} viewBox="0 0 16 16" fill="#b8860b">
        <path d="M3 2.5A1.5 1.5 0 014.5 1h7A1.5 1.5 0 0113 2.5v12.207a.5.5 0 01-.777.416L8 12.118l-4.223 3.005A.5.5 0 013 14.707V2.5z" />
      </svg>
    );
  }
  return (
    <svg width={18} height={18} viewBox="0 0 16 16" fill="none" stroke="#8a8580" strokeWidth="1.3">
      <path d="M3.5 2.5A1 1 0 014.5 1.5h7a1 1 0 011 1v11.207a.25.25 0 01-.389.208L8 11.118l-4.111 2.797A.25.25 0 013.5 13.707V2.5z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
      <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function JobCard({
  job,
  onBookmark,
  onDismiss,
  onSaveNote,
}: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [noteText, setNoteText] = useState(job.notes || "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const hasRedFlags = job.redFlags && job.redFlags.length > 0;
  const dLeft = daysUntil(job.applyBy);
  const showDeadline = dLeft !== null && dLeft >= 0 && dLeft <= 7 && !job.applied;

  const hasContact = job.recruiterName || job.recruiterContact || job.internalConnection;

  const summaryPreview = job.roleSummary
    ? job.roleSummary.length > 65
      ? job.roleSummary.slice(0, 65) + "..."
      : job.roleSummary
    : "";

  return (
    <div className="bg-surface rounded-card mb-3 overflow-hidden shadow-card card-interactive">
      {/* Collapsed row */}
      <div className="px-3 py-3.5 pl-4 flex gap-3 items-start">
        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(job.id, !job.bookmarked);
          }}
          className={`bg-transparent border-none cursor-pointer p-0.5 flex-shrink-0 mt-0.5 transition-opacity ${job.bookmarked ? "bookmark-bounce" : ""}`}
          style={{ opacity: job.bookmarked ? 1 : 0.35 }}
        >
          <BookmarkIcon filled={job.bookmarked} />
        </button>

        {/* Content area */}
        <div
          onClick={() => {
            setExpanded(!expanded);
            setDismissing(false);
          }}
          className="flex-1 cursor-pointer min-w-0"
        >
          <div className="flex items-start gap-2">
            <ScoreBadges fitScore={job.fitScore} matchScore={job.matchScore} totalScore={job.totalScore} compact />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-text-primary leading-tight">
                  {job.jobTitle}
                </span>
              </div>
              <div className="text-[13px] text-text-secondary mt-0.5">
                {job.company}
                <span className="text-text-tertiary">
                  {" "}· {job.workType} · {job.salaryRange || "Salary TBD"}
                </span>
              </div>
            </div>
          </div>

          {/* Role summary preview + deadline */}
          <div className="mt-1.5 space-y-0.5">
            {summaryPreview && (
              <p className="text-[12px] text-text-tertiary leading-snug">
                {summaryPreview}
              </p>
            )}
            {showDeadline && (
              <span
                className={`text-[11px] font-bold ${
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

        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissing(!dismissing);
            setExpanded(false);
          }}
          className="bg-transparent border-none text-text-tertiary cursor-pointer p-1.5 flex-shrink-0 mt-0.5 transition-opacity hover:opacity-70"
          aria-label="Dismiss job"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="3" x2="11" y2="11" />
            <line x1="11" y1="3" x2="3" y2="11" />
          </svg>
        </button>
      </div>

      {/* Dismiss reasons */}
      {dismissing && (
        <div className="px-4 py-3.5 bg-surface-alt border-t border-border-light fade-in-fast">
          <div className="text-xs text-text-secondary font-bold mb-2.5">
            Why are you passing?
          </div>
          <div className="flex flex-wrap gap-2">
            {DISMISS_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setDismissing(false);
                  onDismiss(job.id, r);
                }}
                className="bg-surface border border-border text-text-primary px-3.5 py-2 rounded-std text-xs font-semibold cursor-pointer transition-colors hover:bg-surface-warm"
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => setDismissing(false)}
              className="bg-transparent border-none text-text-tertiary px-2 py-2 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && !dismissing && (
        <div className="expand-in border-t border-border-light">
          {/* Section 1: Role Details */}
          <RoleDetails
            roleSummary={job.roleSummary}
            keyRequirements={job.keyRequirements}
            matchedSkills={job.matchedSkills}
            skillGaps={job.skillGaps}
          />

          {/* Section 2: Why It's a Match */}
          {job.whyMatch && (
            <div className="px-4 py-3.5 border-t border-border-light">
              <div className="section-label mb-2">
                Why It&apos;s a Match
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                {job.whyMatch}
              </p>
              {hasRedFlags && (
                <div className="flex items-center gap-1.5 mt-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="text-[13px] text-amber font-semibold">
                    {job.redFlags.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Company Intel */}
          {job.companyIntel && (
            <div className="px-4 py-3.5 border-t border-border-light">
              <div className="section-label mb-2">
                Company Intel
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mb-2">
                {job.companyIntel}
              </p>
              {!job.whyMatch && hasRedFlags && (
                <p className="text-[13px] text-red mb-2 font-medium">
                  {job.redFlags.join(", ")}
                </p>
              )}
              <div className="text-[11px] text-text-tertiary font-medium">
                {[
                  job.companySize,
                  job.industry,
                  job.dateFound && `Found ${fmtDate(job.dateFound)}`,
                  job.source !== "Manual" ? `via ${job.source}` : "Added manually",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          )}

          {/* Contact info */}
          {hasContact && (
            <div className="px-4 py-3.5 border-t border-border-light">
              <div className="section-label mb-2">
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

          {/* Notes */}
          {(showNotes || job.notes) && (
            <div className="px-4 py-3 border-t border-border-light">
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  setNoteSaved(false);
                }}
                placeholder="Quick notes..."
                className="w-full min-h-[48px] p-3 border border-border rounded-std text-[13px] resize-y outline-none text-text-primary bg-surface-warm focus:border-teal transition-colors"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    onSaveNote(job.id, noteText);
                    setNoteSaved(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-std text-xs font-bold cursor-pointer border-none transition-colors ${
                    noteSaved ? "bg-green-light text-green" : "bg-teal text-white"
                  }`}
                >
                  {noteSaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Section 4: Actions */}
          <div className="px-4 py-3.5 flex gap-2.5 flex-wrap border-t border-border-light items-center">
            <button
              onClick={() => onBookmark(job.id, true)}
              className="bg-teal text-white px-5 py-2.5 rounded-std text-[13px] font-bold cursor-pointer border-none shadow-sm"
            >
              Interested
            </button>
            <button
              onClick={() => {
                setDismissing(true);
                setExpanded(false);
              }}
              className="bg-surface-alt text-text-secondary border border-border px-4 py-2.5 rounded-std text-[13px] font-semibold cursor-pointer"
            >
              Pass
            </button>
            {job.applyLink && (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-text-tertiary font-semibold no-underline inline-flex items-center gap-1 ml-auto"
              >
                View Posting <ExternalIcon />
              </a>
            )}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="bg-transparent text-teal border-none px-2.5 py-2 text-[13px] font-semibold cursor-pointer"
            >
              {showNotes || job.notes ? "Notes" : "+ Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
