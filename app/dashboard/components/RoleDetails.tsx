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
    <div className="px-4 pt-4 pb-1">
      {roleSummary && (
        <div className="mb-4">
          <div className="section-label mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-gold rounded-full" />
            Role Details
          </div>
          <p className="text-[13px] text-text-secondary leading-[1.6]">
            {roleSummary}
          </p>
        </div>
      )}

      {keyRequirements.length > 0 && (
        <div className="mb-4">
          <div className="section-label mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-gold rounded-full" />
            Requirements
          </div>
          <div className="flex flex-wrap gap-2">
            {keyRequirements.map((req, i) => (
              <span
                key={i}
                className="text-xs text-text-secondary bg-surface-alt px-3 py-1.5 rounded-std font-medium shadow-sm"
              >
                {req}
              </span>
            ))}
          </div>
        </div>
      )}

      {matchedSkills.length > 0 && (
        <div className="mb-4">
          <div className="section-label mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-green rounded-full" />
            Your Skills Match
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill, i) => (
              <span
                key={i}
                className="text-xs text-green bg-green-light px-3 py-1.5 rounded-std font-medium inline-flex items-center gap-1"
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
        <div className="mb-4">
          <div className="section-label mb-2 flex items-center gap-1.5">
            <span className="w-1 h-3 bg-amber rounded-full" />
            Gaps to Note
          </div>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((gap, i) => (
              <span
                key={i}
                className="text-xs text-amber bg-amber-light px-3 py-1.5 rounded-std font-medium inline-flex items-center gap-1"
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
