import { cookies } from "next/headers";

export async function getVerifiedUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get("verified_user")?.value;
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}
