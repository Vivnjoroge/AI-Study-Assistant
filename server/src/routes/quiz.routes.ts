import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { generateQuizHandler } from '../controllers/quiz.controller';

const router = Router();

router.use(authenticate);
router.get('/quiz/:documentId', generateQuizHandler);

export default router;
