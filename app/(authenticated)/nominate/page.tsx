"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/app/context/UserContext";
import { Category, NominationStatus } from "@/types";
import DeadlineBanner from "@/app/components/nominations/DeadlineBanner";
import CategoryList from "@/app/components/nominations/CategoryList";
import CategoryNominationForm from "@/app/components/nominations/CategoryNominationForm";

const DEADLINE = (() => {
  const raw = process.env.NEXT_PUBLIC_NOMINATIONS_DEADLINE;
  if (!raw) return new Date("2099-01-01");
  const [day, month, year] = raw.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
})();

export default function NominatePage() {
  const { currentUserId } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const locked = new Date() > DEADLINE;

  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const [catRes, statusRes] = await Promise.all([
        fetch("/api/categories"),
        fetch(`/api/nominations/status?userId=${currentUserId}`),
      ]);
      if (!catRes.ok || !statusRes.ok) throw new Error("Failed to load data");
      const cats: Category[] = await catRes.json();
      const status: NominationStatus = await statusRes.json();
      setCategories(cats);
      setCompletedIds(new Set(status.completedCategoryIds ?? []));
    } catch {
      // silent fail — data will be empty
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  // Find next incomplete category after current
  const nextCategoryId = (() => {
    if (!selectedCategoryId) return null;
    const idx = categories.findIndex((c) => c.id === selectedCategoryId);
    for (let i = idx + 1; i < categories.length; i++) {
      if (!completedIds.has(categories[i].id)) return categories[i].id;
    }
    return null;
  })();

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

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        {!selectedCategory && (
          <header className="text-center space-y-3">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold"
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Nominations
            </h1>
            <p
              className="text-base sm:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Pick your top 5 for each category
            </p>
          </header>
        )}

        <DeadlineBanner />

        {/* Content */}
        <section
          className="rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300"
          style={{
            backgroundColor: "var(--card-bg)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--card-border)",
          }}
        >
          {selectedCategory ? (
            <CategoryNominationForm
              key={selectedCategory.id}
              category={selectedCategory}
              userId={currentUserId!}
              locked={locked}
              nextCategoryId={nextCategoryId}
              onBack={() => {
                setSelectedCategoryId(null);
                fetchData();
              }}
              onSaved={() => {
                setCompletedIds((prev) => new Set([...prev, selectedCategoryId!]));
              }}
              onNavigate={(id) => setSelectedCategoryId(id)}
            />
          ) : (
            <CategoryList
              categories={categories}
              completedIds={completedIds}
              locked={locked}
              onSelect={setSelectedCategoryId}
            />
          )}
        </section>
      </div>
    </main>
  );
}
