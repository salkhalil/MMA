'use client';

import { useState, useEffect, useRef } from 'react';
import { TMDBMovie } from '@/types';
import MovieCard from './MovieCard';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/app/context/ToastContext';

interface MovieSearchProps {
  onMovieSelect: (movie: TMDBMovie) => void;
}

interface MovieSearchResponse {
  results: TMDBMovie[];
  error?: string;
}

export default function MovieSearch({ onMovieSelect }: MovieSearchProps) {
  const [query, setQuery] = useState('');
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
        const response = await fetch(`/api/movies/search?query=${encodeURIComponent(debouncedQuery)}`);
        const data = (await response.json()) as MovieSearchResponse;

        if (response.ok) {
          setResults(data.results || []);
        } else {
          console.error('Search error:', data.error);
        }
      } catch (error: unknown) {
        console.error('Error searching movies:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchMovies();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSelect = (movie: TMDBMovie) => {
    onMovieSelect(movie);
    showToast(`Added "${movie.title}" to suggestions`, 'success');
    handleClear();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 text-lg text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md focus:shadow-lg"
        />

        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          ) : query ? (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {!isSearching && hasSearched && results.length === 0 && (
        <div className="text-center py-12 animate-fade-in-up">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">We couldn't find any movies matching "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
    </div>
  );
}

