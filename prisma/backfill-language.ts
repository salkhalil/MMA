import "dotenv/config";
import { prisma } from "@/lib/prisma";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

async function backfill() {
  const movies = await prisma.movie.findMany({
    where: { originalLanguage: null },
    select: { id: true, tmdbId: true, title: true },
  });

  console.log(`Backfilling ${movies.length} movies...`);

  for (const movie of movies) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${TMDB_API_KEY}`,
      );
      if (!res.ok) {
        console.error(
          `Failed for ${movie.title} (${movie.tmdbId}): ${res.status}`,
        );
        continue;
      }
      const data = await res.json();
      await prisma.movie.update({
        where: { id: movie.id },
        data: { originalLanguage: data.original_language },
      });
      console.log(`${movie.title}: ${data.original_language}`);
    } catch (e) {
      console.error(`Error for ${movie.title}:`, e);
    }
  }

  console.log("Done.");
  await prisma.$disconnect();
}

backfill();
