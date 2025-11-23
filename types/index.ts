export interface User {
  id: number;
  name: string;
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

export interface MovieSuggestionData {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  overview: string;
  viewerIds: number[];
}
