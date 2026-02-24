import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserId } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { password, role } = body;

    if (password !== undefined && (typeof password !== "string" || !password.trim())) {
      return NextResponse.json({ error: "Password must be a non-empty string" }, { status: 400 });
    }
    if (role !== undefined && role !== "USER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password === undefined && role === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const data: Record<string, string> = {};
    if (password !== undefined) data.password = password.trim();
    if (role !== undefined) data.role = role;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch (error: unknown) {
    console.error("Error updating user password:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
