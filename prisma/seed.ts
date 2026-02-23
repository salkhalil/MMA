import "dotenv/config";
import { prisma } from "../lib/prisma";
import { categories } from "./categories";
import { ingestCreditsForMovie } from "../lib/credits";

async function main() {
  const friends: { name: string; password: string; role?: "ADMIN" | "USER" }[] = [
    { name: "Sal", password: "bigboss", role: "ADMIN" },
    { name: "Jacob", password: "popcorn" },
    { name: "Tuush", password: "stardust" },
    { name: "Davi", password: "moonlight" },
    { name: "Ani", password: "redsox" },
    { name: "Jonny", password: "topdog" },
    { name: "Elliot", password: "maverick" },
    { name: "Henry", password: "goldfish" },
    { name: "Jake", password: "thunder" },
    { name: "Tom", password: "wildcard" },
    { name: "Khaled", password: "legend" },
  ];

  console.log("Seeding database with friends...");

  for (const { name, password, role } of friends) {
    await prisma.user.upsert({
      where: { name },
      update: { password, role: role ?? "USER" },
      create: { name, password, role: role ?? "USER" },
    });
    console.log(`✓ Added ${name}`);
  }

  // Seed categories
  console.log("\nSeeding categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { type: category.type, pool: category.pool },
      create: { name: category.name, type: category.type, pool: category.pool },
    });
    console.log(`✓ Category: ${category.name}`);
  }

  // Backfill credits for existing movies
  console.log("\nBackfilling credits for existing movies...");

  const movies = await prisma.movie.findMany({
    include: { credits: true },
  });

  for (const movie of movies) {
    if (movie.credits.length > 0) {
      console.log(`⏭ ${movie.title} — already has credits`);
      continue;
    }
    try {
      await ingestCreditsForMovie(movie.id, movie.tmdbId);
      console.log(`✓ Credits ingested for ${movie.title}`);
    } catch (e) {
      console.error(`✗ Failed to ingest credits for ${movie.title}:`, e);
    }
  }

  console.log("\nSeeding complete!");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
