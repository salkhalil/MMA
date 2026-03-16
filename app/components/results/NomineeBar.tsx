"use client";

import { NomineeInfo } from "@/lib/irv-helpers";

interface Props {
  info: NomineeInfo;
  votes: number;
  maxVotes: number;
  totalVotes: number;
  state: "active" | "eliminated" | "winner";
  categoryType: string;
}

export default function NomineeBar({
  info,
  votes,
  maxVotes,
  totalVotes,
  state,
  categoryType,
}: Props) {
  const pct = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
  const votePct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  const imgSrc =
    categoryType !== "FILM" && info?.photoPath
      ? `https://image.tmdb.org/t/p/w92${info.photoPath}`
      : info?.posterPath
      ? `https://image.tmdb.org/t/p/w92${info.posterPath}`
      : null;

  return (
    <div
      className="flex items-center gap-3 transition-all duration-500"
      style={{
        opacity: state === "eliminated" ? 0.4 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "var(--background-secondary)" }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={info?.label ?? ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="text-xs font-bold"
            style={{ color: "var(--text-tertiary)" }}
          >
            {info?.label?.charAt(0) ?? "?"}
          </span>
        )}
      </div>

      {/* Label + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{
                color:
                  state === "winner"
                    ? "var(--warning)"
                    : "var(--text-primary)",
              }}
            >
              {info?.label ?? "Unknown"}
            </p>
            {categoryType !== "FILM" && info?.movieTitle && (
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-tertiary)" }}
              >
                {info.movieTitle}
              </p>
            )}
          </div>
          <span
            className="text-xs font-medium flex-shrink-0 ml-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {votes} ({votePct}%)
          </span>
        </div>

        {/* Bar */}
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--background-secondary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background:
                state === "winner"
                  ? "var(--gradient-warm)"
                  : state === "eliminated"
                  ? "var(--text-tertiary)"
                  : "var(--gradient-primary)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
