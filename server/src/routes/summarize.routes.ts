import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { summarizeDocument } from '../controllers/summarize.controller';

const router = Router();

router.use(authenticate);
router.get('/summarize/:documentId', summarizeDocument);

export default router;
