"use client";

import { useUser } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Role } from "@prisma/client";

interface AdminUser {
  id: number;
  name: string;
  role: string;
  password: string;
  completedCategories: number[];
  totalNominations: number;
}

type Tab = "users" | "progress" | "settings";

const ROLE_OPTIONS = Object.values(Role);

export default function AdminPage() {
  const { isAdmin, currentUser } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState<Record<number, string>>({});
  const [roles, setRoles] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<Tab>("progress");

  // New user form
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>(Role.USER);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Settings
  const [nominationsDeadline, setNominationsDeadline] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [savingResults, setSavingResults] = useState(false);

  useEffect(() => {
    if (currentUser && !isAdmin) {
      router.push("/add");
    }
  }, [currentUser, isAdmin, router]);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, catsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/categories"),
        fetch("/api/admin/settings"),
      ]);
      if (!usersRes.ok) return;
      const usersData = await usersRes.json();
      const catsData = await catsRes.json();
      setUsers(usersData);
      setTotalCategories(catsData.length);
      const pw: Record<number, string> = {};
      const rl: Record<number, string> = {};
      usersData.forEach((u: AdminUser) => {
        pw[u.id] = u.password;
        rl[u.id] = u.role;
      });
      setPasswords(pw);
      setRoles(rl);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.nominations_deadline) {
          const [day, month, year] = settings.nominations_deadline.split("/");
          setNominationsDeadline(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
        }
        setResultsVisible(settings.results_visible === "true");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveUser = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const passwordChanged = passwords[userId] !== user.password;
    const roleChanged = roles[userId] !== user.role;
    if (!passwordChanged && !roleChanged) return;

    setSaving((p) => ({ ...p, [userId]: true }));
    setSaved((p) => ({ ...p, [userId]: false }));
    try {
      const body: Record<string, string> = {};
      if (passwordChanged) body.password = passwords[userId];
      if (roleChanged) body.role = roles[userId];

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved((p) => ({ ...p, [userId]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [userId]: false })), 2000);
        await fetchData();
      }
    } finally {
      setSaving((p) => ({ ...p, [userId]: false }));
    }
  };

  const handleCreateUser = async () => {
    setCreateError("");
    if (!newName.trim() || !newPassword.trim()) {
      setCreateError("Name and password are required.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), password: newPassword.trim(), role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create user.");
        return;
      }
      setNewName("");
      setNewPassword("");
      setNewRole("USER");
      await fetchData();
    } finally {
      setCreating(false);
    }
  };

  const handleSaveDeadline = async () => {
    if (!nominationsDeadline) return;
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      // Convert yyyy-mm-dd to dd/mm/yyyy
      const [year, month, day] = nominationsDeadline.split("-");
      const value = `${day}/${month}/${year}`;
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "nominations_deadline", value }),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearDeadline = async () => {
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "nominations_deadline", value: "" }),
      });
      if (res.ok) {
        setNominationsDeadline("");
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleResults = async () => {
    setSavingResults(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "results_visible", value: (!resultsVisible).toString() }),
      });
      if (res.ok) setResultsVisible(!resultsVisible);
    } finally {
      setSavingResults(false);
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
    { key: "users", label: "Users" },
    { key: "settings", label: "Settings" },
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

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="space-y-6">
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              Nominations Deadline
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Set the date when nominations close. Leave empty to keep nominations open indefinitely.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={nominationsDeadline}
                onChange={(e) => setNominationsDeadline(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleSaveDeadline}
                disabled={savingSettings || !nominationsDeadline}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                {savingSettings ? "..." : settingsSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleClearDeadline}
                disabled={savingSettings || !nominationsDeadline}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40 shrink-0 border"
                style={{
                  borderColor: "var(--card-border)",
                  color: "var(--text-secondary)",
                }}
              >
                Clear
              </button>
            </div>
            {nominationsDeadline && (
              <p className="text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
                {new Date() > new Date(nominationsDeadline + "T00:00:00Z")
                  ? "Nominations are currently closed."
                  : "Nominations are currently open."}
              </p>
            )}
          </div>

          {/* Results Visibility */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              Results Visibility
            </h2>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Toggle whether results are visible to all users. Admins can always see results.
            </p>
            <button
              onClick={handleToggleResults}
              disabled={savingResults}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40"
              style={{
                background: resultsVisible ? "var(--gradient-warm)" : "var(--gradient-primary)",
              }}
            >
              {savingResults ? "..." : resultsVisible ? "Results Visible — Click to Hide" : "Results Hidden — Click to Show"}
            </button>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="space-y-6">
          {/* Add user form */}
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              Add User
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm font-mono"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="px-3 py-1.5 rounded-lg border text-sm"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                  color: "var(--text-primary)",
                }}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-40 shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                {creating ? "..." : "Add"}
              </button>
            </div>
            {createError && (
              <p className="text-xs mt-2" style={{ color: "rgb(239,68,68)" }}>{createError}</p>
            )}
          </div>

          {/* User cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((user) => {
              const pwChanged = passwords[user.id] !== user.password;
              const roleChanged = roles[user.id] !== user.role;
              const changed = pwChanged || roleChanged;

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
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <h2 className="font-semibold flex-1 min-w-0 truncate" style={{ color: "var(--text-primary)" }}>
                      {user.name}
                    </h2>
                    <select
                      value={roles[user.id] ?? user.role}
                      onChange={(e) => setRoles((p) => ({ ...p, [user.id]: e.target.value }))}
                      className="text-xs font-medium px-2 py-0.5 rounded-full border-0 shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: (roles[user.id] ?? user.role) === "ADMIN" ? "rgba(139,92,246,0.15)" : "rgba(59,130,246,0.15)",
                        color: (roles[user.id] ?? user.role) === "ADMIN" ? "rgb(139,92,246)" : "rgb(59,130,246)",
                      }}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
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
                      onClick={() => handleSaveUser(user.id)}
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
        </div>
      )}
    </div>
  );
}
