import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const dbUrl = process.env.DATABASE_URL;

  if (!isDemo) {
    if (!dbUrl || (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://"))) {
      throw new Error("DATABASE_URL is not configured.");
    }
  }

  // To prevent Prisma initialization validation crash during build-time or in demo mode,
  // we provide a dummy fallback postgresql string when DATABASE_URL is empty or invalid.
  const finalUrl = dbUrl && (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://"))
    ? dbUrl
    : "postgresql://dummy_user:dummy_password@localhost:5432/dummy_db";

  return new PrismaClient({
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
