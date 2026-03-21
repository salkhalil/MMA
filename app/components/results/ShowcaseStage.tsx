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

function LetterStagger({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className} style={style}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: 0,
            animation: `letterFadeIn 0.3s ease-out ${i * 0.04}s forwards`,
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default function ShowcaseStage({
  category,
  result,
  nominees,
  phase,
  roundIndex,
}: Props) {
  if (phase === "transition") {
    return <div className="w-full max-w-2xl mx-auto zoom-fade-out" />;
  }

  // Intro phase
  if (phase === "intro") {
    return (
      <div className="w-full max-w-2xl mx-auto text-center stagger-fade-in zoom-fade-in">
        <p
          className="text-lg font-medium tracking-widest uppercase mb-4"
          style={{ color: "#8b80a8" }}
        >
          Presenting
        </p>

        <div className="ornament mb-5">
          <span style={{ color: "#8b80a8", fontSize: 10 }}>&#9670;</span>
        </div>

        <h1
          className="text-5xl sm:text-6xl font-bold blurIn"
          style={{
            background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {category.name}
        </h1>

        <div className="mt-6 space-y-1">
          <p className="text-sm font-medium" style={{ color: "#c4b5e8" }}>
            {result.rounds.length} round{result.rounds.length !== 1 ? "s" : ""}{" "}
            of voting
          </p>
          <p className="text-xs" style={{ color: "#6b5a8a" }}>
            Preferential Ballot Voting
          </p>
        </div>
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

    const winnerName = winnerInfo
      ? winnerInfo.label
      : isDraw
        ? drawNominees.map((n) => n.label).join(" & ")
        : "No winner";

    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6">
        <p className="text-lg font-medium" style={{ color: "#8b80a8" }}>
          {category.name}
        </p>

        <p className="text-xl typewriter-label" style={{ color: "#c4b5e8" }}>
          {isDraw ? "It\u2019s a draw..." : "And the winner is..."}
        </p>

        <div className="space-y-4" style={{ animation: "none" }}>
          {/* Single winner image — delayed 0.8s */}
          {!isDraw && heroImg && (
            <div
              className="flex justify-center"
              style={{
                opacity: 0,
                animation:
                  "springBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards",
              }}
            >
              <div
                className="overflow-hidden shadow-2xl glowPulse"
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
              {drawNominees.map((info, i) => {
                const img = getHeroImg(info);
                if (!img) return null;
                return (
                  <div
                    key={info.id}
                    className="overflow-hidden shadow-2xl glowPulse"
                    style={{
                      opacity: 0,
                      animation: `springBounce 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.8 + i * 0.15}s forwards`,
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

          {/* Winner name — letter stagger, delayed after image */}
          <div
            style={{
              opacity: 0,
              animation: `fadeInUp 0.5s ease-out ${isDraw ? 1.2 : 1.3}s forwards`,
            }}
          >
            <LetterStagger
              text={winnerName}
              className="text-4xl sm:text-5xl font-bold shimmer inline-block"
              style={{
                background: "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                backgroundSize: "200% auto",
              }}
            />
          </div>

          {winnerInfo && isPerson && winnerInfo.movieTitle && (
            <p
              className="text-lg"
              style={{
                color: "#c4b5e8",
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${isDraw ? 1.5 : 1.6}s forwards`,
              }}
            >
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

  const isLastRound = roundIndex === totalRounds - 1;
  const isTiebreak = round.tiebrokenBy === "potential";

  const sortedNominees = Object.entries(round.tallies).sort(
    ([, a], [, b]) => b - a,
  );
  const maxVotes = Math.max(...Object.values(round.tallies), 1);

  const previouslyEliminated = new Set<string>();
  for (let i = 0; i < roundIndex; i++) {
    for (const e of result.rounds[i].eliminated) previouslyEliminated.add(e);
  }

  const progressPct = ((roundIndex + 1) / totalRounds) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <p
          className="text-sm font-medium uppercase tracking-wider mb-2 animate-fade-in-up"
          style={{ color: "#a78bfa" }}
        >
          {isLastRound
            ? "Final Round"
            : `Elimination Round ${round.roundNumber}`}
        </p>
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
        {isTiebreak && (
          <p
            className="text-xs mt-1.5 px-2.5 py-1 rounded-full inline-block"
            style={{
              backgroundColor: "rgba(167,139,250,0.12)",
              color: "#a78bfa",
            }}
          >
            Tiebreak: fewer supporters → eliminated
          </p>
        )}
      </div>

      {/* Bars */}
      <div
        className="rounded-2xl p-6 space-y-1 slide-up-stagger"
        key={`round-${roundIndex}`}
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
            <div
              key={id}
              style={
                isEliminated
                  ? { animation: "eliminatedFlash 1s ease-out 0.5s forwards" }
                  : undefined
              }
            >
              <ShowcaseNomineeBar
                info={info}
                votes={votes}
                maxVotes={maxVotes}
                totalVotes={round.totalActiveVotes}
                state={state}
                categoryType={category.type}
                potential={isTiebreak ? round.potential?.[id] : undefined}
                showPotential={isTiebreak}
              />
            </div>
          );
        })}

        {previouslyEliminated.size > 0 && (
          <div
            className="pt-3 mt-2 space-y-1"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-xs font-medium mb-2"
              style={{ color: "#6b5a8a" }}
            >
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

      {/* Progress bar */}
      <div className="flex flex-col items-center gap-1.5 pt-2">
        <div
          className="w-32 h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full progress-fill"
            style={
              {
                "--progress-width": `${progressPct}%`,
                background: "linear-gradient(90deg, #a78bfa, #fbbf24)",
              } as React.CSSProperties
            }
          />
        </div>
        <p className="text-[10px] font-medium" style={{ color: "#6b5a8a" }}>
          {roundIndex + 1} / {totalRounds}
        </p>
      </div>
    </div>
  );
}
