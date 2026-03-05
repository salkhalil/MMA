import { prisma } from "@/lib/prisma";

export async function getNominationsDeadline(): Promise<Date> {
  const setting = await prisma.setting.findUnique({
    where: { key: "nominations_deadline" },
  });
  if (!setting?.value) return new Date("2099-01-01");
  const [day, month, year] = setting.value.split("/").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export async function isNominationsLocked(): Promise<boolean> {
  const deadline = await getNominationsDeadline();
  return new Date() > deadline;
}
