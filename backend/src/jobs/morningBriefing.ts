import cron from 'node-cron';
import { Server } from 'socket.io';
import { prisma } from '../config/database';
import { ProviderFactory } from '../ai/providers/ProviderFactory';
import { logger } from '../config/logger';

export async function generateBriefingForUser(userId: string) {
  // Date boundaries for Kolkata
  const tzOffset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const localKolkataTime = new Date(now.getTime() + tzOffset);

  const localStart = new Date(localKolkataTime);
  localStart.setUTCHours(0, 0, 0, 0);
  const startOfDay = new Date(localStart.getTime() - tzOffset);

  const localEnd = new Date(localKolkataTime);
  localEnd.setUTCHours(23, 59, 59, 999);
  const endOfDay = new Date(localEnd.getTime() - tzOffset);

  // Fetch tasks
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      dueDate: { gte: startOfDay, lte: endOfDay },
      status: { not: 'DONE' },
      deletedAt: null
    }
  });

  // Fetch calendar events
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId,
      start: { gte: startOfDay, lte: endOfDay },
      deletedAt: null
    },
    orderBy: { start: 'asc' }
  });

  // Fetch habits
  const habits = await prisma.habit.findMany({
    where: { userId, isArchived: false },
    orderBy: { streakCount: 'desc' },
    take: 3
  });

  // Generate motivational line from AI
  let motivation = 'Systems fully operational. Ready to conquer the day.';
  try {
    const provider = ProviderFactory.getProvider();
    const aiResp = await provider.chat([{
      role: 'user',
      content: 'You are ARISE, a JARVIS-style premium AI. Give ONE short motivational sentence (max 20 words) for the morning. Be direct, powerful, futuristic, and encouraging. Avoid generic cliches.'
    }], undefined, { temperature: 0.9 });
    motivation = aiResp.choices?.[0]?.message?.content?.trim() || motivation;
  } catch (err) {
    logger.error('Failed to generate AI motivation for briefing:', err);
  }

  return {
    time: new Date().toISOString(),
    greeting: `Good morning. Systems online.`,
    motivation,
    taskCount: tasks.length,
    tasks: tasks.slice(0, 5).map(t => ({ title: t.title, priority: t.priority })),
    eventCount: events.length,
    events: events.slice(0, 3).map(e => ({
      title: e.title,
      time: new Date(e.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
    })),
    topStreak: habits[0] ? { name: habits[0].title, count: habits[0].streakCount } : null
  };
}

export function registerMorningBriefing(io: Server) {
  // Run every day at 07:00 Asia/Kolkata
  cron.schedule('0 7 * * *', async () => {
    logger.info('Morning briefing cron job triggered.');
    try {
      // Find all users
      const users = await prisma.user.findMany();
      for (const user of users) {
        const briefing = await generateBriefingForUser(user.id);
        // Emit to user's socket room
        io.to(user.id).emit('morning_briefing', briefing);
        logger.info(`Morning briefing broadcasted to user: ${user.email}`);
      }
    } catch (err) {
      logger.error('Morning briefing cron job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info('⏰ Morning briefing cron registered — fires at 07:00 IST daily');
}
