import { PrismaClient } from "@prisma/client/extension"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL, // Uses the Pooler (6543)
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma