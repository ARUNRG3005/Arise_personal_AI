import { Server } from 'socket.io';
import http from 'http';
import { env } from './env';
import { logger } from './logger';

let io: Server | null = null;

export function initSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected to Socket.IO: ${socket.id}`);
    
    // Allow users to register and join a specific user room for targeted notifications
    socket.on('register', (userId: string) => {
      socket.join(userId);
      logger.info(`🔌 User registered to Socket.IO room: ${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected from Socket.IO: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket first.');
  }
  return io;
}
