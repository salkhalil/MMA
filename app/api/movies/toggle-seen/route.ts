import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ToggleSeenRequest {
  tmdbId: number;
  userId: number;
  hasSeen: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ToggleSeenRequest;
    const { tmdbId, userId, hasSeen } = body;

    if (tmdbId === undefined || userId === undefined || hasSeen === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, userId, hasSeen" },
        { status: 400 }
      );
    }

    // Find the movie by tmdbId
    const movie = await prisma.movie.findUnique({
      where: { tmdbId },
    });

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    // Update the MovieView record
    const movieView = await prisma.movieView.updateMany({
      where: {
        movieId: movie.id,
        userId: userId,
      },
      data: {
        hasSeen: hasSeen,
      },
    });

    if (movieView.count === 0) {
      return NextResponse.json(
        { error: "MovieView record not found for this user and movie" },
        { status: 404 }
      );
    }

    // Fetch and return updated movie with all viewers
    const updatedMovie = await prisma.movie.findUnique({
      where: { tmdbId },
      include: {
        movieViews: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json(updatedMovie);
  } catch (error: unknown) {
    console.error("Error toggling seen status:", error);
    return NextResponse.json(
      { error: "Failed to toggle seen status" },
      { status: 500 }
    );
  }
}
