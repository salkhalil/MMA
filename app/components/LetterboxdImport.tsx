"use client";

import { useState, useEffect } from "react";
import { TMDBMovie, Movie } from "@/types";
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";

interface LetterboxdMovie {
  title: string;
  year?: number;
  posterUrl?: string;
  letterboxdSlug: string;
  tmdbPosterPath?: string | null;
}

interface LetterboxdImportProps {
  onMovieSelect: (movie: TMDBMovie) => void;
  existingMovies?: Movie[];
}

export default function LetterboxdImport({ onMovieSelect, existingMovies = [] }: LetterboxdImportProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<LetterboxdMovie[]>([]);
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const [resolvingMovie, setResolvingMovie] = useState<string | null>(null);
  const [tmdbPosters, setTmdbPosters] = useState<Record<string, string | null>>({});

  // Queue to fetch TMDB posters for movies that don't have one
  useEffect(() => {
    const fetchPosters = async () => {
      // Find movies that need a poster (no Letterboxd poster, and haven't tried TMDB yet)
      const moviesToFetch = movies.filter(
        m => !m.posterUrl && tmdbPosters[m.letterboxdSlug] === undefined
      );

      if (moviesToFetch.length === 0) return;

      // Take top 3 to process
      const batch = moviesToFetch.slice(0, 3);

      const results = await Promise.all(
        batch.map(async (movie) => {
          try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(movie.title)}`);
            const data = await res.json();
            const match = data.results?.[0];
            return { 
              slug: movie.letterboxdSlug, 
              posterPath: match?.poster_path || null 
            };
          } catch (e) {
            return { slug: movie.letterboxdSlug, posterPath: null };
          }
        })
      );

      setTmdbPosters(prev => {
        const next = { ...prev };
        results.forEach(r => {
          next[r.slug] = r.posterPath;
        });
        return next;
      });
    };

    if (movies.length > 0) {
      // Small delay to allow UI to render first and avoid rapid firing
      const timer = setTimeout(fetchPosters, 100);
      return () => clearTimeout(timer);
    }
  }, [movies, tmdbPosters]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setError("");
    setMovies([]);
    setTmdbPosters({});

    try {
      const response = await fetch(`/api/letterboxd?username=${encodeURIComponent(username)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Letterboxd profile");
      }

      if (data.movies.length === 0) {
        setError("No films found for this user.");
      } else {
        setMovies(data.movies);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (movie: LetterboxdMovie) => {
    setResolvingMovie(movie.letterboxdSlug);
    try {
      // Search for the movie on TMDB to get full details
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(movie.title)}`);
      const data = await response.json();

      if (!response.ok) throw new Error("Failed to find movie on TMDB");

      const results = data.results as TMDBMovie[];
      
      // Simple matching strategy: first result that matches title (fuzzy)
      const match = results.find(r => 
        r.title.toLowerCase() === movie.title.toLowerCase()
      ) || results[0];

      if (match) {
        onMovieSelect(match);
        showToast(`Imported "${match.title}"`, "success");
      } else {
        showToast(`Could not find "${movie.title}" on TMDB`, "error");
      }
    } catch (err) {
      console.error("Error resolving movie:", err);
      showToast("Failed to import movie", "error");
    } finally {
      setResolvingMovie(null);
    }
  };

  const isAlreadyAdded = (title: string) => {
    return existingMovies.some(m => m.title.toLowerCase() === title.toLowerCase());
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleImport} className="mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-xl">🎬</span>
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Letterboxd username..."
          className="w-full pl-12 pr-32 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 text-lg shadow-sm hover:shadow-md focus:shadow-lg"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--primary)",
            color: "white",
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Import"
          )}
        </button>
      </form>

      {error && (
        <div className="text-center py-8 animate-fade-in-up">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {movies.length > 0 && (
        <div className="animate-fade-in-up">
          <h3 className="text-lg font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
            Found {movies.length} films from {username}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie) => {
              const alreadyAdded = isAlreadyAdded(movie.title);
              const tmdbPoster = tmdbPosters[movie.letterboxdSlug];
              const displayPoster = movie.posterUrl || (tmdbPoster ? `https://image.tmdb.org/t/p/w500${tmdbPoster}` : null);

              return (
                <button
                  key={movie.letterboxdSlug}
                  onClick={() => !alreadyAdded && handleSelect(movie)}
                  disabled={resolvingMovie === movie.letterboxdSlug || alreadyAdded}
                  className={`group relative aspect-[2/3] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full text-left ${
                    alreadyAdded ? 'opacity-60 cursor-default' : 'hover:-translate-y-1'
                  }`}
                  style={{ backgroundColor: "var(--card-bg)" }}
                >
                  {displayPoster ? (
                    <Image
                      src={displayPoster}
                      alt={movie.title}
                      fill
                      className={`object-cover transition-transform duration-500 ${!alreadyAdded && 'group-hover:scale-105'}`}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <span className="text-sm text-gray-400 p-2 text-center">{movie.title}</span>
                    </div>
                  )}
                  
                  {!alreadyAdded && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold px-4 py-2 rounded-lg bg-primary/80 backdrop-blur-sm">
                        Select
                      </span>
                    </div>
                  )}

                  {alreadyAdded && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold px-3 py-1 rounded-full bg-green-600/80 backdrop-blur-sm text-sm">
                        ✓ Added
                      </span>
                    </div>
                  )}

                  {resolvingMovie === movie.letterboxdSlug && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
