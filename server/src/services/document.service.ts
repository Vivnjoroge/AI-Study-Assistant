import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import pool from '../db/pool';
import { createEmbedding, createEmbeddingsBatch } from './ai.service';
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
    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    // BREAK CONDITION: If we reached the end of the text, stop here.
    if (end >= normalized.length) break;

    // Advance start, ensuring we always progress forward
    start = end - CHUNK_OVERLAP;
    
    // Safety: If for some reason start didn't move forward (e.g. overlap >= length),
    // force it to move to prevent infinite loop.
    if (start < 0) start = end;
  }

  return chunks;
}

/**
 * Full RAG pipeline: extract text → chunk → embed → store.
 * Updates the document status on completion or failure.
 */
export async function processDocument(filePath: string, documentId: string): Promise<void> {
  const client = await pool.connect();
  console.log(`📂 Starting processing for document: ${documentId}`);

  try {
    // 1. Extract text from PDF
    console.log(`📄 [1/4] Extracting text from PDF...`);
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;
    const pageCount = pdfData.numpages;
    console.log(`✅ Text extracted. Pages: ${pageCount}, Total characters: ${text.length}`);

    // 2. Split into chunks
    console.log(`✂️ [2/4] Chunking text...`);
    const chunks = chunkText(text);
    console.log(`✅ Chunking complete. Generated ${chunks.length} chunks.`);

    // 3. Generate embeddings and store chunks in a transaction
    console.log(`🧠 [3/4] Generating embeddings & storing (Batching enabled)...`);
    await client.query('BEGIN');

    const BATCH_SIZE = 20; // Process 20 chunks at once
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await createEmbeddingsBatch(batch);

      for (let j = 0; j < batch.length; j++) {
        const chunkIndex = i + j;
        const embedding = batchEmbeddings[j];
        const vectorLiteral = `[${embedding.join(',')}]`;

        await client.query(
          `INSERT INTO document_chunks (document_id, content, chunk_index, embedding)
           VALUES ($1, $2, $3, $4::vector)`,
          [documentId, batch[j], chunkIndex, vectorLiteral]
        );
      }
      
      if (i % (BATCH_SIZE * 5) === 0 || i + BATCH_SIZE >= chunks.length) {
        console.log(`   ⏳ Progress: ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks...`);
      }
    }

    // 4. Mark document as ready
    console.log(`📝 [4/4] Finishing up...`);
    await client.query(
      `UPDATE documents SET status = 'ready', page_count = $1, chunk_count = $2 WHERE id = $3`,
      [pageCount, chunks.length, documentId]
    );

    await client.query('COMMIT');

    console.log(`✅ Document ${documentId} successfully processed!`);
  } catch (err: any) {
    await client.query('ROLLBACK');
    // Mark document as failed
    await pool.query(`UPDATE documents SET status = 'error' WHERE id = $1`, [documentId]);
    
    // Detailed error logging to file for debugging
    const errorLog = `[${new Date().toISOString()}] ❌ Failed to process document ${documentId}:
Error: ${err.message}
Stack: ${err.stack}\n\n`;
    
    fs.appendFileSync(path.join(process.cwd(), 'error.log'), errorLog);
    console.error(`❌ Failed to process document ${documentId}:`, err.message);
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
