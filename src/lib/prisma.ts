import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create a singleton pool to avoid multiple connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or reuse prisma client
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
