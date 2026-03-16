"use client";

import { useState } from "react";

interface ResumeReviewProps {
  tailoredSummary: string;
  skillsEmphasized: string;
  experienceFraming: string;
  onApprove: () => void;
}

export default function ResumeReview({
  tailoredSummary,
  skillsEmphasized,
  experienceFraming,
  onApprove,
}: ResumeReviewProps) {
  const [open, setOpen] = useState(false);

  const skills = skillsEmphasized
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-surface rounded-card shadow-card overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="px-4 py-3.5 cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green flex-shrink-0" />
          <span className="text-[13px] font-semibold text-green">
            Resume ready for review
          </span>
        </div>
        <span className="text-xs text-text-tertiary font-medium">
          {open ? "Hide" : "Review"}
        </span>
      </div>

      {open && (
        <div className="expand-in border-t border-border-light">
          {/* Tailored Summary */}
          <div className="px-4 py-3.5 border-b border-border-light">
            <div className="section-label mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-teal rounded-full" />
              Tailored Summary
            </div>
            <p className="text-[13px] text-text-primary leading-relaxed">
              {tailoredSummary}
            </p>
          </div>

          {/* Skills */}
          <div className="px-4 py-3.5 border-b border-border-light">
            <div className="section-label mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-green rounded-full" />
              Skills Emphasized
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="text-xs text-green bg-green-light px-2.5 py-1 rounded-std font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Framing */}
          <div className="px-4 py-3.5 border-b border-border-light">
            <div className="section-label mb-2 flex items-center gap-1.5">
              <span className="w-1 h-3 bg-gold rounded-full" />
              How Experience Was Positioned
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {experienceFraming}
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 py-3.5 flex gap-2.5">
            <button
              onClick={onApprove}
              className="flex-1 bg-teal text-white border-none py-2.5 rounded-std text-[13px] font-bold cursor-pointer shadow-button"
            >
              Approve
            </button>
            <button className="flex-1 bg-surface-alt text-text-secondary border-none py-2.5 rounded-std text-[13px] font-medium cursor-pointer shadow-sm">
              Edit Full Doc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
