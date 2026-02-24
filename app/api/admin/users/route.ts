import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";
import { z } from "zod";
import { Role } from "@prisma/client";

const createUserSchema = z.object({
  name: z.string().min(1).trim(),
  password: z.string().min(1),
  role: z.enum(Object.values(Role)),
});

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

export async function POST(request: NextRequest) {
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

    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    const user = await prisma.user.create({
      data: parsed.data,
      select: { id: true, name: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Name already taken" }, { status: 409 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
