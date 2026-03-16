"use client";

import { Category } from "@/types";
import { IRVResult } from "@/lib/irv";
import { NomineeInfo } from "@/lib/irv-helpers";

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  FILM: { bg: "var(--primary)", color: "white" },
  ACTOR: { bg: "var(--accent)", color: "white" },
  DIRECTOR: { bg: "var(--secondary)", color: "white" },
};

interface Props {
  category: Category;
  result: IRVResult;
  nominees: Record<string, NomineeInfo>;
  onClick: () => void;
}

export default function WinnerCard({ category, result, nominees, onClick }: Props) {
  const winnerInfo = result.winner ? nominees[result.winner] : null;
  const typeStyle = TYPE_COLORS[category.type];
  const hasVotes = result.rounds.length > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden transition-all hover:scale-102 shadow-md"
      style={{
        backgroundColor: "var(--card-bg)",
        border: result.winner
          ? "2px solid var(--warning)"
          : result.isDraw
          ? "2px solid var(--accent)"
          : "1px solid var(--card-border)",
      }}
    >
      {/* Poster / Photo */}
      <div
        className="relative h-48 flex items-center justify-center"
        style={{ background: "var(--background-secondary)" }}
      >
        {winnerInfo?.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${winnerInfo.posterPath}`}
            alt={winnerInfo.label}
            className="w-full h-full object-cover"
          />
        ) : winnerInfo?.photoPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${winnerInfo.photoPath}`}
            alt={winnerInfo.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="text-4xl font-bold"
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {hasVotes ? "?" : "--"}
          </div>
        )}

        {/* Winner / Draw badge */}
        {result.winner && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: "var(--gradient-warm)",
              color: "white",
            }}
          >
            WINNER
          </div>
        )}
        {result.isDraw && (
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
            }}
          >
            DRAW
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
          >
            {category.type}
          </span>
          <h3
            className="font-semibold text-sm truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {category.name}
          </h3>
        </div>

        {winnerInfo ? (
          <div>
            <p
              className="font-bold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {winnerInfo.label}
            </p>
            {category.type !== "FILM" && (
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {winnerInfo.movieTitle}
              </p>
            )}
          </div>
        ) : result.isDraw ? (
          <p
            className="font-bold text-sm"
            style={{ color: "var(--accent)" }}
          >
            {result.drawBetween.map((id) => nominees[id]?.label).join(" & ")}
          </p>
        ) : (
          <p
            className="text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            No votes
          </p>
        )}

        <p
          className="text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          {result.rounds.length} round{result.rounds.length !== 1 ? "s" : ""}
        </p>
      </div>
    </button>
  );
}
