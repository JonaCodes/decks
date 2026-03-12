import { Router } from 'express';
import type { Request, Response } from 'express';
import { MANIFEST } from '../slides/manifest.js';

const router = Router();

router.get('/api/templates', (_req: Request, res: Response) => {
  return res.json(MANIFEST);
});

router.post('/api/plan-slides', (_req: Request, res: Response) => {
  // Stub — planning/LLM integration comes later
  return res.json({ slides: [] });
});

export default router;
