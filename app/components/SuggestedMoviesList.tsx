'use client';

import { Movie, User } from '@/types';
import Image from 'next/image';

interface SuggestedMoviesListProps {
  movies: Movie[];
  currentUserId: number;
  onAddViewer: (movieId: number, userId: number) => Promise<void>;
  onDelete: (movieId: number) => Promise<void>;
}

export default function SuggestedMoviesList({
  movies,
  currentUserId,
  onAddViewer,
  onDelete,
}: SuggestedMoviesListProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies yet!</h3>
        <p className="text-gray-600">Search and add movies above to get started.</p>
      </div>
    );
  }

  const validMovies = movies.filter((m) => m.isValid);
  const invalidMovies = movies.filter((m) => !m.isValid);

  return (
    <div>
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

function MovieListItem({ movie, currentUserId, onAddViewer, onDelete }: MovieListItemProps) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w200${movie.posterPath}`
    : null;

  const currentUserHasSeen = movie.viewers?.some((v) => v.id === currentUserId);

  const handleAddSelf = async () => {
    try {
      await onAddViewer(movie.tmdbId, currentUserId);
    } catch (error) {
      console.error('Error adding viewer:', error);
      alert('Failed to add viewer');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this movie?')) {
      try {
        await onDelete(movie.tmdbId);
      } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Failed to delete movie');
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-5 border-l-4 ${
        movie.isValid ? 'border-green-500' : 'border-orange-500'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {posterUrl && (
          <div className="relative w-full sm:w-20 h-28 sm:h-28 flex-shrink-0 rounded overflow-hidden">
            <Image src={posterUrl} alt={movie.title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg line-clamp-1">{movie.title}</h4>
          {movie.year && <p className="text-gray-600 text-sm">{movie.year}</p>}
          
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              {movie.viewerCount} viewer{movie.viewerCount !== 1 ? 's' : ''}:
            </span>
            {movie.viewers?.map((viewer) => (
              <span
                key={viewer.id}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {viewer.name}
              </span>
            ))}
          </div>

          {!currentUserHasSeen && (
            <button
              onClick={handleAddSelf}
              className="mt-3 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              + I've seen this too
            </button>
          )}
          <button
            onClick={handleDelete}
            className="mt-3 ml-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

