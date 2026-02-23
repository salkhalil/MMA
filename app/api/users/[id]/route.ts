import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { letterboxdUrl } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate Letterboxd URL format if provided
    if (letterboxdUrl !== null && letterboxdUrl !== undefined && letterboxdUrl !== "") {
      const letterboxdPattern = /^https?:\/\/(www\.)?letterboxd\.com\/[a-zA-Z0-9_-]+\/?$/;
      if (!letterboxdPattern.test(letterboxdUrl)) {
        return NextResponse.json(
          { error: "Invalid Letterboxd URL format. Expected: https://letterboxd.com/username" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        letterboxdUrl: letterboxdUrl || null,
      },
      select: { id: true, name: true, role: true, letterboxdUrl: true, createdAt: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

