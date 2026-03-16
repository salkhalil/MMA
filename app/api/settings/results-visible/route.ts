import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "results_visible" },
    });
    return NextResponse.json({ visible: setting?.value === "true" });
  } catch {
    return NextResponse.json({ visible: false });
  }
}
