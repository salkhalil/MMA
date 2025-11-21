"use client";

import { Movie } from "@/types";
import Image from "next/image";
import { FilterOptions } from "./FilterPanel";

interface SuggestedMoviesListProps {
  movies: Movie[];
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
  filters?: FilterOptions;
}

export default function SuggestedMoviesList({
  movies,
  currentUserId,
  onAddViewer,
  onDelete,
  filters,
}: SuggestedMoviesListProps) {
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

  const validMovies = filteredMovies.filter((m) => m.isValid);
  const invalidMovies = filteredMovies.filter((m) => !m.isValid);

  const totalMovies = movies.length;
  const filteredCount = filteredMovies.length;

  return (
    <div>
      {/* Filter Results Summary */}
      {filters && filteredCount < totalMovies && (
        <div className="mb-4 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Showing <span className="font-bold">{filteredCount}</span> of{" "}
            <span className="font-bold">{totalMovies}</span> movies
          </p>
        </div>
      )}

      {validMovies.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-green-700">
            ✓ Valid Movies for Awards ({validMovies.length})
          </h3>
          <div className="grid gap-4">
            {validMovies.map((movie) => (
              <MovieListItem
                key={movie.id}
                movie={movie}
                currentUserId={currentUserId}
                onAddViewer={onAddViewer}
                onDelete={onDelete}
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
          <div className="grid gap-4">
            {invalidMovies.map((movie) => (
              <MovieListItem
                key={movie.id}
                movie={movie}
                currentUserId={currentUserId}
                onAddViewer={onAddViewer}
                onDelete={onDelete}
              />
            ))}
          </div>
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
}

function MovieListItem({
  movie,
  currentUserId,
  onAddViewer,
  onDelete,
}: MovieListItemProps) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
    : null;

  const currentUserHasSeen = movie.viewers?.some((v) => v.id === currentUserId);

  const handleAddSelf = async () => {
    try {
      await onAddViewer(movie.tmdbId, currentUserId);
    } catch (error: unknown) {
      console.error("Error adding viewer:", error);
      alert("Failed to add viewer");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this movie?")) {
      try {
        await onDelete(movie.tmdbId);
      } catch (error: unknown) {
        console.error("Error deleting movie:", error);
        alert("Failed to delete movie");
      }
    }
  };

  return (
    <div
      className={`group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 border border-gray-100 dark:border-slate-700 ${
        movie.isValid
          ? "border-l-4 border-l-green-500 dark:border-l-green-500"
          : "border-l-4 border-l-orange-500 dark:border-l-orange-500"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-5">
        {posterUrl && (
          <div className="relative w-full sm:w-24 h-36 sm:h-36 shrink-0 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="font-bold text-xl text-gray-900 dark:text-white leading-tight mb-1">
                {movie.title}
              </h4>
              {movie.year && (
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
                  {movie.year}
                </p>
              )}
            </div>
            {movie.isValid && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                Eligible
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
              {movie.viewerCount} viewer{movie.viewerCount !== 1 ? "s" : ""}:
            </span>
            {movie.viewers?.map((viewer) => (
              <span
                key={viewer.id}
                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-md border border-blue-100 dark:border-blue-800/30"
              >
                {viewer.name}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-4 flex items-center gap-3">
            {!currentUserHasSeen && (
              <button
                onClick={handleAddSelf}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                + I&apos;ve seen this too
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 active:scale-95 ml-auto sm:ml-0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
