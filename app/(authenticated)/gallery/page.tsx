"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import Sidebar from "@/app/components/Sidebar";
import SuggestedMoviesList from "@/app/components/SuggestedMoviesList";
import StatsDashboard from "@/app/components/StatsDashboard";
import { FilterOptions } from "@/app/components/FilterPanel";
import { Movie } from "@/types";

export default function GalleryPage() {
  const { currentUserId, users } = useUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: "",
    selectedViewerIds: [],
    minYear: null,
    maxYear: null,
    sortBy: "year-newest",
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/movies/list");
      const data = await response.json();
      if (Array.isArray(data)) {
        setMovies(data);
      } else {
        console.error("Invalid response format:", data);
        setMovies([]);
      }
    } catch (error: unknown) {
      console.error("Error fetching movies:", error);
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddViewer = async (tmdbId: number, userId: number) => {
    try {
      const movie = movies.find((m) => m.tmdbId === tmdbId);
      if (!movie) return;

      const response = await fetch("/api/movies/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.tmdbId,
          title: movie.title,
          year: movie.year,
          posterPath: movie.posterPath,
          overview: movie.overview,
          viewerIds: [userId],
        }),
      });

      if (response.ok) {
        await fetchMovies();
      } else {
        throw new Error("Failed to add viewer");
      }
    } catch (error: unknown) {
      throw error;
    }
  };

  const handleDeleteMovie = async (tmdbId: number) => {
    try {
      const response = await fetch(`/api/movies/${tmdbId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMovies();
      } else {
        throw new Error("Failed to delete movie");
      }
    } catch (error: unknown) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  };

  const handleToggleSeen = async (
    tmdbId: number,
    userId: number,
    hasSeen: boolean
  ) => {
    try {
      const response = await fetch("/api/movies/toggle-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tmdbId, userId, hasSeen }),
      });

      if (response.ok) {
        await fetchMovies();
      } else {
        throw new Error("Failed to toggle seen status");
      }
    } catch (error: unknown) {
      console.error("Error toggling seen status:", error);
      throw error;
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        users={users}
        currentUserId={currentUserId}
        onUserChange={() => {}} // Not used anymore, handled by Navigation
        filters={filters}
        onFiltersChange={setFilters}
        className="shrink-0"
      />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="text-center mb-8">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Movie Gallery
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              All films we&apos;ve added
            </p>
          </header>

          {/* Stats Dashboard */}
          {!isLoading && <StatsDashboard movies={movies} filters={filters} />}

          {/* Movies List Section */}
          <div
            className="rounded-2xl shadow-lg p-6 sm:p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--card-border)",
            }}
          >
            {isLoading ? (
              <div className="text-center py-8">
                <div
                  className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: "var(--primary)" }}
                ></div>
                <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
                  Loading...
                </p>
              </div>
            ) : (
              <SuggestedMoviesList
                movies={movies}
                currentUserId={currentUserId!}
                onAddViewer={handleAddViewer}
                onDelete={handleDeleteMovie}
                onToggleSeen={handleToggleSeen}
                filters={filters}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

