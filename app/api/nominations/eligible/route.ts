import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ActorFilter = { gender: number; orderFilter: { lte: number } | { gte: number } };

function getActorFilter(categoryName: string): ActorFilter | null {
  const map: Record<string, ActorFilter> = {
    "Best Actor": { gender: 2, orderFilter: { lte: 2 } },
    "Best Actress": { gender: 1, orderFilter: { lte: 2 } },
    "Best Supporting Actor": { gender: 2, orderFilter: { gte: 2 } },
    "Best Supporting Actress": { gender: 1, orderFilter: { gte: 2 } },
  };
  return map[categoryName] ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = parseInt(searchParams.get("categoryId") ?? "", 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "categoryId required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Valid movies: matching pool (or any pool if category is ALL) + movies with pool ALL always eligible
    const validMovieWhere = {
      ...(category.pool !== "ALL" && { pool: { in: [category.pool, "ALL" as const] } }),
      movieViews: { some: {} },
    };

    if (category.type === "FILM") {
      const movies = await prisma.movie.findMany({
        where: validMovieWhere,
        include: { movieViews: true },
        orderBy: { title: "asc" },
      });

      let eligible = movies.filter((m) => m.movieViews.length >= 2);

      // Foreign language filter: exclude English-language films
      if (category.name === "Best Foreign Language Film") {
        eligible = eligible.filter(
          (m) => m.originalLanguage && m.originalLanguage !== "en"
        );
      }

      return NextResponse.json(eligible);
    }

    // ACTOR or DIRECTOR
    const role = category.type === "ACTOR" ? "ACTOR" : "DIRECTOR";

    // Actor category filtering by gender + lead/supporting
    const actorFilter = getActorFilter(category.name);

    const credits = await prisma.movieCredit.findMany({
      where: {
        role,
        movie: validMovieWhere,
        ...(actorFilter?.gender != null && { person: { is: { gender: actorFilter.gender } } }),
        ...(actorFilter?.orderFilter != null && { order: actorFilter.orderFilter }),
      },
      include: {
        person: true,
        movie: { include: { movieViews: true } },
      },
      orderBy: [{ order: "asc" }, { person: { name: "asc" } }],
    });

    let eligible = credits.filter((c) => c.movie.movieViews.length >= 2);

    // Limit to 5 per movie for actor categories
    if (actorFilter) {
      const byMovie = new Map<number, typeof eligible>();
      for (const c of eligible) {
        const group = byMovie.get(c.movieId) ?? [];
        group.push(c);
        byMovie.set(c.movieId, group);
      }
      eligible = Array.from(byMovie.values()).flatMap((g) => g.slice(0, 5));
    }

    return NextResponse.json(eligible);
  } catch (error: unknown) {
    console.error("Error fetching eligible items:", error);
    return NextResponse.json(
      { error: "Failed to fetch eligible items" },
      { status: 500 }
    );
  }
}
