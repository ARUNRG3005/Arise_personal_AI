import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDb } from './config/database';
import { logger } from './config/logger';
import { initSocket } from './config/socket';
import { startScheduler } from './scheduler';

import { registerMorningBriefing } from './jobs/morningBriefing';

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);
registerMorningBriefing(io);

// Run server after connecting database
async function startServer() {
  await connectDb();
  
  // Start background cron scheduler
  startScheduler();

  const PORT = env.PORT;
  server.listen(PORT, () => {
    logger.info(`🚀 ARISE Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`👉 Frontend connection configured for: ${env.FRONTEND_URL}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start ARISE server:', error);
  process.exit(1);
});
