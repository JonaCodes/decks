import { Router } from 'express';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';
import { buildSlidePrompt } from '../../prompts/slide-planner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

router.post('/api/plan-slides', (_req: Request, res: Response) => {
  // Stub — planning/LLM integration comes later
  return res.json({ slides: [] });
});

router.post('/api/sync-templates', (req: Request, res: Response) => {
  const { templates } = req.body;

  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'templates must be an array' });
  }

  const outPath = join(__dirname, '..', '..', 'prompts', 'templates.json');
  writeFileSync(outPath, JSON.stringify(templates, null, 2) + '\n');

  const prompt = buildSlidePrompt();
  return res.json({ ok: true, count: templates.length, prompt });
});

export default router;
