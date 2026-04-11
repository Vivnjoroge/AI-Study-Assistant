// Shared TypeScript interfaces for the AI Study Assistant API

export interface User {
  id: string;
  email: string;
  full_name?: string;
  password_hash: string;
  created_at: Date;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  page_count: number;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  created_at: Date;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  embedding?: number[];
  created_at: Date;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface MessageSource {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: MessageSource[];
  created_at: Date;
}

export interface MCQOption {
  label: string; // A, B, C, D
  text: string;
}

export interface MCQQuestion {
  question: string;
  options: MCQOption[];
  correct_answer: string; // The label, e.g. "B"
  explanation: string;
}

// JWT payload embedded in token
export interface JwtPayload {
  userId: string;
  email: string;
}

// Augment Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
