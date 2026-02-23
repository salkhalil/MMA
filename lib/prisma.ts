import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const accelerateUrl = process.env.DB_PRISMA_DATABASE_URL;

  if (accelerateUrl?.startsWith("prisma+")) {
    return new PrismaClient({ accelerateUrl });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set for local development. " +
        "Set DB_PRISMA_DATABASE_URL for Accelerate (prod) or DATABASE_URL for direct postgres (local)."
    );
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
