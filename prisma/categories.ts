import { CategoryType, MoviePool } from "@prisma/client";

export const categories = [
  // Film categories (below-the-line)
  { name: "Best Picture", type: CategoryType.FILM, pool: MoviePool.NEW_RELEASE },
  { name: "Best Screenplay", type: CategoryType.FILM, pool: MoviePool.NEW_RELEASE },
  { name: "Best Cinematography", type: CategoryType.FILM, pool: MoviePool.NEW_RELEASE },
  { name: "Best Score", type: CategoryType.FILM, pool: MoviePool.NEW_RELEASE },
  { name: "Best Editing", type: CategoryType.FILM, pool: MoviePool.NEW_RELEASE },

  // Actor categories
  { name: "Best Actor", type: CategoryType.ACTOR, pool: MoviePool.NEW_RELEASE },
  { name: "Best Actress", type: CategoryType.ACTOR, pool: MoviePool.NEW_RELEASE },
  { name: "Best Supporting Actor", type: CategoryType.ACTOR, pool: MoviePool.NEW_RELEASE },
  { name: "Best Supporting Actress", type: CategoryType.ACTOR, pool: MoviePool.NEW_RELEASE },

  // Director categories
  { name: "Best Director", type: CategoryType.DIRECTOR, pool: MoviePool.NEW_RELEASE },

  // Classic categories
  { name: "Best Film Seen at Home", type: CategoryType.FILM, pool: MoviePool.CLASSIC },
] as const;
