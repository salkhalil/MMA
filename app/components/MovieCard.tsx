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
      className="group rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left w-full border overflow-hidden flex flex-col h-full"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="relative aspect-[2/3] overflow-hidden" style={{ backgroundColor: "var(--background-secondary)" }}>
        {movie.poster_path ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-tertiary)" }}>
            <span className="text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg leading-tight mb-1 transition-colors line-clamp-2" style={{ color: "var(--text-primary)" }}>
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{year}</p>
          {movie.vote_average > 0 && (
            <div className="flex items-center px-2 py-1 rounded-md" style={{ backgroundColor: "var(--warning-light)" }}>
              <span className="text-xs mr-1" style={{ color: "var(--warning)" }}>★</span>
              <span className="text-xs font-bold" style={{ color: "var(--warning)" }}>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

