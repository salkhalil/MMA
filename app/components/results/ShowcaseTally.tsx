"use client";

import { Category } from "@/types";
import { NomineeInfo } from "@/lib/irv-helpers";

interface RevealedWinner {
  category: Category;
  winner: NomineeInfo | null;
  isDraw: boolean;
  drawNames: string;
}

interface Props {
  revealedWinners: RevealedWinner[];
  ceremonyOrder: string[];
  currentCategory: string;
}

const SECTION_GROUPS: { label: string; categories: string[] }[] = [
  {
    label: "Fun Awards",
    categories: [
      "Best M.U.I (Movie Under the Influence)",
      "Best Film Tush Hates",
      "Worst Film Sal Loves",
      "Worst Film",
      "Best Social Experience",
    ],
  },
  {
    label: "Classic",
    categories: ["Best Film Seen at Home"],
  },
  {
    label: "Technical",
    categories: [
      "Best Editing",
      "Best Score",
      "Best Cinematography",
      "Best Screenplay",
      "Best Foreign Language Film",
    ],
  },
  {
    label: "Acting",
    categories: [
      "Best Supporting Actor",
      "Best Supporting Actress",
      "Best Director",
      "Best Actor",
      "Best Actress",
    ],
  },
  {
    label: "The Big Ones",
    categories: ["Best Picture"],
  },
];

export default function ShowcaseTally({
  revealedWinners,
  ceremonyOrder,
  currentCategory,
}: Props) {
  const revealedNames = new Set(revealedWinners.map((w) => w.category.name));
  const latestRevealed = revealedWinners.length > 0
    ? revealedWinners[revealedWinners.length - 1].category.name
    : null;

  return (
    <div
      className="hidden sm:flex flex-col w-72 border-l overflow-y-auto custom-scrollbar"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        backgroundColor: "rgba(255,255,255,0.02)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8b80a8" }}
        >
          Ceremony
        </h3>

        <div className="space-y-3">
          {SECTION_GROUPS.map((group) => {
            // Only show groups that have categories in the ceremony order
            const groupCategories = group.categories.filter((c) =>
              ceremonyOrder.includes(c)
            );
            if (groupCategories.length === 0) return null;

            return (
              <div key={group.label}>
                {/* Section header */}
                <div className="flex items-center gap-2 mb-1.5 mt-1">
                  <p
                    className="text-[9px] font-bold uppercase tracking-widest"
                    style={{ color: "#4b3a6b" }}
                  >
                    {group.label}
                  </p>
                  <div
                    className="flex-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(75, 58, 107, 0.5), transparent)",
                    }}
                  />
                </div>

                <div className="space-y-0.5">
                  {groupCategories.map((name) => {
                    const revealed = revealedWinners.find(
                      (w) => w.category.name === name
                    );
                    const isCurrent =
                      name === currentCategory && !revealedNames.has(name);
                    const isLatest = name === latestRevealed;

                    if (revealed) {
                      const isPerson =
                        revealed.category.type === "ACTOR" ||
                        revealed.category.type === "DIRECTOR";
                      const thumbSrc = revealed.winner
                        ? isPerson && revealed.winner.photoPath
                          ? `https://image.tmdb.org/t/p/w92${revealed.winner.photoPath}`
                          : revealed.winner.posterPath
                          ? `https://image.tmdb.org/t/p/w92${revealed.winner.posterPath}`
                          : null
                        : null;

                      return (
                        <div
                          key={name}
                          className={`flex items-center gap-2.5 p-2 rounded-lg ${
                            isLatest ? "golden-shimmer" : ""
                          }`}
                          style={{
                            backgroundColor: isLatest
                              ? undefined
                              : "rgba(251, 191, 36, 0.06)",
                            borderLeft: "3px solid #f59e0b",
                          }}
                        >
                          {thumbSrc && (
                            <div
                              className="flex-shrink-0 overflow-hidden"
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: isPerson ? "50%" : 4,
                              }}
                            >
                              <img
                                src={thumbSrc}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-[10px] font-medium truncate"
                              style={{ color: "#fbbf24" }}
                            >
                              {name}
                            </p>
                            <p
                              className="text-xs font-semibold truncate"
                              style={{ color: "#f8f7fc" }}
                            >
                              {revealed.isDraw
                                ? revealed.drawNames
                                : revealed.winner?.label ?? "No winner"}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (isCurrent) {
                      return (
                        <div
                          key={name}
                          className="flex items-center gap-2.5 p-2 rounded-lg"
                          style={{
                            backgroundColor: "rgba(167, 139, 250, 0.1)",
                            border: "1px solid rgba(167, 139, 250, 0.3)",
                            boxShadow: "0 0 12px rgba(167, 139, 250, 0.15)",
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: "#a78bfa" }}
                          />
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: "#a78bfa" }}
                          >
                            {name}
                          </p>
                        </div>
                      );
                    }

                    // Upcoming
                    return (
                      <div
                        key={name}
                        className="flex items-center gap-2.5 p-2"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: "#2e2440" }}
                        />
                        <p
                          className="text-xs truncate"
                          style={{ color: "#4b3a6b" }}
                        >
                          {name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
