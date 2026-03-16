import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";
import { runIRV } from "@/lib/irv";
import { nominationsToBallots, buildNomineeMap } from "@/lib/irv-helpers";

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
    const verifiedUserId = await getVerifiedUserId();
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin or results are visible
    const [user, resultsSetting] = await Promise.all([
      prisma.user.findUnique({ where: { id: verifiedUserId } }),
      prisma.setting.findUnique({ where: { key: "results_visible" } }),
    ]);
    const resultsVisible = resultsSetting?.value === "true";
    if (!resultsVisible && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Results not available yet" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryIdParam = searchParams.get("categoryId");

    const where = categoryIdParam
      ? { categoryId: parseInt(categoryIdParam, 10) }
      : {};

    const categories = await prisma.category.findMany({
      where: categoryIdParam
        ? { id: parseInt(categoryIdParam, 10) }
        : {},
      orderBy: { id: "asc" },
    });

    const nominations = await prisma.nomination.findMany({
      where,
      include: NOMINATION_INCLUDE,
      orderBy: { rank: "asc" },
    });

    // Group nominations by category
    const byCat = new Map<number, typeof nominations>();
    for (const n of nominations) {
      const list = byCat.get(n.categoryId) ?? [];
      list.push(n);
      byCat.set(n.categoryId, list);
    }

    const results = categories.map((cat) => {
      const catNoms = byCat.get(cat.id) ?? [];
      const ballots = nominationsToBallots(catNoms, cat.type);
      const result = runIRV(ballots);
      const nominees = buildNomineeMap(catNoms, cat.type);
      return { category: cat, result, nominees };
    });

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("Error computing results:", error);
    return NextResponse.json(
      { error: "Failed to compute results" },
      { status: 500 }
    );
  }
}
