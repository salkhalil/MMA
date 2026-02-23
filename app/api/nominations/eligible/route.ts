import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Valid movies: matching pool + 2+ viewers
    const validMovieWhere = {
      pool: category.pool,
      movieViews: { some: {} },
    };

    if (category.type === "FILM") {
      const movies = await prisma.movie.findMany({
        where: validMovieWhere,
        include: { movieViews: true },
        orderBy: { title: "asc" },
      });

      const eligible = movies.filter((m) => m.movieViews.length >= 2);
      return NextResponse.json(eligible);
    }

    // ACTOR or DIRECTOR
    const role = category.type === "ACTOR" ? "ACTOR" : "DIRECTOR";
    const credits = await prisma.movieCredit.findMany({
      where: {
        role,
        movie: validMovieWhere,
      },
      include: {
        person: true,
        movie: { include: { movieViews: true } },
      },
      orderBy: { person: { name: "asc" } },
    });

    const eligible = credits.filter((c) => c.movie.movieViews.length >= 2);
    return NextResponse.json(eligible);
  } catch (error: unknown) {
    console.error("Error fetching eligible items:", error);
    return NextResponse.json(
      { error: "Failed to fetch eligible items" },
      { status: 500 }
    );
  }
}
