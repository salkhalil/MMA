import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type MovieWithViews = Prisma.MovieGetPayload<{
  include: {
    movieViews: {
      include: {
        user: true;
      };
    };
  };
}>;

export async function GET() {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        movieViews: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform data to include viewer count and valid status
    const moviesWithStats = movies.map((movie: MovieWithViews) => ({
      ...movie,
      viewerCount: movie.movieViews.length,
      isValid: movie.movieViews.length >= 2,
      viewers: movie.movieViews.map((mv) => mv.user),
    }));

    return NextResponse.json(moviesWithStats);
  } catch (error: unknown) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}
