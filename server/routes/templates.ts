import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

router.post('/api/plan-slides', (_req: Request, res: Response) => {
  // Stub — planning/LLM integration comes later
  return res.json({ slides: [] });
});

export default router;
