import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (env.SINGLE_USER_MODE) {
      let user;
      try {
        // Find or create default user automatically
        user = await prisma.user.findUnique({
          where: { email: env.DEFAULT_USER_EMAIL },
        });

        if (!user) {
          logger.info(`Creating default user for single-user mode: ${env.DEFAULT_USER_EMAIL}`);
          user = await prisma.user.create({
            data: {
              email: env.DEFAULT_USER_EMAIL,
              name: env.DEFAULT_USER_NAME,
              preferences: {},
            },
          });
        }
      } catch (dbErr) {
        logger.warn('⚠️ Database connection failed. Falling back to in-memory mock user for single-user mode.');
        user = {
          id: 'mock-user-id',
          email: env.DEFAULT_USER_EMAIL,
          name: env.DEFAULT_USER_NAME,
        };
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
      return next();
    }

    // Standard JWT authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Access token is missing or invalid.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired access token.' });
  }
}
