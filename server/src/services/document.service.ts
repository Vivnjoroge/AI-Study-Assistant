import fs from 'fs';
import pdfParse from 'pdf-parse';
import pool from '../db/pool';
import { createEmbedding } from './ai.service';
import { DocumentChunk, MessageSource } from '../types';

const CHUNK_SIZE = 800;      // Target characters per chunk
const CHUNK_OVERLAP = 100;   // Overlap between chunks to preserve context

/**
 * Split text into overlapping chunks for better retrieval quality.
 * Uses sentence-boundary awareness to avoid cutting mid-sentence where possible.
 */
export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  // Normalize whitespace
  const normalized = text.replace(/\s+/g, ' ').trim();

  while (start < normalized.length) {
    let end = start + CHUNK_SIZE;

    if (end < normalized.length) {
      // Try to find a sentence boundary to break at
      const boundary = normalized.lastIndexOf('.', end);
      if (boundary > start + CHUNK_SIZE / 2) {
        end = boundary + 1;
      }
    } else {
      end = normalized.length;
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 50) { // Skip very short chunks
      chunks.push(chunk);
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * Full RAG pipeline: extract text → chunk → embed → store.
 * Updates the document status on completion or failure.
 */
export async function processDocument(filePath: string, documentId: string): Promise<void> {
  const client = await pool.connect();

  try {
    // 1. Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const pageCount = pdfData.numpages;

    // 2. Split into chunks
    const chunks = chunkText(text);

    // 3. Generate embeddings and store chunks in a transaction
    await client.query('BEGIN');

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await createEmbedding(chunks[i]);
      // Store embedding as a Postgres vector literal
      const vectorLiteral = `[${embedding.join(',')}]`;

      await client.query(
        `INSERT INTO document_chunks (document_id, content, chunk_index, embedding)
         VALUES ($1, $2, $3, $4::vector)`,
        [documentId, chunks[i], i, vectorLiteral]
      );
    }

    // 4. Mark document as ready
    await client.query(
      `UPDATE documents SET status = 'ready', page_count = $1, chunk_count = $2 WHERE id = $3`,
      [pageCount, chunks.length, documentId]
    );

    await client.query('COMMIT');

    console.log(`✅ Document ${documentId} processed: ${chunks.length} chunks from ${pageCount} pages`);
  } catch (err) {
    await client.query('ROLLBACK');
    // Mark document as failed
    await pool.query(`UPDATE documents SET status = 'error' WHERE id = $1`, [documentId]);
    console.error(`❌ Failed to process document ${documentId}:`, err);
    throw err;
  } finally {
    client.release();
    // Clean up uploaded file after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Vector similarity search: find the top-k most relevant chunks for a question.
 * Uses pgvector cosine similarity (<=> operator, lower = more similar).
 * Optionally filters by specific document IDs.
 */
export async function searchSimilarChunks(
  questionEmbedding: number[],
  documentIds: string[],
  limit = 5
): Promise<(DocumentChunk & { document_name: string; similarity: number })[]> {
  const vectorLiteral = `[${questionEmbedding.join(',')}]`;

  let query: string;
  let params: (string | number)[];

  if (documentIds.length > 0) {
    // Filter by specific documents
    const placeholders = documentIds.map((_, i) => `$${i + 3}`).join(', ');
    query = `
      SELECT
        dc.id, dc.document_id, dc.content, dc.chunk_index, dc.created_at,
        d.file_name AS document_name,
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      WHERE dc.document_id IN (${placeholders})
        AND dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $2
    `;
    params = [vectorLiteral, limit, ...documentIds];
  } else {
    query = `
      SELECT
        dc.id, dc.document_id, dc.content, dc.chunk_index, dc.created_at,
        d.file_name AS document_name,
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $2
    `;
    params = [vectorLiteral, limit];
  }

  const result = await pool.query(query, params);
  return result.rows;
}

/**
 * Get the full concatenated text of a document (from its chunks) for summarization/quiz.
 */
export async function getDocumentText(documentId: string): Promise<string> {
  const result = await pool.query(
    `SELECT content FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC`,
    [documentId]
  );
  return result.rows.map((r) => r.content).join('\n\n');
}

/**
 * Convert raw DB rows into MessageSource objects for response metadata.
 */
export function toMessageSources(
  chunks: (DocumentChunk & { document_name: string })[]
): MessageSource[] {
  return chunks.map((c) => ({
    chunk_id: c.id,
    document_id: c.document_id,
    document_name: c.document_name,
    content: c.content,
  }));
}
