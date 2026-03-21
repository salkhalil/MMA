"use client";

import { NomineeInfo } from "@/lib/irv-helpers";

interface Props {
  info: NomineeInfo;
  votes: number;
  maxVotes: number;
  totalVotes: number;
  state: "active" | "eliminated" | "winner";
  categoryType: string;
  potential?: number;
  showPotential?: boolean;
}

export default function ShowcaseNomineeBar({
  info,
  votes,
  maxVotes,
  totalVotes,
  state,
  categoryType,
  potential,
  showPotential,
}: Props) {
  const pct = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  const votePct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  const isPerson = categoryType !== "FILM";
  const imgSrc =
    isPerson && info?.photoPath
      ? `https://image.tmdb.org/t/p/w185${info.photoPath}`
      : info?.posterPath
      ? `https://image.tmdb.org/t/p/w185${info.posterPath}`
      : null;

  return (
    <div
      className="flex items-center gap-4 transition-all duration-500 py-2"
      style={{ opacity: state === "eliminated" ? 0.3 : 1 }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{
          width: isPerson ? 56 : 44,
          height: isPerson ? 56 : 56,
          borderRadius: isPerson ? "50%" : 8,
          backgroundColor: "rgba(255,255,255,0.08)",
          border: state === "winner" ? "2px solid #f59e0b" : "2px solid transparent",
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={info?.label ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm font-bold" style={{ color: "#8b80a8" }}>
            {info?.label?.charAt(0) ?? "?"}
          </span>
        )}
      </div>

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="min-w-0">
            <p
              className="text-base font-semibold truncate"
              style={{
                color: state === "winner" ? "#fbbf24" : "#f8f7fc",
              }}
            >
              {info?.label ?? "Unknown"}
            </p>
            {isPerson && info?.movieTitle && (
              <p className="text-sm truncate" style={{ color: "#8b80a8" }}>
                {info.movieTitle}
              </p>
            )}
          </div>
          <span className="flex items-center gap-2 flex-shrink-0 ml-3">
            {showPotential && potential != null && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(167,139,250,0.15)",
                  color: "#a78bfa",
                }}
              >
                {potential} supporters
              </span>
            )}
            <span
              className="text-sm font-medium"
              style={{ color: "#c4b5e8" }}
            >
              {votes} ({votePct}%)
            </span>
          </span>
        </div>

        {/* Bar */}
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background:
                state === "winner"
                  ? "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)"
                  : state === "eliminated"
                  ? "#4b3a6b"
                  : "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
