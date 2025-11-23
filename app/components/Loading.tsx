import React from "react";

export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: "var(--gradient-bg)",
      }}
    >
      <div
        className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4"
        style={{ borderColor: "var(--primary)" }}
      ></div>
      <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
        Loading...
      </h2>
    </div>
  );
}
