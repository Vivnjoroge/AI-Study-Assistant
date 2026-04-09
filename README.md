# AI Study Assistant

A full-stack, production-ready AI-powered study assistant application designed to help students interact with their study materials.

## Features

- **Document Processing**: Upload PDFs to extract text, intelligently chunk, and index for search.
- **RAG Q&A**: Ask questions and get answers grounded directly in your study materials.
- **Chat Memory**: Persistent conversations that remember past context.
- **Source Highlighting**: Transparency on exactly which document segments were used to generate answers.
- **Summarization & Quizzes**: Generate concise summaries and multiple-choice quizzes automatically.
- **"Explain Like I'm a Beginner"**: A toggle to simplify complex explanations.

## Tech Stack

### Frontend (Planned)
- React (Vite)
- TypeScript
- Tailwind CSS

### Backend
- Node.js + Express
- TypeScript
- OpenAI API (`gpt-4o`, `text-embedding-ada-002`)
- pdf-parse, multer, bare-metal authentication

### Database
- Supabase (PostgreSQL + pgvector)

## Project Structure

```
ai-study-assist/
├── client/         # React frontend (Vite)
├── server/         # Express backend
└── README.md       # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase account (for database setup)
- OpenAI API Key

### Backend Setup
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase DB URL and OpenAI keys.
4. Run migrations: `npm run migrate`
5. Start dev server: `npm run dev`

### Frontend Setup
*(Instructions will be provided once the React frontend is fully scaffolded)*
