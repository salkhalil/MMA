"use client";

import { useState, useEffect } from "react";
import MovieSearch from "./components/MovieSearch";
import AddMovieModal from "./components/AddMovieModal";
import SuggestedMoviesList from "./components/SuggestedMoviesList";
import UserSelector from "./components/UserSelector";
import Footer from "./components/Footer";
import { TMDBMovie, User, Movie, MovieSuggestionData } from "@/types";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchMovies();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
      if (data.length > 0) {
        setCurrentUserId(data[0].id);
      }
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom right, #eff6ff, #ffffff, #faf5ff)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8 text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3"
            style={{
              background: "linear-gradient(to right, #2563eb, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            🎬 Mandem Movie Awards 2025
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Search and add movies you&apos;ve watched with friends. Movies need
            2+ viewers to be eligible for awards!
          </p>
        </header>

        {users.length > 0 && (
          <UserSelector
            users={users}
            currentUserId={currentUserId}
            onUserChange={setCurrentUserId}
          />
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">
            Search Movies
          </h2>
          <MovieSearch onMovieSelect={handleMovieSelect} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-5 text-gray-900">
            Suggested Movies
          </h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <SuggestedMoviesList
              movies={movies}
              currentUserId={currentUserId}
              onAddViewer={handleAddViewer}
              onDelete={handleDeleteMovie}
            />
          )}
        </div>

        <Footer />
      </div>

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
