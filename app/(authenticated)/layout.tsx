"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import Navigation from "@/app/components/Navigation";
import Loading from "@/app/components/Loading";
import PasswordModal from "@/app/components/PasswordModal";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUserId, currentUser, loadingUsers, sessionExpired, verifyAndSetUser, setCurrentUserId } = useUser();
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
      {sessionExpired && currentUser && (
        <PasswordModal
          userName={currentUser.name}
          onSubmit={(password) => verifyAndSetUser(currentUser.id, password)}
          onClose={() => {
            setCurrentUserId(null);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
