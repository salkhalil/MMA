"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { Category } from "@/types";
import { IRVResult } from "@/lib/irv";
import { NomineeInfo } from "@/lib/irv-helpers";
import { sortByCeremonyOrder, CEREMONY_ORDER } from "@/lib/ceremony-order";
import { fireWinnerConfetti, fireBestPictureConfetti } from "@/lib/confetti";
import ShowcaseStage from "@/app/components/results/ShowcaseStage";
import ShowcaseTally from "@/app/components/results/ShowcaseTally";

interface CategoryResult {
  category: Category;
  result: IRVResult;
  nominees: Record<string, NomineeInfo>;
}

type Phase = "intro" | "rounds" | "winner" | "transition";

export default function ShowcasePage() {
  const { currentUserId } = useUser();
  const router = useRouter();

  const [results, setResults] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(true);

  const [categoryIndex, setCategoryIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealedWinners, setRevealedWinners] = useState<
    { category: Category; winner: NomineeInfo | null; isDraw: boolean; drawNames: string }[]
  >([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiFired = useRef(false);

  // Fetch results
  const fetchResults = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/results");
      if (!res.ok) return;
      const data: CategoryResult[] = await res.json();
      setResults(sortByCeremonyOrder(data));
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const current = results[categoryIndex];
  const totalRounds = current?.result.rounds.length ?? 0;
  const isBestPicture = current?.category.name === "Best Picture";
  const isLastCategory = categoryIndex === results.length - 1;

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Intro phase auto-advance
  useEffect(() => {
    if (phase === "intro") {
      timerRef.current = setTimeout(() => {
        setPhase("rounds");
        setRoundIndex(0);
      }, 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, categoryIndex]);

  // Auto-advance rounds
  useEffect(() => {
    if (phase === "rounds" && roundIndex < totalRounds - 1) {
      timerRef.current = setTimeout(() => {
        setRoundIndex((r) => r + 1);
      }, 2500);
    } else if (phase === "rounds" && roundIndex === totalRounds - 1) {
      // Last round reached — move to winner
      timerRef.current = setTimeout(() => {
        setPhase("winner");
        confettiFired.current = false;
      }, 2500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, roundIndex, totalRounds]);

  // Fire confetti on winner phase
  useEffect(() => {
    if (phase === "winner" && !confettiFired.current) {
      confettiFired.current = true;
      if (isBestPicture) {
        fireBestPictureConfetti();
      } else {
        fireWinnerConfetti();
      }
    }
  }, [phase, isBestPicture]);

  const advance = useCallback(() => {
    if (!current) return;

    if (phase === "intro") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("rounds");
      setRoundIndex(0);
      return;
    }

    if (phase === "rounds") {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (roundIndex < totalRounds - 1) {
        setRoundIndex((r) => r + 1);
      } else {
        setPhase("winner");
        confettiFired.current = false;
      }
      return;
    }

    if (phase === "winner") {
      // Record winner and move to next category
      const result = current.result;
      const winnerInfo = result.winner ? current.nominees[result.winner] : null;
      setRevealedWinners((prev) => [
        ...prev,
        {
          category: current.category,
          winner: winnerInfo,
          isDraw: result.isDraw,
          drawNames: result.isDraw
            ? result.drawBetween.map((id) => current.nominees[id]?.label).join(" & ")
            : "",
        },
      ]);

      if (isLastCategory) return; // Stay on final winner

      setPhase("transition");
      timerRef.current = setTimeout(() => {
        setCategoryIndex((i) => i + 1);
        setPhase("intro");
        setRoundIndex(0);
      }, 500);
      return;
    }
  }, [current, phase, roundIndex, totalRounds, isLastCategory]);

  const goBack = useCallback(() => {
    if (phase === "rounds" && roundIndex > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRoundIndex((r) => r - 1);
    } else if (phase === "rounds" && roundIndex === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("intro");
    } else if (phase === "winner") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("rounds");
      setRoundIndex(totalRounds - 1);
    }
  }, [phase, roundIndex, totalRounds]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      } else if (e.key === "Escape") {
        router.push("/results");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, goBack, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-4"
          style={{ borderColor: "#f59e0b" }}
        />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "#8b80a8" }}>No results available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" onClick={advance}>
      {/* Main stage */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Category counter */}
        <div
          className="absolute top-6 left-8 text-sm font-medium"
          style={{ color: "#8b80a8" }}
        >
          {categoryIndex + 1} / {results.length}
        </div>

        {/* Exit button */}
        <button
          className="absolute top-6 right-8 text-sm font-medium px-3 py-1 rounded-lg transition-colors"
          style={{ color: "#8b80a8", backgroundColor: "rgba(255,255,255,0.05)" }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/results");
          }}
        >
          ESC
        </button>

        {current && (
          <ShowcaseStage
            category={current.category}
            result={current.result}
            nominees={current.nominees}
            phase={phase}
            roundIndex={roundIndex}
          />
        )}
      </div>

      {/* Tally sidebar */}
      <ShowcaseTally
        revealedWinners={revealedWinners}
        ceremonyOrder={CEREMONY_ORDER}
        currentCategory={current?.category.name ?? ""}
      />

      {/* Mobile bottom count */}
      <div
        className="fixed bottom-4 right-4 px-3 py-2 rounded-full text-xs font-bold sm:hidden"
        style={{
          background: "var(--gradient-warm)",
          color: "white",
        }}
      >
        {revealedWinners.length} / {results.length}
      </div>
    </div>
  );
}
