"use client";

import { useState } from "react";

interface PasswordModalProps {
  userName: string;
  onSubmit: (password: string) => Promise<boolean>;
  onClose: () => void;
}

export default function PasswordModal({ userName, onSubmit, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const success = await onSubmit(password);
      if (!success) {
        setError("Wrong password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        <h2
          className="text-xl font-bold mb-1 text-center"
          style={{ color: "var(--text-primary)" }}
        >
          Hey, {userName}
        </h2>
        <p
          className="text-sm mb-5 text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          Enter your password
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--card-border)",
              color: "var(--text-primary)",
            }}
          />

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {loading ? "Checking..." : "Enter"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
