import cron from 'node-cron';
import { prisma } from '../config/database';
import { getSocketIO } from '../config/socket';
import { logger } from '../config/logger';

export function startScheduler() {
  logger.info('⏰ Background scheduler started...');

  // Run every minute to check for tasks and events starting soon
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      // 1. Query for due tasks (Todo or In Progress) that are due in the next 15 minutes
      const dueTasks = await prisma.task.findMany({
        where: {
          status: { in: ['TODO', 'IN_PROGRESS'] },
          dueDate: {
            gte: now,
            lte: fifteenMinutesFromNow,
          },
          deletedAt: null,
        },
      });

      for (const task of dueTasks) {
        // Prevent duplicate notifications by searching for an existing "Task Due Soon" alert containing this task title
        const exists = await prisma.notification.findFirst({
          where: {
            userId: task.userId,
            title: 'Task Due Soon',
            body: { contains: task.title },
          },
        });

        if (!exists) {
          const notification = await prisma.notification.create({
            data: {
              userId: task.userId,
              title: 'Task Due Soon',
              body: `The task "${task.title}" is due soon.`,
              type: 'reminder',
              metadata: { taskId: task.id },
              sentAt: new Date(),
            },
          });

          // Dispatch the notification using Socket.IO
          try {
            const io = getSocketIO();
            io.to(task.userId).emit('notification:new', notification);
            logger.info(`🔔 Emitted Task Due Soon alert for "${task.title}" to User ${task.userId}`);
          } catch (ioErr) {
            logger.warn('Socket.IO not initialized or connection failed during task notification emission:', ioErr);
          }
        }
      }

      // 2. Query for upcoming calendar events starting in the next 15 minutes
      const upcomingEvents = await prisma.calendarEvent.findMany({
        where: {
          start: {
            gte: now,
            lte: fifteenMinutesFromNow,
          },
          deletedAt: null,
        },
      });

      for (const event of upcomingEvents) {
        // Prevent duplicate notifications
        const exists = await prisma.notification.findFirst({
          where: {
            userId: event.userId,
            title: 'Event Starting Soon',
            body: { contains: event.title },
          },
        });

        if (!exists) {
          const startTimeStr = new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const notification = await prisma.notification.create({
            data: {
              userId: event.userId,
              title: 'Event Starting Soon',
              body: `"${event.title}" starts soon at ${startTimeStr}.`,
              type: 'reminder',
              metadata: { eventId: event.id },
              sentAt: new Date(),
            },
          });

          // Dispatch the notification using Socket.IO
          try {
            const io = getSocketIO();
            io.to(event.userId).emit('notification:new', notification);
            logger.info(`🔔 Emitted Event Starting Soon alert for "${event.title}" to User ${event.userId}`);
          } catch (ioErr) {
            logger.warn('Socket.IO not initialized or connection failed during event notification emission:', ioErr);
          }
        }
      }
    } catch (error) {
      logger.error('Error executing background scheduler tick:', error);
    }
  });
}
