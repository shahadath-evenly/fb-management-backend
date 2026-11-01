import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// node-postgres's own defaults (max: 10, idleTimeoutMillis: 10000) are
// fine as-is for this app's scale — made explicit here just so the
// pool's behavior is documented, not implicit. connectionTimeoutMillis
// has no default (pg waits indefinitely for a connection attempt to
// succeed or fail) — set explicitly so a misconfigured/unreachable
// database fails fast with a clear error instead of hanging silently,
// which matters most right after a fresh deployment.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export const prisma = new PrismaClient({ adapter });

export async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error('Database connection check failed:', err.message);
    return false;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
