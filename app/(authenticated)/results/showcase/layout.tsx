"use client";

import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUserId, loadingUsers } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUsers && !currentUserId) router.push("/");
  }, [loadingUsers, currentUserId, router]);

  if (loadingUsers || !currentUserId) return null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0612" }}
    >
      {children}
    </div>
  );
}
