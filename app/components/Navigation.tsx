"use client";

import { useState, useRef, useEffect, memo } from "react";
import { useUser } from "@/app/context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PasswordModal from "./PasswordModal";

function Navigation() {
  const { currentUser, users, setCurrentUserId, verifyAndSetUser, isAdmin } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserChange = (userId: number) => {
    if (userId === currentUser?.id) {
      setShowUserMenu(false);
      return;
    }
    setPendingUserId(userId);
    setShowUserMenu(false);
  };

  const pendingUser = users.find((u) => u.id === pendingUserId) || null;

  const handleLogout = () => {
    setCurrentUserId(null);
    setShowUserMenu(false);
    router.push("/");
  };

  if (!currentUser) return null;

  return (
    <nav
      className="sticky top-0 z-50 border-b shadow-sm"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/add" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Mandem Movie Awards"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <div className="hidden sm:block">
              <h1
                className="text-xl font-bold"
                style={{
                  background: "var(--gradient-primary)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Mandem Awards
              </h1>
              <p
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Who the fook is Oscar?
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/add"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname === "/add"
                  ? "text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={
                pathname === "/add"
                  ? { background: "var(--gradient-primary)" }
                  : { color: "var(--text-primary)" }
              }
            >
              Add Movies
            </Link>
            <Link
              href="/nominate"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname === "/nominate"
                  ? "text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={
                pathname === "/nominate"
                  ? { background: "var(--gradient-primary)" }
                  : { color: "var(--text-primary)" }
              }
            >
              Nominate
            </Link>
            <Link
              href="/gallery"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                pathname === "/gallery"
                  ? "text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={
                pathname === "/gallery"
                  ? { background: "var(--gradient-primary)" }
                  : { color: "var(--text-primary)" }
              }
            >
              Gallery
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  pathname === "/admin"
                    ? "text-white shadow-md"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                style={
                  pathname === "/admin"
                    ? { background: "var(--gradient-primary)" }
                    : { color: "var(--text-primary)" }
                }
              >
                Admin
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--gradient-primary)" }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Wag1, {currentUser.name}
                </p>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
                style={{ color: "var(--text-secondary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border overflow-hidden"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="p-2">
                  <p
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Switch User
                  </p>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserChange(user.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        user.id === currentUser.id
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {user.name}
                      </span>
                      {user.id === currentUser.id && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t" style={{ borderColor: "var(--card-border)" }}>
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="block w-full px-5 py-3 text-left text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ⚙️ Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    Change User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingUser && (
        <PasswordModal
          userName={pendingUser.name}
          onSubmit={async (password) => {
            return verifyAndSetUser(pendingUser.id, password);
          }}
          onClose={() => setPendingUserId(null)}
        />
      )}
    </nav>
  );
}

export default memo(Navigation);

