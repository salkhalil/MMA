import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";

export async function GET() {
  try {
    const verifiedUserId = await getVerifiedUserId();
    if (!verifiedUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: verifiedUserId },
      select: { id: true, role: true },
    });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        password: true,
        _count: { select: { nominations: true } },
        nominations: { select: { categoryId: true }, distinct: ["categoryId"] },
      },
      orderBy: { id: "asc" },
    });

    const result = users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      password: u.password,
      completedCategories: u.nominations.map((n) => n.categoryId),
      totalNominations: u._count.nominations,
    }));

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
