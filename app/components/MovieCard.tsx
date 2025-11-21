'use client';

import { TMDBMovie } from '@/types';
import Image from 'next/image';

interface MovieCardProps {
  movie: TMDBMovie;
  onClick: () => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.png';

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left w-full border border-gray-100"
    >
      <div className="relative aspect-[2/3] bg-gray-200">
        {movie.poster_path ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
          {movie.title}
        </h3>
        <p className="text-gray-600 text-sm mt-1">{year}</p>
        {movie.vote_average > 0 && (
          <div className="flex items-center mt-2">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  );
}

