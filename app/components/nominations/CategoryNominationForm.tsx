"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
      fetch(`/api/nominations/eligible?categoryId=${category.id}`).then((r) => r.json()),
      fetch(`/api/nominations?userId=${userId}&categoryId=${category.id}`).then((r) => r.json()),
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

  // Filtered eligible items
  const filtered = useMemo(() => {
    if (!search.trim()) return eligibleItems;
    const q = search.toLowerCase();
    return eligibleItems.filter((item) => {
      if (isFilm) {
        return (item as EligibleFilm).title.toLowerCase().includes(q);
      }
      const credit = item as EligibleCredit;
      return (
        credit.person?.name.toLowerCase().includes(q) ||
        credit.movie.title.toLowerCase().includes(q)
      );
    });
  }, [eligibleItems, search, isFilm]);

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
        {/* Left: eligible items */}
        <div className="space-y-3">
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
            ) : (
              filtered.map((item) => {
                const id = isFilm
                  ? (item as EligibleFilm).id
                  : (item as EligibleCredit).id;
                const isSelected = selectedIds.has(id);
                return (
                  <EligibleItemCard
                    key={id}
                    item={
                      isFilm
                        ? { type: "FILM" as const, movie: item as EligibleFilm }
                        : {
                            type: category.type as "ACTOR" | "DIRECTOR",
                            credit: item as EligibleCredit,
                          }
                    }
                    selected={isSelected}
                    disabled={
                      locked ||
                      (!isSelected && rankedItems.length >= MAX_NOMINATIONS_PER_CATEGORY)
                    }
                    onSelect={() => addItem(item)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Right: ranked list */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
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
