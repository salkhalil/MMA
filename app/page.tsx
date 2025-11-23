"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/app/context/UserContext";
import Loading from "./components/Loading";

export default function Home() {
  const { currentUserId, users, setCurrentUserId, loadingUsers } = useUser();
  const router = useRouter();

  // Redirect to /add if user is already selected
  useEffect(() => {
    if (!loadingUsers && currentUserId) {
      router.push("/add");
    }
  }, [currentUserId, loadingUsers, router]);

  const handleUserSelect = (userId: number) => {
    setCurrentUserId(userId);
    router.push("/add");
  };

  if (loadingUsers) {
    return <Loading />;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: "var(--gradient-bg)",
      }}
    >
      <div className="text-center mb-12">
        <Image
          src="/logo.png"
          alt="Mandem Movie Awards"
          width={200}
          height={200}
          className="w-40 h-40 mx-auto drop-shadow-2xl mb-6"
          priority
        />
        <h1
          className="text-5xl sm:text-6xl font-bold mb-4"
          style={{
            background: "var(--gradient-primary)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Mandem Awards
        </h1>
        <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
          Who are you?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id)}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-blue-500"
          >
            <div
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl text-white font-bold shadow-inner"
              style={{
                background:
                  "linear-gradient(to bottom right, rgb(59, 130, 246), rgb(147, 51, 234))",
              }}
            >
              {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {user.name}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
}
