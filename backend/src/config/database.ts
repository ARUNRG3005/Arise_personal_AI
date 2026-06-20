import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'error' },
      { emit: 'stdout', level: 'info' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    logger.debug(`Prisma Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

export async function connectDb() {
  try {
    await prisma.$connect();
    logger.info('🔌 Database connection established successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    // If not in production, don't crash, we'll degrade gracefully or use memory fallback
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
