"use client";

interface ScoreBadgesProps {
  fitScore: number | null;
  matchScore: number | null;
  totalScore: number | null;
  compact?: boolean;
}

export default function ScoreBadges({ fitScore, matchScore, totalScore, compact }: ScoreBadgesProps) {
  // No scores at all
  if (fitScore === null && matchScore === null && totalScore === null) {
    return (
      <div className="flex-shrink-0 bg-gold-light text-gold rounded-std px-2.5 py-1.5 text-[11px] font-bold">
        NEW
      </div>
    );
  }

  const size = compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs";

  // Old-format jobs: only matchScore (old blended), no fitScore or totalScore
  if (fitScore === null && totalScore === null && matchScore !== null) {
    return (
      <div className="flex-shrink-0">
        <div className={`badge-match rounded-std font-bold font-mono ${size}`}>
          {matchScore}
        </div>
      </div>
    );
  }

  // v6 format: both sub-scores available
  return (
    <div className="flex gap-1 flex-shrink-0">
      <div className={`badge-fit rounded-std font-bold font-mono ${size}`}>
        {fitScore ?? "?"}{" "}
        <span className="font-semibold font-sans text-[10px] opacity-80">Fit</span>
      </div>
      <div className={`badge-match rounded-std font-bold font-mono ${size}`}>
        {matchScore ?? "?"}{" "}
        <span className="font-semibold font-sans text-[10px] opacity-80">Match</span>
      </div>
    </div>
  );
}
