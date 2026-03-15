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
    <div className="bg-surface border border-green-border rounded-std overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="px-3.5 py-3 cursor-pointer flex items-center justify-between"
      >
        <span className="text-xs font-semibold text-green">
          Resume ready for review
        </span>
        <span className="text-xs text-text-tertiary">
          {open ? "Hide" : "Review"}
        </span>
      </div>

      {open && (
        <div className="expand-in border-t border-border-light">
          {/* Tailored Summary */}
          <div className="px-3.5 py-3 border-b border-border-light">
            <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
              Tailored Summary
            </div>
            <p className="text-[13px] text-text-primary leading-relaxed">
              {tailoredSummary}
            </p>
          </div>

          {/* Skills */}
          <div className="px-3.5 py-3 border-b border-border-light">
            <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
              Skills Emphasized
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="text-xs text-green bg-green-light px-2.5 py-0.5 rounded font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Framing */}
          <div className="px-3.5 py-3 border-b border-border-light">
            <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
              How Experience Was Positioned
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {experienceFraming}
            </p>
          </div>

          {/* Actions */}
          <div className="px-3.5 py-3 flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 bg-text-primary text-white border-none py-2.5 rounded-std text-[13px] font-semibold cursor-pointer"
            >
              Approve
            </button>
            <button className="flex-1 bg-surface-alt text-text-secondary border border-border py-2.5 rounded-std text-[13px] font-medium cursor-pointer">
              Edit Full Doc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
