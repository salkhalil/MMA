"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import MovieSearch from "./components/MovieSearch";
import AddMovieModal from "./components/AddMovieModal";
import SuggestedMoviesList from "./components/SuggestedMoviesList";
import { FilterOptions } from "./components/FilterPanel";
import StatsDashboard from "./components/StatsDashboard";
import Sidebar from "./components/Sidebar";
import { TMDBMovie, User, Movie, MovieSuggestionData } from "@/types";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: "",
    selectedViewerIds: [],
    minYear: null,
    maxYear: null,
    sortBy: "year-newest",
  });

  useEffect(() => {
    fetchUsers();
    fetchMovies();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
    }
  };

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

  const handleUserSelect = (userId: number) => {
    setCurrentUserId(userId);
  };

  if (!currentUserId) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: "var(--gradient-bg)",
        }}
      >
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Mandem Movie Awards"
            width={200}
            height={200}
            className="w-40 h-40 mx-auto drop-shadow-2xl mb-6"
            priority
          />
          <h1
            className="text-5xl sm:text-6xl font-bold mb-4"
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Mandem Awards
          </h1>
          <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
            Who are you?
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold shadow-inner">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {user.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row"
      style={{
        background: "var(--gradient-bg)",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        users={users}
        currentUserId={currentUserId}
        onUserChange={setCurrentUserId}
        filters={filters}
        onFiltersChange={setFilters}
        className="shrink-0"
      />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Mandem Movie Awards"
                width={120}
                height={120}
                className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl"
                priority
              />
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2"
              style={{
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mandem Movie Awards 2025
            </h1>
            <p
              className="text-sm sm:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Who the fook is Oscar?
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
            <h2
              className="text-2xl font-bold mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              Search & Add Movies
            </h2>
            <MovieSearch onMovieSelect={handleMovieSelect} existingMovies={movies} />
          </div>

          {/* Stats & Suggested Movies Section */}
          <div
            className="rounded-2xl shadow-lg p-6 sm:p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "var(--card-border)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              Suggested Movies
            </h2>

            {/* Stats Dashboard */}
            {!isLoading && <StatsDashboard movies={movies} filters={filters} />}

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
                currentUserId={currentUserId}
                onAddViewer={handleAddViewer}
                onDelete={handleDeleteMovie}
                filters={filters}
              />
            )}
          </div>
        </div>
      </main>

      {selectedMovie && users.length > 0 && (
        <AddMovieModal
          movie={selectedMovie}
          users={users}
          currentUserId={currentUserId}
          onClose={handleCloseModal}
          onSubmit={handleAddMovie}
        />
      )}
    </div>
  );
}
