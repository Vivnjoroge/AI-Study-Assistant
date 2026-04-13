import { GoogleGenerativeAI } from '@google/generative-ai';
import { MCQQuestion } from '../types';
import { createError } from '../middleware/errorHandler';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const EMBEDDING_MODEL = 'gemini-embedding-001';
const CHAT_MODEL = 'gemini-flash-latest';

/**
 * Generate a 768-dimensional embedding vector for the given text.
 * Gemini text-embedding-004 defaults to 768 dimensions.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent({
    content: { role: 'user', parts: [{ text }] },
    taskType: 'RETRIEVAL_DOCUMENT',
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}

/**
 * Generate embeddings for multiple strings in a single batch request.
 */
export async function createEmbeddingsBatch(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  
  const result = await model.batchEmbedContents({
    requests: inputs.map((text) => ({
      content: { role: 'user', parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      outputDimensionality: 768,
    } as any)),
  });

  return result.embeddings.map((e) => e.values);
}

/**
 * Generate a grounded answer using RAG context from relevant document chunks.
 */
export async function generateAnswer(
  context: string,
  question: string,
  explainLikeBeginner = false
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });

  const systemPrompt = explainLikeBeginner
    ? `You are a helpful tutor explaining concepts to a complete beginner. Use simple language and analogies. Answer ONLY based on the provided context.`
    : `You are a knowledgeable study assistant. Answer questions accurately using ONLY the provided document context.`;

  const prompt = `${systemPrompt}\n\nContext:\n${context}\n\nQuestion: ${question}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err: any) {
    if (err.message?.includes('429')) {
      throw createError('AI rate limit exceeded. Please wait a minute and try again.', 429);
    }
    throw err;
  }
}

/**
 * Summarize a block of document text into concise bullet points.
 */
export async function summarize(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  const truncated = text.slice(0, 30000); // Gemini handles larger contexts

  const prompt = `Summarize the following document accurately in markdown format with a brief overview and key bullet points:\n\n${truncated}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err: any) {
    if (err.message?.includes('429')) {
      throw createError('AI rate limit exceeded. Please wait a minute and try again.', 429);
    }
    throw err;
  }
}

/**
 * Generate 5 multiple-choice questions (MCQs) with 4 options each.
 */
export async function generateQuiz(text: string): Promise<MCQQuestion[]> {
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    generationConfig: { responseMimeType: 'application/json' },
  });
  
  const truncated = text.slice(0, 30000);

  const prompt = `Generate exactly 5 multiple-choice questions from the provided text. 
Return ONLY valid JSON in this structure:
{
  "questions": [
    {
      "question": "...",
      "options": [
        { "label": "A", "text": "..." },
        { "label": "B", "text": "..." },
        { "label": "C", "text": "..." },
        { "label": "D", "text": "..." }
      ],
      "correct_answer": "A",
      "explanation": "..."
    }
  ]
}

Text:\n${truncated}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text();
    
    // Robust extraction: find the first { and last }
    const jsonStart = raw.indexOf('{');
    const jsonEnd = raw.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      throw createError('AI returned invalid JSON structure', 500);
    }
    
    const jsonString = raw.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonString);
    return parsed.questions as MCQQuestion[];
  } catch (err: any) {
    if (err.message?.includes('429')) {
      throw createError('AI rate limit exceeded. Please wait a minute and try again.', 429);
    }
    throw err;
  }
}
