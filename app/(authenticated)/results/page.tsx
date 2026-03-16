"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";
import { Category, MoviePool } from "@/types";
import { IRVResult } from "@/lib/irv";
import { NomineeInfo } from "@/lib/irv-helpers";
import WinnerCard from "@/app/components/results/WinnerCard";
import CategoryResults from "@/app/components/results/CategoryResults";

interface CategoryResult {
  category: Category;
  result: IRVResult;
  nominees: Record<string, NomineeInfo>;
}

const POOL_LABELS: Record<MoviePool, string> = {
  NEW_RELEASE: "New Releases",
  CLASSIC: "Classics",
  ALL: "Wildcard",
};

export default function ResultsPage() {
  const { currentUserId } = useUser();
  const [results, setResults] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResult | null>(null);

  const fetchResults = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/results");
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to load results");
        return;
      }
      setResults(await res.json());
    } catch {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center py-16">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-4"
            style={{ borderColor: "var(--primary)" }}
          />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center py-16">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      </main>
    );
  }

  if (selectedCategory) {
    return (
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: "var(--text-primary)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Results
          </button>
          <CategoryResults
            category={selectedCategory.category}
            result={selectedCategory.result}
            nominees={selectedCategory.nominees}
          />
        </div>
      </main>
    );
  }

  // Group by pool
  const grouped = results.reduce<Record<MoviePool, CategoryResult[]>>(
    (acc, cr) => {
      acc[cr.category.pool] = acc[cr.category.pool] || [];
      acc[cr.category.pool].push(cr);
      return acc;
    },
    {} as Record<MoviePool, CategoryResult[]>
  );

  const pools: MoviePool[] = ["NEW_RELEASE", "CLASSIC", "ALL"];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-3">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold"
            style={{
              background: "var(--gradient-warm)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Results
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            The people have spoken
          </p>
          <Link
            href="/results/showcase"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all hover:scale-105 shadow-lg"
            style={{
              background: "var(--gradient-warm)",
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Showcase
          </Link>
        </header>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cats.map((cr) => (
                  <WinnerCard
                    key={cr.category.id}
                    category={cr.category}
                    result={cr.result}
                    nominees={cr.nominees}
                    onClick={() => setSelectedCategory(cr)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
