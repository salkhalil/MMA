import { prisma } from "./prisma";
import { getMovieCredits } from "./tmdb";

const MAX_CAST = 10;

export async function ingestCreditsForMovie(
  movieId: number,
  tmdbId: number
): Promise<void> {
  const credits = await getMovieCredits(tmdbId);

  const topCast = credits.cast.slice(0, MAX_CAST);
  const directors = credits.crew.filter((c) => c.job === "Director");

  // Upsert actors
  for (const member of topCast) {
    const person = await prisma.person.upsert({
      where: { tmdbId: member.id },
      update: { name: member.name, photoPath: member.profile_path },
      create: {
        tmdbId: member.id,
        name: member.name,
        photoPath: member.profile_path,
      },
    });

    await prisma.movieCredit.upsert({
      where: {
        movieId_personId_role: {
          movieId,
          personId: person.id,
          role: "ACTOR",
        },
      },
      update: { character: member.character, order: member.order },
      create: {
        movieId,
        personId: person.id,
        role: "ACTOR",
        character: member.character,
        order: member.order,
      },
    });
  }

  // Upsert directors
  for (const member of directors) {
    const person = await prisma.person.upsert({
      where: { tmdbId: member.id },
      update: { name: member.name, photoPath: member.profile_path },
      create: {
        tmdbId: member.id,
        name: member.name,
        photoPath: member.profile_path,
      },
    });

    await prisma.movieCredit.upsert({
      where: {
        movieId_personId_role: {
          movieId,
          personId: person.id,
          role: "DIRECTOR",
        },
      },
      update: {},
      create: {
        movieId,
        personId: person.id,
        role: "DIRECTOR",
      },
    });
  }
}
