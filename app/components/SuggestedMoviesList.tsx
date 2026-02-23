"use client";

import { Movie } from "@/types";
import Image from "next/image";
import { FilterOptions } from "./FilterPanel";
import { useState } from "react";

interface SuggestedMoviesListProps {
  movies: Movie[];
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
  onToggleSeen: (
    movieId: number,
    userId: number,
    hasSeen: boolean
  ) => Promise<void>;
  filters?: FilterOptions;
}

export default function SuggestedMoviesList({
  movies,
  currentUserId,
  onAddViewer,
  onDelete,
  onToggleSeen,
  filters,
}: SuggestedMoviesListProps) {
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);

  const toggleExpanded = (movieId: number) => {
    setExpandedMovieId(expandedMovieId === movieId ? null : movieId);
  };

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

    // Filter by watchlist (movies current user hasn't seen)
    if (filters.showWatchlistOnly) {
      filteredMovies = filteredMovies.filter((movie) => {
        const currentUserView = movie.movieViews?.find(
          (mv) => mv.userId === currentUserId
        );
        // Show if user hasn't added themselves, or has marked as not seen
        return !currentUserView || currentUserView.hasSeen === false;
      });
    }

    // Filter by pool
    if (filters.poolFilter === "new_release") {
      filteredMovies = filteredMovies.filter((movie) => movie.pool === "NEW_RELEASE");
    } else if (filters.poolFilter === "classic") {
      filteredMovies = filteredMovies.filter((movie) => movie.pool === "CLASSIC");
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

  // Separate valid and invalid movies
  const totalMovies = movies.length;
  const filteredCount = filteredMovies.length;

  const validMovies = filteredMovies.filter((m) => m.isValid);
  const invalidMovies = filteredMovies.filter((m) => !m.isValid);

  return (
    <div>
      {/* Filter Results Summary */}
      {filters && filteredCount < totalMovies && (
        <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Showing <span className="font-bold">{filteredCount}</span> filtered
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
                  onToggleSeen={onToggleSeen}
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
                  onToggleSeen={onToggleSeen}
                  isExpanded={expandedMovieId === movie.id}
                  onToggleExpanded={() => toggleExpanded(movie.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MovieListItemProps {
  movie: Movie;
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
  onToggleSeen: (
    movieId: number,
    userId: number,
    hasSeen: boolean
  ) => Promise<void>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

function MovieListItem({
  movie,
  currentUserId,
  onAddViewer,
  onDelete,
  onToggleSeen,
  isExpanded,
  onToggleExpanded,
}: MovieListItemProps) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null;

  const currentUserView = movie.movieViews?.find(
    (mv) => mv.userId === currentUserId
  );
  const currentUserHasSeen = currentUserView?.hasSeen ?? false;
  const isCurrentUserInViewers = movie.viewers?.some(
    (v) => v.id === currentUserId
  );

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

  const handleToggleSeen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserView) return;

    try {
      await onToggleSeen(movie.tmdbId, currentUserId, !currentUserHasSeen);
    } catch (error: unknown) {
      console.error("Error toggling seen status:", error);
      alert("Failed to toggle seen status");
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
          {isCurrentUserInViewers && (
            <span
              className="absolute top-2 left-2 text-2xl"
              title={
                currentUserHasSeen
                  ? "You've seen this"
                  : "You haven't seen this"
              }
            >
              {currentUserHasSeen ? "👁️" : "👁️‍🗨️"}
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
            {movie.movieViews?.map((movieView) => {
              const viewer = movieView.user;
              if (!viewer) return null;
              const hasSeen = movieView.hasSeen;
              return (
                <span
                  key={viewer.id}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${
                    hasSeen
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30"
                      : "bg-gray-50 dark:bg-gray-800/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/30"
                  }`}
                >
                  {hasSeen ? "✓" : "✗"} {viewer.name}
                </span>
              );
            })}
          </div>

          <div className="mt-auto flex items-center gap-3 flex-wrap">
            {!isCurrentUserInViewers ? (
              <button
                onClick={handleAddSelf}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                + I&apos;ve seen this too
              </button>
            ) : (
              <button
                onClick={handleToggleSeen}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                  currentUserHasSeen
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {currentUserHasSeen ? "Mark as Not Seen" : "Mark as Seen"}
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
