'use client';

import { useRouter } from 'next/navigation';
import { Document } from '@/lib/types';
import { FileText, Trash2, MessageSquare, BookOpen, HelpCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onSummarize: (id: string) => void;
  onQuiz: (id: string) => void;
}

const statusConfig = {
  processing: { icon: Loader2, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Processing', spin: true },
  ready: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Ready', spin: false },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Error', spin: false },
};

export default function DocumentCard({ document, onDelete, onSummarize, onQuiz }: DocumentCardProps) {
  const router = useRouter();
  const cfg = statusConfig[document.status];
  const StatusIcon = cfg.icon;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-violet-500/30 hover:bg-white/[0.07]">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
          <FileText className="h-5 w-5 text-violet-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white text-sm" title={document.file_name}>
            {document.file_name}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            {formatDate(document.created_at)}
          </div>
        </div>
        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className={`h-3 w-3 ${cfg.spin ? 'animate-spin' : ''}`} />
          {cfg.label}
        </div>
      </div>

      {/* Stats */}
      {document.status === 'ready' && (
        <div className="flex gap-4 text-xs text-slate-400">
          <span>{document.page_count} pages</span>
          <span>•</span>
          <span>{document.chunk_count} chunks indexed</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          id={`chat-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => router.push(`/chat?docId=${document.id}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-violet-600/20 px-3 py-2 text-xs font-medium text-violet-300 transition-all hover:bg-violet-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Ask
        </button>
        <button
          id={`summarize-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => onSummarize(document.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-2 text-xs font-medium text-indigo-300 transition-all hover:bg-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Summarize
        </button>
        <button
          id={`quiz-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => onQuiz(document.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 px-3 py-2 text-xs font-medium text-emerald-300 transition-all hover:bg-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Quiz
        </button>
        <button
          id={`delete-doc-${document.id}`}
          onClick={() => onDelete(document.id)}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
