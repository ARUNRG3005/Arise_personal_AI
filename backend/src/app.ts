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
  contentSecurityPolicy: false, // Turn off for dev convenience
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
