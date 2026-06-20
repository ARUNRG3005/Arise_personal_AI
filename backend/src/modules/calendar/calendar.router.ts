import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth';
import { CalendarAgent } from '../../ai/agents/CalendarAgent';

const router = Router();
const calendarAgent = new CalendarAgent();

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await calendarAgent.execute('listEvents', req.query, req.user!.id);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await calendarAgent.execute('createEvent', req.body, req.user!.id);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await calendarAgent.execute('updateEvent', { ...req.body, id: req.params.id }, req.user!.id);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await calendarAgent.execute('deleteEvent', { id: req.params.id }, req.user!.id);
  if (result.success) {
    res.json({ message: 'Event deleted successfully' });
  } else {
    res.status(400).json({ error: result.error });
  }
});

export default router;
