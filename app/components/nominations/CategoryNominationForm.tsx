"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Category, Movie, MovieCredit, RankedItem, Nomination } from "@/types";
import { MAX_NOMINATIONS_PER_CATEGORY } from "@/lib/config";
import EligibleItemCard from "./EligibleItemCard";
import RankedNominationList from "./RankedNominationList";

interface Props {
  category: Category;
  userId: number;
  locked: boolean;
  nextCategoryId: number | null;
  onBack: () => void;
  onSaved: () => void;
  onNavigate: (categoryId: number) => void;
}

type EligibleFilm = Movie & { movieViews: { id: number }[] };
type EligibleCredit = MovieCredit & { movie: Movie & { movieViews: { id: number }[] } };

export default function CategoryNominationForm({
  category,
  userId,
  locked,
  nextCategoryId,
  onBack,
  onSaved,
  onNavigate,
}: Props) {
  const [eligibleItems, setEligibleItems] = useState<(EligibleFilm | EligibleCredit)[]>([]);
  const [rankedItems, setRankedItems] = useState<RankedItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFilm = category.type === "FILM";

  // Fetch eligible items + existing nominations on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/nominations/eligible?categoryId=${category.id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load eligible items");
        return r.json();
      }),
      fetch(`/api/nominations?userId=${userId}&categoryId=${category.id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load nominations");
        return r.json();
      }),
    ])
      .then(([eligible, existing]) => {
        if (cancelled) return;
        setEligibleItems(eligible);
        if (Array.isArray(existing) && existing.length > 0) {
          setRankedItems(
            existing
              .sort((a: Nomination, b: Nomination) => a.rank - b.rank)
              .map((n: Nomination) => ({
                rank: n.rank,
                movieId: n.movieId ?? undefined,
                movieCreditId: n.movieCreditId ?? undefined,
                movie: n.movie,
                movieCredit: n.movieCredit,
              }))
          );
        } else {
          setRankedItems([]);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category.id, userId]);

  // Selected IDs for filtering
  const selectedIds = useMemo(() => {
    return new Set(
      rankedItems.map((r) => (isFilm ? r.movieId! : r.movieCreditId!))
    );
  }, [rankedItems, isFilm]);

  // Filtered + sorted eligible items (most-watched first)
  const filtered = useMemo(() => {
    let items = eligibleItems;
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((item) => {
        if (isFilm) {
          return (item as EligibleFilm).title.toLowerCase().includes(q);
        }
        const credit = item as EligibleCredit;
        return (
          credit.person?.name.toLowerCase().includes(q) ||
          credit.movie.title.toLowerCase().includes(q)
        );
      });
    }
    return [...items].sort((a, b) => {
      const viewsA = isFilm
        ? (a as EligibleFilm).movieViews.length
        : (a as EligibleCredit).movie.movieViews.length;
      const viewsB = isFilm
        ? (b as EligibleFilm).movieViews.length
        : (b as EligibleCredit).movie.movieViews.length;
      if (viewsB !== viewsA) return viewsB - viewsA;
      const titleA = isFilm
        ? (a as EligibleFilm).title
        : (a as EligibleCredit).movie.title;
      const titleB = isFilm
        ? (b as EligibleFilm).title
        : (b as EligibleCredit).movie.title;
      return titleA.localeCompare(titleB);
    });
  }, [eligibleItems, search, isFilm]);

  // Group credits by movie for ACTOR/DIRECTOR categories
  const groupedByMovie = useMemo(() => {
    if (isFilm) return null;
    const groups = new Map<
      number,
      { movie: Movie & { movieViews: { id: number }[] }; credits: EligibleCredit[] }
    >();
    for (const item of filtered) {
      const credit = item as EligibleCredit;
      const movieId = credit.movie.id;
      if (!groups.has(movieId)) {
        groups.set(movieId, { movie: credit.movie, credits: [] });
      }
      groups.get(movieId)!.credits.push(credit);
    }
    return [...groups.values()].sort((a, b) => {
      const diff = b.movie.movieViews.length - a.movie.movieViews.length;
      if (diff !== 0) return diff;
      return a.movie.title.localeCompare(b.movie.title);
    });
  }, [filtered, isFilm]);

  const addItem = useCallback(
    (item: EligibleFilm | EligibleCredit) => {
      if (rankedItems.length >= MAX_NOMINATIONS_PER_CATEGORY) return;
      const rank = rankedItems.length + 1;

      if (isFilm) {
        const movie = item as EligibleFilm;
        setRankedItems((prev) => [
          ...prev,
          { rank, movieId: movie.id, movie },
        ]);
      } else {
        const credit = item as EligibleCredit;
        setRankedItems((prev) => [
          ...prev,
          {
            rank,
            movieCreditId: credit.id,
            movieCredit: { ...credit, movie: credit.movie },
          },
        ]);
      }
    },
    [rankedItems.length, isFilm]
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/nominations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          categoryId: category.id,
          nominations: rankedItems.map((r) => ({
            rank: r.rank,
            ...(isFilm ? { movieId: r.movieId } : { movieCreditId: r.movieCreditId }),
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      onSaved();
      if (nextCategoryId) {
        onNavigate(nextCategoryId);
      } else {
        onBack();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div
          className="inline-block animate-spin rounded-full h-10 w-10 border-b-4"
          style={{ borderColor: "var(--primary)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "var(--text-primary)" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {category.name}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Pick up to {MAX_NOMINATIONS_PER_CATEGORY} — drag to reorder
          </p>
        </div>
      </div>

      {error && (
        <div
          className="p-3 rounded-lg text-sm font-medium"
          style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: eligible items (below on mobile) */}
        <div className="space-y-3 order-2 lg:order-1">
          <input
            type="text"
            placeholder={
              isFilm
                ? "Search movies..."
                : "Search by name or movie..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--background-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--card-border)",
            }}
          />
          <div className="max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
            {filtered.length === 0 ? (
              <p
                className="text-center py-8 text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                No eligible items found
              </p>
            ) : isFilm ? (
              filtered.map((item) => {
                const movie = item as EligibleFilm;
                const isSelected = selectedIds.has(movie.id);
                return (
                  <EligibleItemCard
                    key={movie.id}
                    item={{ type: "FILM" as const, movie }}
                    selected={isSelected}
                    disabled={
                      locked ||
                      (!isSelected && rankedItems.length >= MAX_NOMINATIONS_PER_CATEGORY)
                    }
                    onSelect={() => addItem(item)}
                  />
                );
              })
            ) : (
              groupedByMovie!.map((group) => (
                <div key={group.movie.id} className="space-y-1">
                  {/* Movie group header */}
                  <div
                    className="flex items-center gap-2 px-2 pt-3 pb-1"
                  >
                    {group.movie.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${group.movie.posterPath}`}
                        alt={group.movie.title}
                        width={28}
                        height={42}
                        className="rounded flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="flex-shrink-0 rounded flex items-center justify-center text-[10px] font-bold"
                        style={{
                          width: 28,
                          height: 42,
                          background: "var(--gradient-primary)",
                          color: "white",
                        }}
                      >
                        {group.movie.title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="font-semibold text-xs truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {group.movie.title}
                        {group.movie.year && (
                          <span
                            className="font-normal ml-1"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            ({group.movie.year})
                          </span>
                        )}
                      </p>
                    </div>
                    {group.movie.movieViews.length > 0 && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: "var(--primary-light)",
                          color: "var(--primary)",
                        }}
                      >
                        {group.movie.movieViews.length} watched
                      </span>
                    )}
                  </div>
                  {/* Credits under this movie */}
                  {group.credits.map((credit) => {
                    const isSelected = selectedIds.has(credit.id);
                    return (
                      <EligibleItemCard
                        key={credit.id}
                        item={{
                          type: category.type as "ACTOR" | "DIRECTOR",
                          credit,
                        }}
                        selected={isSelected}
                        disabled={
                          locked ||
                          (!isSelected && rankedItems.length >= MAX_NOMINATIONS_PER_CATEGORY)
                        }
                        onSelect={() => addItem(credit)}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: ranked list (above on mobile) */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start space-y-4">
          <h3
            className="font-bold text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            Your Top {MAX_NOMINATIONS_PER_CATEGORY}{" "}
            <span
              className="text-sm font-normal"
              style={{ color: "var(--text-tertiary)" }}
            >
              ({rankedItems.length}/{MAX_NOMINATIONS_PER_CATEGORY})
            </span>
          </h3>

          <RankedNominationList
            items={rankedItems}
            categoryType={category.type}
            locked={locked}
            onChange={setRankedItems}
          />

          {!locked && rankedItems.length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              {saving
                ? "Saving..."
                : nextCategoryId
                  ? "Save & Next"
                  : "Save & Finish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
