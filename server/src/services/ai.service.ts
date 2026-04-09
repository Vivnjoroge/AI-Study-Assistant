import OpenAI from 'openai';
import { MCQQuestion } from '../types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const CHAT_MODEL = 'gpt-4o-mini';

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 * Used for both document chunks and question embeddings.
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Generate a grounded answer using RAG context from relevant document chunks.
 * If explainLikeBeginner is true, the response is simplified for non-experts.
 */
export async function generateAnswer(
  context: string,
  question: string,
  explainLikeBeginner = false
): Promise<string> {
  const systemPrompt = explainLikeBeginner
    ? `You are a helpful tutor explaining concepts to a complete beginner.
Use simple language, analogies, and avoid jargon.
Answer ONLY based on the provided document context.
If the context does not contain enough information, clearly say so and provide general knowledge as a fallback, labeled as "General Knowledge:".`
    : `You are a knowledgeable study assistant.
Answer questions accurately using ONLY the provided document context.
Cite relevant information directly from the context.
If the context does not contain enough information, clearly say so and provide general knowledge as a fallback, labeled as "General Knowledge:".`;

  const userPrompt = `Document Context:
---
${context}
---

Question: ${question}`;

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'No answer generated.';
}

/**
 * Summarize a block of document text into concise bullet points.
 */
export async function summarize(text: string): Promise<string> {
  const truncated = text.slice(0, 12000); // Stay within token limits

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert at summarizing academic and study materials.
Create a clear, structured summary with:
- A brief overview (2-3 sentences)
- Key concepts (bullet points)
- Important details or facts
Format the output in clean markdown.`,
      },
      {
        role: 'user',
        content: `Summarize the following document:\n\n${truncated}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 1024,
  });

  return response.choices[0].message.content || 'No summary generated.';
}

/**
 * Generate 5 multiple-choice questions (MCQs) with 4 options each.
 * Returns structured JSON parsed into MCQQuestion[].
 */
export async function generateQuiz(text: string): Promise<MCQQuestion[]> {
  const truncated = text.slice(0, 10000);

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are an expert quiz creator for educational content.
Generate exactly 5 multiple-choice questions from the provided text.
Return ONLY valid JSON in this exact structure (no markdown, no explanation):
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
}`,
      },
      {
        role: 'user',
        content: `Create a quiz from this content:\n\n${truncated}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content || '{"questions":[]}';
  const parsed = JSON.parse(raw);
  return parsed.questions as MCQQuestion[];
}
