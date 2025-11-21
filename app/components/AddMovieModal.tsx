'use client';

import { useState } from 'react';
import { TMDBMovie, User, MovieSuggestionData } from '@/types';
import Image from 'next/image';

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
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([currentUserId]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedUserIds.length === 0) {
      alert('Please select at least one viewer');
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
        viewerIds: selectedUserIds,
      });
      onClose();
    } catch (error) {
      console.error('Error adding movie:', error);
      alert('Failed to add movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999 }}>
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Movie</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
            {posterUrl && (
              <div className="relative w-full sm:w-40 h-60 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">{movie.title}</h3>
              {year && <p className="text-gray-600 mb-3 font-medium">Year: {year}</p>}
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">{movie.overview}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-lg text-gray-900">Who watched this movie?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedUserIds.includes(user.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="mr-3"
                    />
                    <span className="font-medium text-gray-900 text-base">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedUserIds.length === 0}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isSubmitting ? 'Adding...' : 'Add Movie'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

