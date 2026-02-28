"use client";

import { useState } from "react";
import { TMDBMovie, User, MovieSuggestionData } from "@/types";
import Image from "next/image";

interface AddMovieModalProps {
  movie: TMDBMovie;
  users: User[];
  currentUserId: number;
  onClose: () => void;
  onSubmit: (movieData: MovieSuggestionData) => Promise<void>;
}

export default function AddMovieModal({
  movie,
  users,
  currentUserId,
  onClose,
  onSubmit,
}: AddMovieModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([
    currentUserId,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUserIds.length === 0) {
      alert("Please select at least one viewer");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        tmdbId: movie.id,
        title: movie.title,
        year,
        posterPath: movie.poster_path,
        overview: movie.overview,
        originalLanguage: movie.original_language,
        viewerIds: selectedUserIds,
      });
      onClose();
    } catch (error: unknown) {
      console.error("Error adding movie:", error);
      alert("Failed to add movie");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto z-[9999]">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className="rounded-2xl max-w-2xl w-full my-8 shadow-2xl relative z-10 transform transition-all border"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Add Movie
            </h2>
            <button
              onClick={onClose}
              className="text-3xl leading-none transition-colors p-2 rounded-full"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
            {posterUrl && (
              <div className="relative w-full sm:w-40 h-60 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3
                className="text-xl sm:text-2xl font-bold mb-2 leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {movie.title}
              </h3>
              {year && (
                <p
                  className="mb-4 font-medium text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Year: {year}
                </p>
              )}
              <p
                className="text-base leading-relaxed line-clamp-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {movie.overview}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h4
                className="font-bold mb-4 text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                Who watched this movie?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedUserIds.includes(user.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 shadow-sm"
                        : "border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                    />
                    <span
                      className={`font-medium text-base ${
                        selectedUserIds.includes(user.id)
                          ? "text-blue-900 dark:text-blue-100"
                          : "text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      {user.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 dark:text-slate-300 font-medium border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedUserIds.length === 0}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
              >
                {isSubmitting ? "Adding..." : "Add Movie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
