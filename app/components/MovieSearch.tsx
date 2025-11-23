"use client";

import { useState, useEffect, useRef } from "react";
import { TMDBMovie, Movie } from "@/types";
import MovieCard from "./MovieCard";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/app/context/ToastContext";
import LetterboxdImport from "./LetterboxdImport";

interface MovieSearchProps {
  onMovieSelect: (movie: TMDBMovie) => void;
  existingMovies?: Movie[];
  enableScrolling?: boolean;
  onToggleSeen?: (
    tmdbId: number,
    userId: number,
    hasSeen: boolean
  ) => Promise<void>;
  currentUserId?: number;
  currentUserLetterboxdUrl?: string;
}

interface MovieSearchResponse {
  results: TMDBMovie[];
  error?: string;
}

export default function MovieSearch({
  onMovieSelect,
  existingMovies = [],
  enableScrolling = false,
  onToggleSeen,
  currentUserId,
  currentUserLetterboxdUrl,
}: MovieSearchProps) {
  const [activeTab, setActiveTab] = useState<"search" | "import">("import");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const searchMovies = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const response = await fetch(
          "/api/movies/search?query=" + encodeURIComponent(debouncedQuery)
        );
        const data = (await response.json()) as MovieSearchResponse;

        if (response.ok) {
          setResults(data.results || []);
        } else {
          console.error("Search error:", data.error);
        }
      } catch (error: unknown) {
        console.error("Error searching movies:", error);
      } finally {
        setIsSearching(false);
      }
    };

    if (activeTab === "search") {
      searchMovies();
    }
  }, [debouncedQuery, activeTab]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSelect = (movie: TMDBMovie) => {
    onMovieSelect(movie);
    showToast(`Added "${movie.title}" to suggestions`, "success");
    handleClear();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <div
          className="relative inline-flex p-1.5 rounded-2xl shadow-inner"
          style={{
            backgroundColor: "var(--bg-primary)",
            border: "2px solid var(--card-border)",
          }}
        >
          {/* Sliding background indicator */}
          <div
            className="absolute top-1.5 bottom-1.5 rounded-xl transition-all duration-300 ease-out shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              left: activeTab === "import" ? "6px" : "50%",
              right: activeTab === "search" ? "6px" : "50%",
            }}
          />

          <button
            onClick={() => setActiveTab("import")}
            className={`relative z-10 px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap min-w-[160px] ${
              activeTab === "import"
                ? "text-white scale-105"
                : "text-[--text-secondary] hover:text-[--text-primary] hover:scale-102"
            }`}
          >
            <span className="text-xl">📚</span>
            <span>Letterboxd</span>
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className={`relative z-10 px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap min-w-[160px] ${
              activeTab === "search"
                ? "text-white scale-105"
                : "text-[--text-secondary] hover:text-[--text-primary] hover:scale-102"
            }`}
          >
            <span className="text-xl">🔍</span>
            <span>Search</span>
          </button>
        </div>
      </div>

      {activeTab === "search" ? (
        <>
          <div className="relative mb-8 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 transition-colors duration-200"
                style={{ color: "--text-tertiary" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a movie..."
              className="w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-200 text-lg shadow-sm hover:shadow-md focus:shadow-lg"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--text-primary)",
              }}
            />

            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {isSearching ? (
                <div
                  className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                  style={{ borderColor: "var(--primary)" }}
                ></div>
              ) : query ? (
                <button
                  onClick={handleClear}
                  className="p-1 rounded-full transition-colors duration-200"
                  style={{ color: "var(--text-tertiary)" }}
                  aria-label="Clear search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="text-6xl mb-4">🔍</div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                No results found
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                We couldn&apos;t find any movies matching &quot;{query}&quot;
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </h3>
              </div>
              <div
                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 ${
                  enableScrolling
                    ? "max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
                    : ""
                }`}
              >
                {results.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => handleSelect(movie)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <LetterboxdImport
          onMovieSelect={handleSelect}
          existingMovies={existingMovies}
          enableScrolling={enableScrolling}
          onToggleSeen={onToggleSeen}
          currentUserId={currentUserId}
          currentUserLetterboxdUrl={currentUserLetterboxdUrl}
        />
      )}
    </div>
  );
}
