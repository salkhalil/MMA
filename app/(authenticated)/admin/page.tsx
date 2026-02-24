"use client";

import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface AdminUser {
  id: number;
  name: string;
  role: string;
  password: string;
  completedCategories: number[];
  totalNominations: number;
}

type Tab = "users" | "progress";

export default function AdminPage() {
  const { isAdmin, currentUser } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<Tab>("progress");

  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.push("/add");
    }
  }, [currentUser, isAdmin, router]);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, catsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/categories"),
      ]);
      if (!usersRes.ok) return;
      const usersData = await usersRes.json();
      const catsData = await catsRes.json();
      setUsers(usersData);
      setTotalCategories(catsData.length);
      const pw: Record<number, string> = {};
      usersData.forEach((u: AdminUser) => { pw[u.id] = u.password; });
      setPasswords(pw);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSavePassword = async (userId: number) => {
    setSaving((p) => ({ ...p, [userId]: true }));
    setSaved((p) => ({ ...p, [userId]: false }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwords[userId] }),
      });
      if (res.ok) {
        setSaved((p) => ({ ...p, [userId]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [userId]: false })), 2000);
      }
    } finally {
      setSaving((p) => ({ ...p, [userId]: false }));
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--card-border)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const totalCompleted = users.filter(
    (u) => u.completedCategories.length === totalCategories
  ).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: "progress", label: "Progress" },
    { key: "users", label: "Passwords" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Admin Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {totalCompleted}/{users.length} users finished all categories
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-6"
        style={{ backgroundColor: "var(--card-border)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              tab === t.key
                ? {
                    backgroundColor: "var(--card-bg)",
                    color: "var(--text-primary)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }
                : { color: "var(--text-secondary)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Progress tab */}
      {tab === "progress" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const completed = user.completedCategories.length;
            const pct = totalCategories > 0 ? (completed / totalCategories) * 100 : 0;
            const done = completed === totalCategories;

            return (
              <div
                key={user.id}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: done ? "rgb(34,197,94)" : "var(--card-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: done ? "linear-gradient(135deg, #22c55e, #16a34a)" : "var(--gradient-primary)" }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {user.name}
                    </h2>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {completed} / {totalCategories} categories
                    </p>
                  </div>
                  {done && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "rgb(34,197,94)" }}
                    >
                      Done
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--card-border)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: done ? "linear-gradient(90deg, #22c55e, #16a34a)" : "var(--gradient-primary)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passwords tab */}
      {tab === "users" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((user) => {
            const original = users.find((u) => u.id === user.id)?.password;
            const changed = passwords[user.id] !== original;

            return (
              <div
                key={user.id}
                className="rounded-xl border p-5"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {user.name}
                  </h2>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full ml-auto"
                    style={{
                      backgroundColor: user.role === "ADMIN" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)",
                      color: user.role === "ADMIN" ? "rgb(139,92,246)" : "rgb(59,130,246)",
                    }}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={passwords[user.id] ?? ""}
                    onChange={(e) => setPasswords((p) => ({ ...p, [user.id]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 rounded-lg border text-sm font-mono"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={() => handleSavePassword(user.id)}
                    disabled={saving[user.id] || !changed}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {saving[user.id] ? "..." : saved[user.id] ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
