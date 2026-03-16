import { Category } from "@/types";

// Ceremony presentation order: fun → classic → below-the-line → supporting → director → leads → best picture
export const CEREMONY_ORDER: string[] = [
  // Fun / Wildcard
  "Best M.U.I (Movie Under the Influence)",
  "Best Film Tush Hates",
  "Worst Film Sal Loves",
  "Worst Film",
  "Best Social Experience",
  // Classic
  "Best Film Seen at Home",
  // Below-the-line
  "Best Editing",
  "Best Score",
  "Best Cinematography",
  "Best Screenplay",
  "Best Foreign Language Film",
  // Supporting actors
  "Best Supporting Actor",
  "Best Supporting Actress",
  // Director
  "Best Director",
  // Lead actors
  "Best Actor",
  "Best Actress",
  // Best Picture
  "Best Picture",
];

export function sortByCeremonyOrder<T extends { category: Category }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const ai = CEREMONY_ORDER.indexOf(a.category.name);
    const bi = CEREMONY_ORDER.indexOf(b.category.name);
    // Unknown categories go to the end
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}
