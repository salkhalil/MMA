"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import MovieSearch from "@/app/components/MovieSearch";
import AddMovieModal from "@/app/components/AddMovieModal";
import { TMDBMovie, Movie, MovieSuggestionData } from "@/types";

export default function AddPage() {
  const { currentUserId, users } = useUser();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
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
    }
  };

  const handleMovieSelect = (movie: TMDBMovie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleAddMovie = async (movieData: MovieSuggestionData) => {
    try {
      const response = await fetch("/api/movies/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieData),
      });

      if (response.ok) {
        await fetchMovies();
      } else {
        throw new Error("Failed to add movie");
      }
    } catch (error: unknown) {
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
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
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
            Add Movies
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Search TMDB or import from Letterboxd
          </p>
        </header>

        {/* Movie Search Section */}
        <div
          className="rounded-2xl shadow-lg p-6 sm:p-8"
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
            onToggleSeen={handleToggleSeen}
            currentUserId={currentUserId!}
          />
        </div>
      </div>

      {selectedMovie && users.length > 0 && currentUserId && (
        <AddMovieModal
          movie={selectedMovie}
          users={users}
          currentUserId={currentUserId}
          onClose={handleCloseModal}
          onSubmit={handleAddMovie}
        />
      )}
    </main>
  );
}

