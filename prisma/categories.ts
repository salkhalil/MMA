import { CategoryType } from "@prisma/client";

export const categories = [
  // Film categories (below-the-line)
  { name: "Best Picture", type: CategoryType.FILM },
  { name: "Best Screenplay", type: CategoryType.FILM },
  { name: "Best Cinematography", type: CategoryType.FILM },
  { name: "Best Score", type: CategoryType.FILM },
  { name: "Best Editing", type: CategoryType.FILM },

  // Actor categories
  { name: "Best Actor", type: CategoryType.ACTOR },
  { name: "Best Actress", type: CategoryType.ACTOR },
  { name: "Best Supporting Actor", type: CategoryType.ACTOR },
  { name: "Best Supporting Actress", type: CategoryType.ACTOR },

  // Director categories
  { name: "Best Director", type: CategoryType.DIRECTOR },
] as const;
