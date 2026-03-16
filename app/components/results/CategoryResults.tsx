"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Category } from "@/types";
import { IRVResult, IRVRound } from "@/lib/irv";
import { NomineeInfo } from "@/lib/irv-helpers";
import NomineeBar from "./NomineeBar";
import RoundControls from "./RoundControls";

interface Props {
  category: Category;
  result: IRVResult;
  nominees: Record<string, NomineeInfo>;
}

export default function CategoryResults({ category, result, nominees }: Props) {
  const [currentRound, setCurrentRound] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalRounds = result.rounds.length;

  const advance = useCallback(() => {
    setCurrentRound((prev) => {
      if (prev < totalRounds - 1) return prev + 1;
      setAutoPlay(false);
      return prev;
    });
  }, [totalRounds]);

  useEffect(() => {
    if (autoPlay) {
      timerRef.current = setTimeout(advance, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlay, currentRound, advance]);

  if (totalRounds === 0) {
    return (
      <div className="text-center py-12">
        <p style={{ color: "var(--text-tertiary)" }}>No votes for this category</p>
      </div>
    );
  }

  const round: IRVRound = result.rounds[currentRound];
  const isLastRound = currentRound === totalRounds - 1;

  // Get all nominees sorted by tally descending
  const sortedNominees = Object.entries(round.tallies).sort(
    ([, a], [, b]) => b - a
  );
  const maxVotes = Math.max(...Object.values(round.tallies), 1);

  // Collect all eliminated nominees from previous rounds
  const previouslyEliminated = new Set<string>();
  for (let i = 0; i < currentRound; i++) {
    for (const e of result.rounds[i].eliminated) previouslyEliminated.add(e);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{
            background: "var(--gradient-warm)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {category.name}
        </h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Round {round.roundNumber} of {totalRounds}
          {round.totalExhausted > 0 && (
            <span className="ml-2" style={{ color: "var(--text-tertiary)" }}>
              ({round.totalExhausted} exhausted)
            </span>
          )}
        </p>
      </div>

      {/* Bar chart */}
      <div
        className="rounded-xl p-6 space-y-3"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
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
            <NomineeBar
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

        {/* Show previously eliminated (greyed out) */}
        {previouslyEliminated.size > 0 && (
          <div className="pt-3 mt-3 space-y-2" style={{ borderTop: "1px solid var(--card-border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              Previously eliminated
            </p>
            {[...previouslyEliminated].map((id) => {
              const info = nominees[id];
              return (
                <NomineeBar
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

      {/* Winner / Draw announcement */}
      {isLastRound && (result.winner || result.isDraw) && (
        <div
          className="text-center p-6 rounded-xl winnerReveal"
          style={{
            background: result.winner
              ? "var(--gradient-warm)"
              : "var(--gradient-primary)",
          }}
        >
          <p className="text-sm font-medium text-white/80 mb-1">
            {result.winner ? "Winner" : "Draw"}
          </p>
          <p className="text-2xl font-bold text-white">
            {result.winner
              ? nominees[result.winner]?.label
              : result.drawBetween.map((id) => nominees[id]?.label).join(" & ")}
          </p>
        </div>
      )}

      {/* Controls */}
      <RoundControls
        currentRound={currentRound}
        totalRounds={totalRounds}
        autoPlay={autoPlay}
        onPrev={() => {
          setAutoPlay(false);
          setCurrentRound((p) => Math.max(0, p - 1));
        }}
        onNext={() => {
          setAutoPlay(false);
          setCurrentRound((p) => Math.min(totalRounds - 1, p + 1));
        }}
        onToggleAutoPlay={() => setAutoPlay((p) => !p)}
        onSkipToEnd={() => {
          setAutoPlay(false);
          setCurrentRound(totalRounds - 1);
        }}
      />
    </div>
  );
}
