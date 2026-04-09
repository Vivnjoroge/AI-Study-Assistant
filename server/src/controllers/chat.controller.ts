import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createEmbedding, generateAnswer } from '../services/ai.service';
import {
  searchSimilarChunks,
  toMessageSources,
} from '../services/document.service';
import {
  createChat,
  saveMessage,
  getChatMessages,
  getUserChats,
  updateChatTitle,
} from '../services/chat.service';
import { createError } from '../middleware/errorHandler';
import pool from '../db/pool';

const AskSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000),
  chatId: z.string().uuid().optional(),
  documentIds: z.array(z.string().uuid()).optional().default([]),
  explainLikeBeginner: z.boolean().optional().default(false),
});

/** POST /api/ask — Core RAG Q&A endpoint */
export async function askQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { question, chatId, documentIds, explainLikeBeginner } = AskSchema.parse(req.body);
    const userId = req.user!.userId;

    // 1. Get or create chat session
    let currentChatId = chatId;
    if (!currentChatId) {
      const chat = await createChat(userId, question.slice(0, 80) + '...');
      currentChatId = chat.id;
    }

    // 2. Save the user message
    await saveMessage(currentChatId, 'user', question);

    // 3. Update chat title if this is the first message
    await updateChatTitle(currentChatId, question);

    // 4. Generate embedding for the question
    const questionEmbedding = await createEmbedding(question);

    // 5. Retrieve the most relevant chunks via cosine similarity
    const relevantChunks = await searchSimilarChunks(questionEmbedding, documentIds, 5);

    // 6. Build context string from retrieved chunks
    const context = relevantChunks.length > 0
      ? relevantChunks.map((c) => `[${c.document_name}]: ${c.content}`).join('\n\n')
      : '';

    const isGrounded = relevantChunks.length > 0;

    // 7. Generate answer using OpenAI with context
    const answer = await generateAnswer(context, question, explainLikeBeginner);

    // 8. Prepare source metadata for transparency (source highlighting)
    const sources = toMessageSources(relevantChunks);

    // 9. Save assistant message with sources
    const assistantMessage = await saveMessage(currentChatId, 'assistant', answer, sources);

    res.json({
      chatId: currentChatId,
      answer,
      sources,
      isGrounded, // false means fallback to general AI knowledge
      message: assistantMessage,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/chats — List all chats for current user */
export async function listChats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const chats = await getUserChats(userId);
    res.json({ chats });
  } catch (err) {
    next(err);
  }
}

/** GET /api/chats/:id — Get messages in a specific chat */
export async function getChatHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify chat belongs to this user
    const chatResult = await pool.query(
      `SELECT * FROM chats WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (chatResult.rows.length === 0) {
      throw createError('Chat not found', 404);
    }

    const messages = await getChatMessages(id);
    res.json({ chat: chatResult.rows[0], messages });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/chats/:id — Delete a chat and all its messages */
export async function deleteChat(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await pool.query(
      `DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      throw createError('Chat not found', 404);
    }
    res.json({ message: 'Chat deleted' });
  } catch (err) {
    next(err);
  }
}
