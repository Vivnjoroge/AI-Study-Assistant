import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  askQuestion,
  listChats,
  getChatHistory,
  deleteChat,
} from '../controllers/chat.controller';

const router = Router();

router.use(authenticate);

router.post('/ask', askQuestion);
router.get('/chats', listChats);
router.get('/chats/:id', getChatHistory);
router.delete('/chats/:id', deleteChat);

export default router;
