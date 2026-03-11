import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as templateController from '../controllers/templateController';

const router = Router();

router.get('/templates', requireAuth, templateController.list);
router.get('/templates/:id', requireAuth, templateController.get);
router.post('/templates', requireAuth, templateController.create);
router.patch('/templates/:id', requireAuth, templateController.update);
router.delete('/templates/:id', requireAuth, templateController.remove);

export default router;
