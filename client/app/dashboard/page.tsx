'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/documents/DocumentCard';
import api from '@/lib/api';
import { UploadCloud, FileText, Loader2, Plus, BookOpen, HelpCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import QuizCard from '@/components/quiz/QuizCard';
import { MCQQuestion } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { documents, loading, fetchDocuments, deleteDocument, pollDocument } = useDocuments();

  // Modal states
  const [summaryModal, setSummaryModal] = useState<{ open: boolean; content: string; title: string } | null>(null);
  const [quizModal, setQuizModal] = useState<{ open: boolean; questions: MCQQuestion[]; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth');
  }, [user, authLoading, router]);

  const handleSummarize = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    setActionLoading(id + '-summarize');
    try {
      const res = await api.get(`/summarize/${id}`);
      setSummaryModal({ open: true, content: res.data.summary, title: doc?.file_name || 'Summary' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuiz = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    setActionLoading(id + '-quiz');
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuizModal({ open: true, questions: res.data.questions, title: doc?.file_name || 'Quiz' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  const readyCount = documents.filter((d) => d.status === 'ready').length;
  const processingCount = documents.filter((d) => d.status === 'processing').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="mt-1 text-slate-400">
            {documents.length === 0
              ? 'Upload your first PDF to get started'
              : `${readyCount} document${readyCount !== 1 ? 's' : ''} ready · ${documents.length} total`}
          </p>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-500 self-start"
        >
          <Plus className="h-4 w-4" />
          Upload PDF
        </Link>
      </div>

      {/* Stats Row */}
      {documents.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Documents', value: documents.length, color: 'text-white' },
            { label: 'Ready', value: readyCount, color: 'text-emerald-400' },
            { label: 'Processing', value: processingCount, color: 'text-amber-400' },
            { label: 'Total Chunks', value: documents.reduce((a, d) => a + (d.chunk_count || 0), 0), color: 'text-violet-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-white/10 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10">
            <FileText className="h-8 w-8 text-violet-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">No documents yet</p>
            <p className="mt-1 text-sm text-slate-400">Upload a PDF to start studying with AI</p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-all"
          >
            <UploadCloud className="h-4 w-4" />
            Upload your first PDF
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onDelete={deleteDocument}
              onSummarize={handleSummarize}
              onQuiz={handleQuiz}
            />
          ))}
        </div>
      )}

      {/* Summary Modal */}
      {summaryModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#13131f] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-violet-400" />
                <h2 className="font-semibold text-white truncate max-w-xs">{summaryModal.title}</h2>
              </div>
              <button onClick={() => setSummaryModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              <ReactMarkdown>{summaryModal.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#13131f] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-violet-400" />
                <h2 className="font-semibold text-white truncate max-w-xs">Quiz: {quizModal.title}</h2>
              </div>
              <button onClick={() => setQuizModal(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {quizModal.questions.map((q, i) => (
                <QuizCard key={i} question={q} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
