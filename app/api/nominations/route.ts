import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";
import { isNominationsLocked } from "@/lib/config";

const NOMINATION_INCLUDE = {
  movie: true,
  movieCredit: {
    include: {
      person: true,
      movie: true,
    },
  },
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") ?? "", 10);
    const categoryId = parseInt(searchParams.get("categoryId") ?? "", 10);

    if (isNaN(userId) || isNaN(categoryId)) {
      return NextResponse.json(
        { error: "userId and categoryId required" },
        { status: 400 }
      );
    }

    const verifiedUserId = await getVerifiedUserId();
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (verifiedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nominations = await prisma.nomination.findMany({
      where: { userId, categoryId },
      orderBy: { rank: "asc" },
      include: NOMINATION_INCLUDE,
    });

    return NextResponse.json(nominations);
  } catch (error: unknown) {
    console.error("Error fetching nominations:", error);
    return NextResponse.json(
      { error: "Failed to fetch nominations" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (isNominationsLocked()) {
      return NextResponse.json(
        { error: "Nominations period has closed" },
        { status: 403 }
      );
    }

    const verifiedUserId = await getVerifiedUserId();
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, categoryId, nominations } = body as {
      userId: number;
      categoryId: number;
      nominations: { rank: number; movieId?: number; movieCreditId?: number }[];
    };

    if (!userId || !categoryId || !Array.isArray(nominations)) {
      return NextResponse.json(
        { error: "userId, categoryId, and nominations array required" },
        { status: 400 }
      );
    }

    if (verifiedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch category
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate count and ranks
    if (nominations.length > 5) {
      return NextResponse.json(
        { error: "Max 5 nominations per category" },
        { status: 400 }
      );
    }

    const ranks = nominations.map((n) => n.rank);
    if (ranks.some((r) => r < 1 || r > 5)) {
      return NextResponse.json(
        { error: "Ranks must be 1-5" },
        { status: 400 }
      );
    }
    if (new Set(ranks).size !== ranks.length) {
      return NextResponse.json(
        { error: "Duplicate ranks" },
        { status: 400 }
      );
    }

    // Validate correct field per category type + no duplicate items
    const isFilm = category.type === "FILM";
    for (const nom of nominations) {
      if (isFilm) {
        if (!nom.movieId || nom.movieCreditId) {
          return NextResponse.json(
            { error: "FILM categories require movieId only" },
            { status: 400 }
          );
        }
      } else {
        if (!nom.movieCreditId || nom.movieId) {
          return NextResponse.json(
            { error: `${category.type} categories require movieCreditId only` },
            { status: 400 }
          );
        }
      }
    }

    // Check duplicate items
    const itemIds = nominations.map((n) =>
      isFilm ? n.movieId! : n.movieCreditId!
    );
    if (new Set(itemIds).size !== itemIds.length) {
      return NextResponse.json(
        { error: "Duplicate items" },
        { status: 400 }
      );
    }

    // Validate each item exists, pool matches, movie valid (2+ viewers)
    if (isFilm) {
      const movies = await prisma.movie.findMany({
        where: { id: { in: itemIds } },
        include: { movieViews: true },
      });
      const movieMap = new Map(movies.map((m) => [m.id, m]));
      for (const id of itemIds) {
        const movie = movieMap.get(id);
        if (!movie) {
          return NextResponse.json(
            { error: `Movie ${id} not found` },
            { status: 400 }
          );
        }
        if (category.pool !== "ALL" && movie.pool !== "ALL" && movie.pool !== category.pool) {
          return NextResponse.json(
            { error: `Movie "${movie.title}" pool mismatch` },
            { status: 400 }
          );
        }
        if (movie.movieViews.length < 2) {
          return NextResponse.json(
            { error: `Movie "${movie.title}" needs 2+ viewers` },
            { status: 400 }
          );
        }
      }
    } else {
      const credits = await prisma.movieCredit.findMany({
        where: { id: { in: itemIds } },
        include: { movie: { include: { movieViews: true } }, person: true },
      });
      const creditMap = new Map(credits.map((c) => [c.id, c]));
      const expectedRole = category.type === "ACTOR" ? "ACTOR" : "DIRECTOR";
      for (const id of itemIds) {
        const credit = creditMap.get(id);
        if (!credit) {
          return NextResponse.json(
            { error: `MovieCredit ${id} not found` },
            { status: 400 }
          );
        }
        if (credit.role !== expectedRole) {
          return NextResponse.json(
            { error: `Credit ${id} role mismatch` },
            { status: 400 }
          );
        }
        if (category.pool !== "ALL" && credit.movie.pool !== "ALL" && credit.movie.pool !== category.pool) {
          return NextResponse.json(
            { error: `Movie "${credit.movie.title}" pool mismatch` },
            { status: 400 }
          );
        }
        if (credit.movie.movieViews.length < 2) {
          return NextResponse.json(
            { error: `Movie "${credit.movie.title}" needs 2+ viewers` },
            { status: 400 }
          );
        }
      }
    }

    // Transaction: delete existing + create new
    const result = await prisma.$transaction(async (tx) => {
      await tx.nomination.deleteMany({
        where: { userId, categoryId },
      });

      return tx.nomination.createManyAndReturn({
        data: nominations.map((n) => ({
          userId,
          categoryId,
          rank: n.rank,
          movieId: n.movieId ?? null,
          movieCreditId: n.movieCreditId ?? null,
        })),
        include: NOMINATION_INCLUDE,
      });
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error saving nominations:", error);
    return NextResponse.json(
      { error: "Failed to save nominations" },
      { status: 500 }
    );
  }
}
