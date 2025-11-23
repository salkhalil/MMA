"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/context/ToastContext";

export default function ProfilePage() {
  const { currentUser, setUsers, users } = useUser();
  const { showToast } = useToast();
  const [letterboxdUrl, setLetterboxdUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.letterboxdUrl) {
      setLetterboxdUrl(currentUser.letterboxdUrl);
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letterboxdUrl: letterboxdUrl.trim() || null }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the users list with the new data
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const extractUsername = (url: string): string | null => {
    const match = url.match(/letterboxd\.com\/([a-zA-Z0-9_-]+)\/?$/);
    return match ? match[1] : null;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const username = letterboxdUrl ? extractUsername(letterboxdUrl) : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ background: "var(--gradient-primary)" }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {currentUser.name}
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Member since {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div
          className="rounded-2xl shadow-lg border p-6 sm:p-8"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Letterboxd Integration
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label
                htmlFor="letterboxdUrl"
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Letterboxd Profile URL
              </label>
              <input
                id="letterboxdUrl"
                type="text"
                value={letterboxdUrl}
                onChange={(e) => setLetterboxdUrl(e.target.value)}
                placeholder="https://letterboxd.com/username"
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Enter your Letterboxd profile URL (e.g., https://letterboxd.com/username)
              </p>
            </div>

            {letterboxdUrl && username && (
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                }}
              >
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Preview
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Username:
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {username}
                  </span>
                </div>
                <a
                  href={letterboxdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium mt-2 inline-flex items-center gap-1 hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  View on Letterboxd
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg text-white"
                style={{
                  background: "var(--gradient-primary)",
                }}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </form>

          {/* Info Section */}
          <div
            className="mt-8 p-4 rounded-lg border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--card-border)",
            }}
          >
            <h3
              className="text-sm font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              ℹ️ How it works
            </h3>
            <ul
              className="text-sm space-y-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>• Save your Letterboxd profile URL to quickly import movies</li>
              <li>• The import feature will automatically use your saved URL</li>
              <li>• You can update or remove it anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

