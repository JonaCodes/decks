import { Router } from 'express';
import { z } from 'zod';
import { renderSlide } from './renderer.js';
import type { Request, Response } from 'express';

const router = Router();

const bodySchema = z.object({
  html: z.string().min(1),
  css: z.string().optional().default(''),
});

router.post(
  '/api/render-custom-slide',
  async (req: Request, res: Response) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'html is required' });
    }

    try {
      const base64Data = await renderSlide(parsed.data.html, parsed.data.css);
      return res.json({ base64Data, mimeType: 'image/png' });
    } catch (err) {
      console.error('Custom slide render failed:', err);
      return res
        .status(500)
        .json({ error: 'Rendering failed', detail: String(err) });
    }
  }
);

export default router;
