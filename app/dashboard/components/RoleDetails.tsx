"use client";

interface RoleDetailsProps {
  roleSummary: string;
  keyRequirements: string[];
  matchedSkills: string[];
  skillGaps: string[];
}

export default function RoleDetails({
  roleSummary,
  keyRequirements,
  matchedSkills,
  skillGaps,
}: RoleDetailsProps) {
  const hasContent = roleSummary || keyRequirements.length > 0 || matchedSkills.length > 0 || skillGaps.length > 0;
  if (!hasContent) return null;

  return (
    <div className="px-4 pt-3.5 pb-1">
      {roleSummary && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
            Role Details
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {roleSummary}
          </p>
        </div>
      )}

      {keyRequirements.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
            Requirements
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keyRequirements.map((req, i) => (
              <span
                key={i}
                className="text-xs text-text-secondary bg-surface-alt px-2.5 py-1 rounded-md font-medium border border-border-light"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {matchedSkills.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
            Your Skills Match
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.map((skill, i) => (
              <span
                key={i}
                className="text-xs text-green bg-green-light px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {skillGaps.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wide mb-1.5">
            Gaps to Note
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillGaps.map((gap, i) => (
              <span
                key={i}
                className="text-xs text-amber bg-amber-light px-2.5 py-1 rounded-md font-medium inline-flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
