import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDb } from './config/database';
import { logger } from './config/logger';

const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  logger.info(`🔌 Client connected to Socket.IO: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`🔌 Client disconnected from Socket.IO: ${socket.id}`);
  });
});

// Run server after connecting database
async function startServer() {
  await connectDb();

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
