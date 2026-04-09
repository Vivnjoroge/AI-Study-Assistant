-- AI Study Assistant Database Schema
-- Requires PostgreSQL with pgvector extension

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table: tracks uploaded PDF files
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  page_count INTEGER DEFAULT 0,
  chunk_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing', -- processing | ready | error
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document chunks: stores text segments with their vector embeddings
-- embedding is a 1536-dimensional vector (OpenAI text-embedding-ada-002)
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an IVFFlat index on embeddings for faster similarity search
-- This significantly speeds up cosine similarity queries
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Chats table: represents a conversation session
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table: individual messages within a chat
-- sources: JSONB array of { content, document_name, document_id, chunk_id }
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
