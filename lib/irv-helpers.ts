import { Ballot } from "./irv";

interface NominationRow {
  userId: number;
  rank: number;
  movieId: number | null;
  movieCreditId: number | null;
  movie?: {
    id: number;
    title: string;
    posterPath: string | null;
  } | null;
  movieCredit?: {
    id: number;
    person: { id: number; name: string; photoPath: string | null };
    movie: { id: number; title: string; posterPath: string | null };
    character: string | null;
  } | null;
}

export interface NomineeInfo {
  id: string;
  label: string;
  posterPath: string | null;
  photoPath: string | null;
  movieTitle: string;
}

export function nominationsToBallots(
  nominations: NominationRow[],
  categoryType: string
): Ballot[] {
  const byUser = new Map<number, NominationRow[]>();
  for (const n of nominations) {
    const list = byUser.get(n.userId) ?? [];
    list.push(n);
    byUser.set(n.userId, list);
  }

  const ballots: Ballot[] = [];
  for (const [, noms] of byUser) {
    const sorted = noms.sort((a, b) => a.rank - b.rank);
    const ranks = sorted.map((n) => {
      if (categoryType === "FILM") return String(n.movieId);
      return String(n.movieCreditId);
    });
    ballots.push({ ranks });
  }
  return ballots;
}

export function buildNomineeMap(
  nominations: NominationRow[],
  categoryType: string
): Record<string, NomineeInfo> {
  const map: Record<string, NomineeInfo> = {};

  for (const n of nominations) {
    if (categoryType === "FILM" && n.movie) {
      const key = String(n.movieId);
      if (!map[key]) {
        map[key] = {
          id: key,
          label: n.movie.title,
          posterPath: n.movie.posterPath,
          photoPath: null,
          movieTitle: n.movie.title,
        };
      }
    } else if (n.movieCredit) {
      const key = String(n.movieCreditId);
      if (!map[key]) {
        map[key] = {
          id: key,
          label: n.movieCredit.person.name,
          posterPath: n.movieCredit.movie.posterPath,
          photoPath: n.movieCredit.person.photoPath,
          movieTitle: n.movieCredit.movie.title,
        };
      }
    }
  }
  return map;
}
