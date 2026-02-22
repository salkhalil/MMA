import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ingestCreditsForMovie } from "@/lib/credits";

interface SuggestMovieRequest {
  tmdbId: number;
  title: string;
  year?: number;
  posterPath?: string | null;
  overview?: string;
  viewerIds: number[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SuggestMovieRequest;
    const { tmdbId, title, year, posterPath, overview, viewerIds } = body;

    if (!tmdbId || !title || !viewerIds || viewerIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if movie already exists
    let movie = await prisma.movie.findUnique({
      where: { tmdbId },
      include: { movieViews: true },
    });

    if (movie) {
      // Movie exists, add new viewers if they haven't seen it yet
      const currentMovie = movie;
      const existingViewerIds = movie.movieViews.map((mv) => mv.userId);
      const newViewerIds = viewerIds.filter(
        (id: number) => !existingViewerIds.includes(id)
      );

      if (newViewerIds.length > 0) {
        await prisma.movieView.createMany({
          data: newViewerIds.map((userId: number) => ({
            movieId: currentMovie.id,
            userId,
          })),
        });
      }

      // Fetch updated movie
      movie = await prisma.movie.findUnique({
        where: { tmdbId },
        include: {
          movieViews: {
            include: { user: true },
          },
        },
      });
    } else {
      // Create new movie with viewers
      movie = await prisma.movie.create({
        data: {
          tmdbId,
          title,
          year,
          posterPath,
          overview,
          movieViews: {
            create: viewerIds.map((userId: number) => ({
              userId,
            })),
          },
        },
        include: {
          movieViews: {
            include: { user: true },
          },
        },
      });
    }

    // Ingest credits if the movie doesn't have any yet
    if (movie) {
      const creditCount = await prisma.movieCredit.count({
        where: { movieId: movie.id },
      });
      if (creditCount === 0) {
        try {
          await ingestCreditsForMovie(movie.id, tmdbId);
        } catch (e) {
          console.error("Failed to ingest credits for movie:", tmdbId, e);
        }
      }
    }

    return NextResponse.json(movie);
  } catch (error: unknown) {
    console.error("Error suggesting movie:", error);
    return NextResponse.json(
      { error: "Failed to suggest movie" },
      { status: 500 }
    );
  }
}
