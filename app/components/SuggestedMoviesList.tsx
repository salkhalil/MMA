"use client";

import { Movie } from "@/types";
import Image from "next/image";
import { FilterOptions } from "./FilterPanel";
import { useState, useEffect } from "react";

interface SuggestedMoviesListProps {
  movies: Movie[];
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
  filters?: FilterOptions;
}

const ITEMS_PER_PAGE = 12;

export default function SuggestedMoviesList({
  movies,
  currentUserId,
  onAddViewer,
  onDelete,
  filters,
}: SuggestedMoviesListProps) {
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleExpanded = (movieId: number) => {
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId);
  };

  // Reset pagination when filters change or movies list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, movies.length]);

  // Ensure movies is an array
  if (!Array.isArray(movies)) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No movies yet!
        </h3>
        <p className="text-gray-600">
          Search and add movies above to get started.
        </p>
      </div>
    );
  }

  // Apply filters
  let filteredMovies = [...movies];

  if (filters) {
    // Filter by search text
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filteredMovies = filteredMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected viewers
    if (filters.selectedViewerIds.length > 0) {
      filteredMovies = filteredMovies.filter((movie) =>
        movie.viewers?.some((viewer) =>
          filters.selectedViewerIds.includes(viewer.id)
        )
      );
    }

    // Filter by year range
    if (filters.minYear !== null) {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.year !== null && movie.year >= filters.minYear!
      );
    }
    if (filters.maxYear !== null) {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.year !== null && movie.year <= filters.maxYear!
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "year-newest":
        filteredMovies.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      case "year-oldest":
        filteredMovies.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case "most-watched":
        filteredMovies.sort(
          (a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0)
        );
        break;
      case "least-watched":
        filteredMovies.sort(
          (a, b) => (a.viewerCount ?? 0) - (b.viewerCount ?? 0)
        );
        break;
    }
  }

  // Show empty state if no movies after filtering
  if (filteredMovies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {movies.length === 0
            ? "No movies yet!"
            : "No movies match your filters"}
        </h3>
        <p className="text-gray-600">
          {movies.length === 0
            ? "Search and add movies above to get started."
            : "Try adjusting your filters to see more results."}
        </p>
      </div>
    );
  }

  // Calculate pagination
  const totalMovies = movies.length;
  const filteredCount = filteredMovies.length;
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMovies = filteredMovies.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const validMovies = paginatedMovies.filter((m) => m.isValid);
  const invalidMovies = paginatedMovies.filter((m) => !m.isValid);

  return (
    <div>
      {/* Filter Results Summary */}
      {filters && filteredCount < totalMovies && (
        <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Showing <span className="font-bold">{paginatedMovies.length}</span>{" "}
            of <span className="font-bold">{filteredCount}</span> filtered
            movies (Total: {totalMovies})
          </p>
        </div>
      )}

      {/* Scrollable Movie List Container */}
      <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {validMovies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-green-700">
              ✓ Valid Movies for Awards ({validMovies.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {validMovies.map((movie) => (
                <MovieListItem
                  key={movie.id}
                  movie={movie}
                  currentUserId={currentUserId}
                  onAddViewer={onAddViewer}
                  onDelete={onDelete}
                  isExpanded={expandedMovieId === movie.id}
                  onToggleExpanded={() => toggleExpanded(movie.id)}
                />
              ))}
            </div>
          </div>
        )}

        {invalidMovies.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4 text-orange-700">
              ⚠ Needs More Viewers ({invalidMovies.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {invalidMovies.map((movie) => (
                <MovieListItem
                  key={movie.id}
                  movie={movie}
                  currentUserId={currentUserId}
                  onAddViewer={onAddViewer}
                  onDelete={onDelete}
                  isExpanded={expandedMovieId === movie.id}
                  onToggleExpanded={() => toggleExpanded(movie.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8 pb-4">
          <button
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              // Scroll to top of container not window if we wanted, but window is fine for now
              // Or we could add a ref to the scroll container.
              // For now, let's keep window scroll top as it's safe.
              // Actually, if it's a scrollable container, we might want to scroll IT to top.
              // But simplicity first.
            }}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          >
            Previous
          </button>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
            }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

interface MovieListItemProps {
  movie: Movie;
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

function MovieListItem({
  movie,
  currentUserId,
  onAddViewer,
  onDelete,
  isExpanded,
  onToggleExpanded,
}: MovieListItemProps) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const currentUserHasSeen = movie.viewers?.some((v) => v.id === currentUserId);

  const handleAddSelf = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onAddViewer(movie.tmdbId, currentUserId);
    } catch (error: unknown) {
      console.error("Error adding viewer:", error);
      alert("Failed to add viewer");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this movie?")) {
      try {
        await onDelete(movie.tmdbId);
      } catch (error: unknown) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie");
      }
    }
  };

  // Collapsed card view (grid item)
  if (!isExpanded) {
    return (
      <button
        onClick={onToggleExpanded}
        className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full cursor-pointer"
      >
        <div className="relative aspect-2/3 bg-gray-100 dark:bg-slate-700 overflow-hidden">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
              <span className="text-sm">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-base leading-tight text-white mb-1 line-clamp-2">
              {movie.title}
            </h3>
            {movie.year && (
              <p className="text-gray-200 text-sm font-medium">{movie.year}</p>
            )}
          </div>
          {movie.isValid && (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ✓
            </span>
          )}
        </div>
      </button>
    );
  }

  // Expanded view (full width)
  return (
    <div
      className={`col-span-full group bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${
        movie.isValid
          ? "border-green-500 dark:border-green-500"
          : "border-orange-500 dark:border-orange-500"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {posterUrl && (
          <div className="relative w-full sm:w-48 h-72 shrink-0 rounded-lg overflow-hidden shadow-md">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div>
              <h4 className="font-bold text-2xl text-gray-900 dark:text-white leading-tight mb-2">
                {movie.title}
              </h4>
              {movie.year && (
                <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">
                  {movie.year}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {movie.isValid && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                  Eligible
                </span>
              )}
              <button
                onClick={onToggleExpanded}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2"
                aria-label="Collapse"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-base font-medium text-gray-500 dark:text-slate-400">
              {movie.viewerCount} viewer{movie.viewerCount !== 1 ? "s" : ""}:
            </span>
            {movie.viewers?.map((viewer) => (
              <span
                key={viewer.id}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg border border-blue-100 dark:border-blue-800/30"
              >
                {viewer.name}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-3 flex-wrap">
            {!currentUserHasSeen && (
              <button
                onClick={handleAddSelf}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                + I&apos;ve seen this too
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
