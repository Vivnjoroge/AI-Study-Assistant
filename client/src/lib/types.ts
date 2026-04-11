// Shared frontend TypeScript types (mirrors server types)

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  page_count: number;
  chunk_count: number;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
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
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MCQOption {
  label: string;
  text: string;
}

export interface MCQQuestion {
  question: string;
  options: MCQOption[];
  correct_answer: string;
  explanation: string;
}

export interface AskResponse {
  chatId: string;
  answer: string;
  sources: MessageSource[];
  isGrounded: boolean;
  message: Message;
}
