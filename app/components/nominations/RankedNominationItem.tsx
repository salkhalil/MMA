"use client";

import Image from "next/image";
import { RankedItem } from "@/types";

interface Props {
  item: RankedItem;
  categoryType: "FILM" | "ACTOR" | "DIRECTOR";
  isFirst: boolean;
  isLast: boolean;
  locked: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function RankedNominationItem({
  item,
  categoryType,
  isFirst,
  isLast,
  locked,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  const isFilm = categoryType === "FILM";
  const movie = isFilm ? item.movie : item.movieCredit?.movie;
  const posterPath = movie?.posterPath;
  const photoPath = !isFilm ? item.movieCredit?.person?.photoPath : null;

  const imgSrc = isFilm
    ? posterPath
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : null
    : photoPath
      ? `https://image.tmdb.org/t/p/w92${photoPath}`
      : posterPath
        ? `https://image.tmdb.org/t/p/w92${posterPath}`
        : null;

  const title = isFilm
    ? item.movie?.title ?? "Unknown"
    : item.movieCredit?.person?.name ?? "Unknown";

  const subtitle = isFilm
    ? item.movie?.year?.toString() ?? ""
    : categoryType === "ACTOR"
      ? `${item.movieCredit?.character ?? ""} — ${movie?.title ?? ""}`
      : movie?.title ?? "";

  return (
    <div
      draggable={!locked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        cursor: locked ? "default" : "grab",
      }}
    >
      {/* Rank badge */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: "var(--gradient-primary)" }}
      >
        {item.rank}
      </div>

      {/* Thumbnail */}
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={title}
          width={36}
          height={isFilm ? 54 : 36}
          className={`${isFilm ? "rounded-md" : "rounded-full"} object-cover flex-shrink-0`}
          style={isFilm ? { width: 36, height: 54 } : { width: 36, height: 36 }}
        />
      ) : (
        <div
          className={`flex-shrink-0 flex items-center justify-center text-xs font-bold ${
            isFilm ? "rounded-md" : "rounded-full"
          }`}
          style={{
            width: 36,
            height: isFilm ? 54 : 36,
            background: "var(--gradient-secondary)",
            color: "white",
          }}
        >
          {title.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="font-semibold text-sm truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            className="text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Controls */}
      {!locked && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--text-secondary)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--danger)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
