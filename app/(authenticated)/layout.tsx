"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Navigation from "@/app/components/Navigation";
import Loading from "@/app/components/Loading";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUserId, loadingUsers } = useUser();
  const router = useRouter();

  // Redirect to home if no user is selected
  useEffect(() => {
    if (!loadingUsers && !currentUserId) {
      router.push("/");
    }
  }, [currentUserId, loadingUsers, router]);

  if (loadingUsers) {
    return <Loading />;
  }

  if (!currentUserId) {
    return <Loading />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--gradient-bg)",
      }}
    >
      <Navigation />
      {children}
    </div>
  );
}

