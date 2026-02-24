"use client";

import { Category, MoviePool } from "@/types";

interface Props {
  categories: Category[];
  completedIds: Set<number>;
  locked: boolean;
  onSelect: (id: number) => void;
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  FILM: { bg: "var(--primary)", color: "white" },
  ACTOR: { bg: "var(--accent)", color: "white" },
  DIRECTOR: { bg: "var(--secondary)", color: "white" },
};

const POOL_LABELS: Record<MoviePool, string> = {
  NEW_RELEASE: "New Releases",
  CLASSIC: "Classics",
  ALL: "Wildcard",
};

export default function CategoryList({
  categories,
  completedIds,
  locked,
  onSelect,
}: Props) {
  const totalCount = categories.length;
  const completedCount = categories.filter((c) => completedIds.has(c.id)).length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const grouped = categories.reduce<Record<MoviePool, Category[]>>(
    (acc, cat) => {
      acc[cat.pool] = acc[cat.pool] || [];
      acc[cat.pool].push(cat);
      return acc;
    },
    {} as Record<MoviePool, Category[]>
  );

  const pools: MoviePool[] = ["NEW_RELEASE", "CLASSIC", "ALL"];

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span style={{ color: "var(--text-secondary)" }}>
            Progress: {completedCount}/{totalCount}
          </span>
          <span style={{ color: "var(--primary)" }}>{pct}%</span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--background-secondary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>
      </div>

      {/* Category groups */}
      {pools.map((pool) => {
        const cats = grouped[pool];
        if (!cats?.length) return null;
        return (
          <div key={pool} className="space-y-4">
            <h2
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {POOL_LABELS[pool]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cats.map((cat, idx) => {
                const done = completedIds.has(cat.id);
                const typeStyle = TYPE_COLORS[cat.type];
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-102 text-left"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      border: `1px solid ${done ? "var(--success)" : "var(--card-border)"}`,
                    }}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {done ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : locked ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "var(--background-secondary)", color: "var(--text-tertiary)" }}
                        >
                          <span className="text-sm font-bold">{idx + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Name + type badge */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {cat.name}
                      </p>
                    </div>

                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: typeStyle.bg, color: typeStyle.color }}
                    >
                      {cat.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
