"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import MovieSearch from "@/app/components/MovieSearch";
import FilterPanel, { FilterOptions } from "@/app/components/FilterPanel";
import SuggestedMoviesList from "@/app/components/SuggestedMoviesList";
import StatsDashboard from "@/app/components/StatsDashboard";
import { Movie, TMDBMovie } from "@/types";

export default function GalleryPage() {
  const { currentUserId, users } = useUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const handleMovieSelect = async (movie: TMDBMovie) => {
    try {
      const response = await fetch("/api/movies/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          year: movie.release_date
            ? parseInt(movie.release_date.split("-")[0])
            : null,
          posterPath: movie.poster_path,
          overview: movie.overview,
          viewerIds: [currentUserId],
        }),
      });

      if (response.ok) {
        await fetchMovies();
      } else {
        throw new Error("Failed to add movie");
      }
    } catch (error: unknown) {
      console.error("Error adding movie:", error);
      throw error;
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

  const currentUser = users.find((u) => u.id === currentUserId);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
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
            Movie Gallery
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Here&apos;s what we&apos;ve watched so far, try to watch all you
            haven&apos;t seen!
          </p>
        </header>

        {/* Stats Dashboard */}
        {!isLoading && movies.length > 0 && (
          <section className="animate-fade-in-up">
            <StatsDashboard
              movies={movies}
              filters={filters}
              currentUserId={currentUserId!}
            />
          </section>
        )}

        {/* Filter Section */}
        <section>
          <FilterPanel
            users={users}
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </section>

        {/* Search Section */}
        <section
          className="rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: "var(--card-bg)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--card-border)",
          }}
        >
          <MovieSearch
            onMovieSelect={handleMovieSelect}
            existingMovies={movies}
            enableScrolling={true}
            onToggleSeen={handleToggleSeen}
            currentUserId={currentUserId!}
            currentUserLetterboxdUrl={currentUser?.letterboxdUrl}
            hideImport={true}
          />
        </section>

        {/* Movies List Section */}
        <section
          className="rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300"
          style={{
            backgroundColor: "var(--card-bg)",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              All Movies ({movies.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div
                className="inline-block animate-spin rounded-full h-12 w-12 border-b-4"
                style={{ borderColor: "var(--primary)" }}
              ></div>
              <p
                className="mt-4 text-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                Loading your collection...
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
        </section>
      </div>
    </main>
  );
}
