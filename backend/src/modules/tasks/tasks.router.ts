import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth';
import { TaskAgent } from '../../ai/agents/TaskAgent';

const router = Router();
const taskAgent = new TaskAgent();

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await taskAgent.execute('listTasks', req.query, req.user!.id);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await taskAgent.execute('createTask', req.body, req.user!.id);
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await taskAgent.execute('updateTask', { ...req.body, id: req.params.id }, req.user!.id);
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const result = await taskAgent.execute('deleteTask', { id: req.params.id }, req.user!.id);
  if (result.success) {
    res.json({ message: 'Task deleted successfully' });
  } else {
    res.status(400).json({ error: result.error });
  }
});

export default router;
