import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "nominations_deadline" },
    });

    return NextResponse.json({
      deadline: setting?.value ?? null,
    });
  } catch (error) {
    console.error("Error fetching nominations deadline:", error);
    return NextResponse.json(
      { error: "Failed to fetch deadline" },
      { status: 500 }
    );
  }
}
