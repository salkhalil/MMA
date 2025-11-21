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
      className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-slate-700 overflow-hidden">
        {movie.poster_path ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
            <span className="text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg leading-tight text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{year}</p>
          {movie.vote_average > 0 && (
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md">
              <span className="text-yellow-500 text-xs mr-1">★</span>
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

