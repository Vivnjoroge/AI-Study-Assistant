import pool from '../db/pool';
import { Chat, Message, MessageSource } from '../types';

/** Create a new chat session for a user */
export async function createChat(userId: string, title = 'New Chat'): Promise<Chat> {
  const result = await pool.query(
    `INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *`,
    [userId, title]
  );
  return result.rows[0];
}

/** Save a message (user or assistant) to a chat */
export async function saveMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
  sources: MessageSource[] = []
): Promise<Message> {
  const result = await pool.query(
    `INSERT INTO messages (chat_id, role, content, sources) VALUES ($1, $2, $3, $4) RETURNING *`,
    [chatId, role, content, JSON.stringify(sources)]
  );
  return result.rows[0];
}

/** Get all messages in a chat ordered by time */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  const result = await pool.query(
    `SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`,
    [chatId]
  );
  return result.rows;
}

/** List all chats for a user, most recent first */
export async function getUserChats(userId: string): Promise<Chat[]> {
  const result = await pool.query(
    `SELECT * FROM chats WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows;
}

/** Update the chat title (e.g., using the first user message) */
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  await pool.query(
    `UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2`,
    [title.slice(0, 100), chatId]
  );
}
