import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") ?? "", 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const verifiedUserId = await getVerifiedUserId();
    if (!verifiedUserId || verifiedUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nominations = await prisma.nomination.findMany({
      where: { userId },
      select: { categoryId: true },
      distinct: ["categoryId"],
    });

    return NextResponse.json({
      completedCategoryIds: nominations.map((n) => n.categoryId),
    });
  } catch (error: unknown) {
    console.error("Error fetching nomination status:", error);
    return NextResponse.json(
      { error: "Failed to fetch nomination status" },
      { status: 500 }
    );
  }
}
