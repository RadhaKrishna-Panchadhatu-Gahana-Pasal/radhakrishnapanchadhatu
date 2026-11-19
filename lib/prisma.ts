import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  try {
    return (
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    );
  } catch {
    console.warn('[AI Studio] Database not connected — using mock');
    const noOp = {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async (d?: { data?: Record<string, unknown> }) => d?.data ?? {},
      update: async (d?: { data?: Record<string, unknown> }) => d?.data ?? {},
      delete: async () => ({}),
      count: async () => 0,
    };
    return new Proxy({} as PrismaClient, {
      get: (_target, prop) => {
        if (prop === '$connect' || prop === '$disconnect') {
          return async () => {};
        }
        return noOp;
      },
    });
  }
}

export const prisma = createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

