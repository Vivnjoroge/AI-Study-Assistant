import { Request, Response, NextFunction } from 'express';
import pool from '../db/pool';
import { summarize } from '../services/ai.service';
import { getDocumentText } from '../services/document.service';
import { createError } from '../middleware/errorHandler';

/** GET /api/summarize/:documentId */
export async function summarizeDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { documentId } = req.params;
    const userId = req.user!.userId;

    // Confirm the document belongs to this user and is ready
    const docResult = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );
    if (docResult.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    const doc = docResult.rows[0];
    if (doc.status !== 'ready') {
      throw createError('Document is still being processed', 409);
    }

    // Fetch full document text from chunks
    const text = await getDocumentText(documentId);
    if (!text.trim()) {
      throw createError('Document has no content to summarize', 422);
    }

    const summary = await summarize(text);
    res.json({ documentId, documentName: doc.file_name, summary });
  } catch (err) {
    next(err);
  }
}
