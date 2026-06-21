import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import usersRouter from './modules/users/users.router';
import tasksRouter from './modules/tasks/tasks.router';
import calendarRouter from './modules/calendar/calendar.router';
import aiRouter from './modules/ai/ai.router';

const app = express();

// Security and utility Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:3001", "http://127.0.0.1:3001", "ws://localhost:3001", "ws://127.0.0.1:3001", "https://*.supabase.co"],
      imgSrc: ["'self'", "data:", "https://*.supabase.co"],
      mediaSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthy check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/ai', aiRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
