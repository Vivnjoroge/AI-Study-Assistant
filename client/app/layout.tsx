import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StudyAI — AI-Powered Study Assistant',
  description:
    'Upload your PDFs, ask questions, generate summaries and quizzes using AI. Your intelligent study companion.',
  keywords: ['AI', 'study assistant', 'PDF', 'quiz', 'summary', 'RAG'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a14] text-white antialiased`}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            {/* Ambient glow backgrounds */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
