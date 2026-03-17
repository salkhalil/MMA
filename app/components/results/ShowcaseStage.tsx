"use client";

import { Category } from "@/types";
import { IRVResult, IRVRound } from "@/lib/irv";
import { NomineeInfo } from "@/lib/irv-helpers";
import ShowcaseNomineeBar from "./ShowcaseNomineeBar";

interface Props {
  category: Category;
  result: IRVResult;
  nominees: Record<string, NomineeInfo>;
  phase: "intro" | "rounds" | "winner" | "transition";
  roundIndex: number;
}

export default function ShowcaseStage({
  category,
  result,
  nominees,
  phase,
  roundIndex,
}: Props) {
  if (phase === "transition") {
    return <div className="w-full max-w-2xl mx-auto" style={{ opacity: 0 }} />;
  }

  // Intro phase
  if (phase === "intro") {
    return (
      <div className="w-full max-w-2xl mx-auto text-center categoryIntro">
        <p className="text-lg font-medium mb-3" style={{ color: "#8b80a8" }}>
          Presenting
        </p>
        <h1
          className="text-5xl sm:text-6xl font-bold"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {category.name}
        </h1>
        <p className="text-sm mt-4" style={{ color: "#8b80a8" }}>
          {result.rounds.length} round{result.rounds.length !== 1 ? "s" : ""} of voting
        </p>
      </div>
    );
  }

  const totalRounds = result.rounds.length;

  // Winner phase
  if (phase === "winner") {
    const winnerInfo = result.winner ? nominees[result.winner] : null;
    const isDraw = result.isDraw;
    const isPerson = category.type !== "FILM";

    const getHeroImg = (info: NomineeInfo | null) => {
      if (!info) return null;
      if (isPerson && info.photoPath)
        return `https://image.tmdb.org/t/p/w300${info.photoPath}`;
      if (info.posterPath)
        return `https://image.tmdb.org/t/p/w300${info.posterPath}`;
      return null;
    };

    const heroImg = getHeroImg(winnerInfo);
    const drawNominees = isDraw
      ? result.drawBetween.map((id) => nominees[id]).filter(Boolean)
      : [];

    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <p className="text-lg font-medium" style={{ color: "#8b80a8" }}>
          {category.name}
        </p>

        <p
          className="text-xl animate-fade-in-up"
          style={{ color: "#c4b5e8" }}
        >
          {isDraw ? "It's a draw..." : "And the winner is..."}
        </p>

        <div className="winnerReveal space-y-4">
          {/* Single winner image */}
          {!isDraw && heroImg && (
            <div className="flex justify-center">
              <div
                className="overflow-hidden shadow-2xl"
                style={{
                  width: isPerson ? 160 : 140,
                  height: isPerson ? 160 : 210,
                  borderRadius: isPerson ? "50%" : 12,
                  border: "3px solid #f59e0b",
                }}
              >
                <img
                  src={heroImg}
                  alt={winnerInfo?.label ?? ""}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Draw — show all tied nominees */}
          {isDraw && drawNominees.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {drawNominees.map((info) => {
                const img = getHeroImg(info);
                if (!img) return null;
                return (
                  <div
                    key={info.id}
                    className="overflow-hidden shadow-2xl"
                    style={{
                      width: isPerson ? 130 : 110,
                      height: isPerson ? 130 : 170,
                      borderRadius: isPerson ? "50%" : 12,
                      border: "3px solid #f59e0b",
                    }}
                  >
                    <img
                      src={img}
                      alt={info.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <h2
            className="text-4xl sm:text-5xl font-bold shimmer"
            style={{
              background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {winnerInfo
              ? winnerInfo.label
              : isDraw
              ? drawNominees.map((n) => n.label).join(" & ")
              : "No winner"}
          </h2>

          {winnerInfo && isPerson && winnerInfo.movieTitle && (
            <p className="text-lg" style={{ color: "#c4b5e8" }}>
              {winnerInfo.movieTitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Rounds phase
  const round: IRVRound = result.rounds[roundIndex];
  if (!round) return null;

  const sortedNominees = Object.entries(round.tallies).sort(
    ([, a], [, b]) => b - a
  );
  const maxVotes = Math.max(...Object.values(round.tallies), 1);

  const previouslyEliminated = new Set<string>();
  for (let i = 0; i < roundIndex; i++) {
    for (const e of result.rounds[i].eliminated) previouslyEliminated.add(e);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {category.name}
        </h2>
        <p className="text-sm" style={{ color: "#8b80a8" }}>
          Round {round.roundNumber} of {totalRounds}
        </p>
      </div>

      {/* Bars */}
      <div
        className="rounded-2xl p-6 space-y-1"
        style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        {sortedNominees.map(([id, votes]) => {
          const info = nominees[id];
          const isEliminated = round.eliminated.includes(id);
          const isWinner = round.winner === id;
          const state = isWinner
            ? ("winner" as const)
            : isEliminated
            ? ("eliminated" as const)
            : ("active" as const);

          return (
            <ShowcaseNomineeBar
              key={id}
              info={info}
              votes={votes}
              maxVotes={maxVotes}
              totalVotes={round.totalActiveVotes}
              state={state}
              categoryType={category.type}
            />
          );
        })}

        {previouslyEliminated.size > 0 && (
          <div
            className="pt-3 mt-2 space-y-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs font-medium mb-2" style={{ color: "#6b5a8a" }}>
              Previously eliminated
            </p>
            {[...previouslyEliminated].map((id) => {
              const info = nominees[id];
              return (
                <ShowcaseNomineeBar
                  key={id}
                  info={info}
                  votes={0}
                  maxVotes={maxVotes}
                  totalVotes={round.totalActiveVotes}
                  state="eliminated"
                  categoryType={category.type}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Round dots */}
      <div className="flex justify-center gap-2 pt-2">
        {result.rounds.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === roundIndex ? 10 : 6,
              height: i === roundIndex ? 10 : 6,
              backgroundColor:
                i === roundIndex
                  ? "#fbbf24"
                  : i < roundIndex
                  ? "#a78bfa"
                  : "#4b3a6b",
            }}
          />
        ))}
      </div>
    </div>
  );
}
