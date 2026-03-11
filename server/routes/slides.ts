import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as slideController from '../controllers/slideController';

const router = Router();

router.post('/presentations/:presentationId/slides', requireAuth, slideController.add);
router.delete('/slides/:id', requireAuth, slideController.remove);

export default router;
