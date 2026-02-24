import { NextResponse } from "next/server";
import { getVerifiedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getVerifiedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  return NextResponse.json({ userId });
}
