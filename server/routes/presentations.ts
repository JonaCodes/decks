import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as presentationController from '../controllers/presentationController';

const router = Router();

router.get('/presentations', requireAuth, presentationController.list);
router.get('/presentations/:id', requireAuth, presentationController.get);
router.post('/presentations', requireAuth, presentationController.create);
router.put('/presentations/:id', requireAuth, presentationController.update);
router.delete('/presentations/:id', requireAuth, presentationController.remove);
router.post('/presentations/:id/save', requireAuth, presentationController.bulkSave);

export default router;
