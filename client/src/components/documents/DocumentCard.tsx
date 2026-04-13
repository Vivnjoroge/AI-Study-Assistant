import { useNavigate } from 'react-router-dom';
import { Document } from '@/lib/types';
import { FileText, Trash2, MessageSquare, BookOpen, HelpCircle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onSummarize: (id: string) => void;
  onQuiz: (id: string) => void;
}

const statusConfig = {
  processing: { 
    icon: Loader2, 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10', 
    label: 'Processing', 
    spin: true,
    borderColor: 'border-amber-500/20'
  },
  ready: { 
    icon: CheckCircle2, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10', 
    label: 'Ready', 
    spin: false,
    borderColor: 'border-emerald-500/20'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-500', 
    bg: 'bg-red-500/10', 
    label: 'Failed', 
    spin: false,
    borderColor: 'border-red-500/20'
  },
};

export default function DocumentCard({ document, onDelete, onSummarize, onQuiz }: DocumentCardProps) {
  const navigate = useNavigate();
  const cfg = statusConfig[document.status];
  const StatusIcon = cfg.icon;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`group relative flex flex-col gap-5 rounded-[2rem] p-6 premium-card hover:shadow-2xl hover:shadow-violet-500/5 hover:-translate-y-1 ${document.status === 'processing' ? 'animate-pulse-subtle' : ''}`}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-500/[0.02] to-indigo-500/[0.02] pointer-events-none" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 group-hover:scale-110 transition-transform">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900 dark:text-white text-base leading-tight" title={document.file_name}>
              {document.file_name}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-slate-500 uppercase tracking-widest">
              <Clock className="h-3 w-3" />
              {formatDate(document.created_at)}
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(document.id)}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500"
          title="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Status & Stats */}
      <div className="relative flex items-center justify-between">
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.borderColor}`}>
          <StatusIcon className={`h-3 w-3 ${cfg.spin ? 'animate-spin' : ''}`} />
          {cfg.label}
        </div>
        
        {document.status === 'ready' && (
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>{document.page_count} Pages</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/20" />
            <span>{document.chunk_count} Chunks</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="relative grid grid-cols-3 gap-2">
        <button
          id={`chat-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => navigate(`/chat?docId=${document.id}`)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-violet-500/5 dark:bg-violet-400/10 py-3 text-[11px] font-bold text-violet-600 dark:text-violet-400 transition-all hover:bg-violet-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed group/btn shadow-sm"
        >
          <MessageSquare className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          Ask AI
        </button>
        <button
          id={`summarize-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => onSummarize(document.id)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-indigo-500/5 dark:bg-indigo-400/10 py-3 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed group/btn shadow-sm"
        >
          <BookOpen className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          Summary
        </button>
        <button
          id={`quiz-doc-${document.id}`}
          disabled={document.status !== 'ready'}
          onClick={() => onQuiz(document.id)}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-500/5 dark:bg-emerald-400/10 py-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed group/btn shadow-sm"
        >
          <HelpCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          Quiz
        </button>
      </div>
    </div>
  );
}
