export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  role: Role;
  letterboxdUrl?: string;
  createdAt: string;
}

export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  overview: string | null;
  createdAt: string;
  movieViews: MovieView[];
  viewerCount?: number;
  isValid?: boolean;
  viewers?: User[];
}

export interface MovieView {
  id: number;
  movieId: number;
  userId: number;
  hasSeen: boolean;
  createdAt: string;
  user?: User;
}

export interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
}

export interface Person {
  id: number;
  tmdbId: number;
  name: string;
  photoPath: string | null;
}

export interface MovieCredit {
  id: number;
  personId: number;
  role: "ACTOR" | "DIRECTOR";
  character: string | null;
  order: number | null;
  person?: Person;
}

export interface Category {
  id: number;
  name: string;
  type: "FILM" | "ACTOR" | "DIRECTOR";
}

export interface MovieSuggestionData {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  overview: string;
  viewerIds: number[];
}
