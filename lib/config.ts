function parseDeadline(): Date {
  const raw = process.env.NEXT_PUBLIC_NOMINATIONS_DEADLINE;
  if (!raw) return new Date("2099-01-01");
  const [day, month, year] = raw.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export const NOMINATIONS_DEADLINE = parseDeadline();
export const MAX_NOMINATIONS_PER_CATEGORY = 5;
export const isNominationsLocked = () => new Date() > NOMINATIONS_DEADLINE;
