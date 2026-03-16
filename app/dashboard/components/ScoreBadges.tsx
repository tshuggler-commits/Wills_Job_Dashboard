"use client";

interface ScoreBadgesProps {
  fitScore: number | null;
  matchScore: number | null;
  compact?: boolean;
}

function badgeColor(score: number | null): string {
  if (score === null) return "bg-surface-alt text-text-tertiary";
  if (score >= 8) return "bg-green-light text-green";
  if (score >= 6) return "bg-amber-light text-amber";
  return "bg-surface-alt text-text-tertiary";
}

export default function ScoreBadges({ fitScore, matchScore, compact }: ScoreBadgesProps) {
  if (fitScore === null && matchScore === null) {
    return (
      <div className="flex-shrink-0 bg-surface-alt text-text-tertiary rounded-std px-2.5 py-1.5 text-[11px] font-semibold">
        NEW
      </div>
    );
  }

  const size = compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs";

  return (
    <div className="flex gap-1 flex-shrink-0">
      <div className={`rounded-std font-bold font-mono ${size} ${badgeColor(fitScore)}`}>
        {fitScore ?? "–"}{" "}
        <span className="font-semibold font-sans text-[10px] opacity-70">Fit</span>
      </div>
      <div className={`rounded-std font-bold font-mono ${size} ${badgeColor(matchScore)}`}>
        {matchScore ?? "–"}{" "}
        <span className="font-semibold font-sans text-[10px] opacity-70">Match</span>
      </div>
    </div>
  );
}
