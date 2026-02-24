"use client";

import Image from "next/image";
import { Movie, MovieCredit } from "@/types";

interface FilmItem {
  type: "FILM";
  movie: Movie;
}

interface CreditItem {
  type: "ACTOR" | "DIRECTOR";
  credit: MovieCredit & { movie: Movie };
}

type EligibleItemProps = {
  item: FilmItem | CreditItem;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

export default function EligibleItemCard({
  item,
  selected,
  disabled,
  onSelect,
}: EligibleItemProps) {
  const isFilm = item.type === "FILM";
  const posterPath = isFilm
    ? item.movie.posterPath
    : item.credit.movie.posterPath;
  const photoPath = !isFilm ? item.credit.person?.photoPath : null;

  const imgSrc = isFilm
    ? posterPath
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : null
    : photoPath
      ? `https://image.tmdb.org/t/p/w92${photoPath}`
      : posterPath
        ? `https://image.tmdb.org/t/p/w92${posterPath}`
        : null;

  const title = isFilm ? item.movie.title : item.credit.person?.name ?? "Unknown";
  const subtitle = isFilm
    ? item.movie.year?.toString() ?? ""
    : item.type === "ACTOR"
      ? `${item.credit.character ?? ""} — ${item.credit.movie.title}`
      : item.credit.movie.title;

  return (
    <button
      onClick={onSelect}
      disabled={selected || disabled}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
        selected
          ? "opacity-40 cursor-not-allowed"
          : disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-102 cursor-pointer"
      }`}
      style={{
        backgroundColor: selected ? "var(--background-secondary)" : "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={title}
          width={48}
          height={isFilm ? 72 : 48}
          className={`${isFilm ? "rounded-md" : "rounded-full"} object-cover flex-shrink-0`}
          style={isFilm ? { width: 48, height: 72 } : { width: 48, height: 48 }}
        />
      ) : (
        <div
          className={`flex-shrink-0 flex items-center justify-center text-lg font-bold ${
            isFilm ? "rounded-md" : "rounded-full"
          }`}
          style={{
            width: 48,
            height: isFilm ? 72 : 48,
            background: "var(--gradient-primary)",
            color: "white",
          }}
        >
          {title.charAt(0)}
        </div>
      )}
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
      {selected && (
        <span
          className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}
        >
          Selected
        </span>
      )}
    </button>
  );
}
