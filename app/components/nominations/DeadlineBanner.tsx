"use client";

import { useState, useEffect } from "react";

const DEADLINE = (() => {
  const raw = process.env.NEXT_PUBLIC_NOMINATIONS_DEADLINE;
  if (!raw) return new Date("2099-01-01");
  const [day, month, year] = raw.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
})();

function getTimeLeft(deadline: Date) {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function DeadlineBanner() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(DEADLINE));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(DEADLINE)), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) {
    return (
      <div
        className="w-full rounded-xl p-4 text-center font-semibold"
        style={{ backgroundColor: "var(--danger-light)", color: "var(--danger)" }}
      >
        Nominations are closed
      </div>
    );
  }

  const units = [
    { label: "d", value: timeLeft.days },
    { label: "h", value: timeLeft.hours },
    { label: "m", value: timeLeft.minutes },
    { label: "s", value: timeLeft.seconds },
  ];

  return (
    <div
      className="w-full rounded-xl p-4 flex items-center justify-center gap-4 font-mono text-sm"
      style={{ backgroundColor: "var(--warning-light)", color: "var(--text-primary)" }}
    >
      <span className="font-semibold" style={{ color: "var(--warning)" }}>
        Nominations close in
      </span>
      <div className="flex gap-2">
        {units.map((u) => (
          <span key={u.label} className="font-bold">
            {u.value}{u.label}
          </span>
        ))}
      </div>
    </div>
  );
}
