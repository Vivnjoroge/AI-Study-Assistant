import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  uploadDocument,
  listDocuments,
  getDocument,
  deleteDocument,
} from '../controllers/document.controller';

const router = Router();

// All document routes require authentication
router.use(authenticate);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', listDocuments);
router.get('/documents/:id', getDocument);
router.delete('/documents/:id', deleteDocument);

export default router;
