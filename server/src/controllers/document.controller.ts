import { Request, Response, NextFunction } from 'express';
import path from 'path';
import pool from '../db/pool';
import { processDocument } from '../services/document.service';
import { createError } from '../middleware/errorHandler';

/** POST /api/upload — Upload and process a PDF */
export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    const userId = req.user!.userId;
    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`;

    // Create document record first (status: processing)
    const result = await pool.query(
      `INSERT INTO documents (user_id, file_name, file_url, status)
       VALUES ($1, $2, $3, 'processing') RETURNING *`,
      [userId, file.originalname, fileUrl]
    );
    const document = result.rows[0];

    // Process asynchronously (don't block the response)
    // The frontend can poll for status
    processDocument(file.path, document.id).catch((err) =>
      console.error('Background processing failed:', err)
    );

    res.status(202).json({
      message: 'File uploaded and processing started',
      document,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/documents — List all documents for the authenticated user */
export async function listDocuments(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ documents: result.rows });
  } catch (err) {
    next(err);
  }
}

/** GET /api/documents/:id — Get a single document */
export async function getDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await pool.query(
      `SELECT * FROM documents WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    res.json({ document: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/documents/:id — Delete a document and its chunks */
export async function deleteDocument(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await pool.query(
      `DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      throw createError('Document not found', 404);
    }
    res.json({ message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
}
