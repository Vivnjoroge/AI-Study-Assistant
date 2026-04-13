import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import DocumentCard from '@/components/documents/DocumentCard';
import { DocumentSkeleton, StatsSkeleton } from '@/components/ui/SkeletonCards';
import api from '@/lib/api';
import { UploadCloud, FileText, Loader2, Plus, BookOpen, HelpCircle, X, Sparkles, LayoutGrid } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import QuizCard from '@/components/quiz/QuizCard';
import { MCQQuestion } from '@/lib/types';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { documents, loading, deleteDocument } = useDocuments();

  // Modal states
  const [summaryModal, setSummaryModal] = useState<{ open: boolean; content: string; title: string } | null>(null);
  const [quizModal, setQuizModal] = useState<{ open: boolean; questions: MCQQuestion[]; title: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  const handleSummarize = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    try {
      const res = await api.get(`/summarize/${id}`);
      setSummaryModal({ open: true, content: res.data.summary, title: doc?.file_name || 'Summary' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate summary');
    }
  };

  const handleQuiz = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    try {
      const res = await api.get(`/quiz/${id}`);
      setQuizModal({ open: true, questions: res.data.questions, title: doc?.file_name || 'Quiz' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate quiz');
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  const readyCount = documents.filter((d) => d.status === 'ready').length;
  const processingCount = documents.filter((d) => d.status === 'processing').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 animate-slide-up">
      {/* Header Section */}
      <div className="relative mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-violet-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            Learning Dashboard
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500 font-black">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="max-w-xl text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {documents.length === 0
              ? 'Start by uploading your learning materials to unlock AI-powered insights.'
              : `You have ${readyCount} fully indexed documents ready for intense study sessions.`}
          </p>
        </div>
        
        <Link
          to="/upload"
          className="group relative flex items-center justify-center gap-2.5 rounded-[1.25rem] bg-violet-600 px-8 py-4 text-sm font-bold text-white premium-gradient transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 sm:w-auto"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          Upload New Document
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => <StatsSkeleton key={i} />)
        ) : (
          [
            { label: 'Total Library', value: documents.length, icon: LayoutGrid, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Indexed & Ready', value: readyCount, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'AI Processing', value: processingCount, icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Global Chunks', value: documents.reduce((a, d) => a + (d.chunk_count || 0), 0), icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="group p-6 premium-card rounded-[2rem] hover:bg-white dark:hover:bg-white/[0.05]">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color} mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${label === 'AI Processing' && value > 0 ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1.5">{label}</p>
            </div>
          ))
        )}
      </div>

      {/* Document Grid */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recent Materials
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            </h2>
         </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[1, 2, 3].map((i) => <DocumentSkeleton key={i} />)}
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10 py-32 text-center bg-white/50 dark:bg-transparent">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-violet-600/10 text-violet-400">
              <FileText className="h-10 w-10 text-violet-500" />
            </div>
            <div className="max-w-xs">
              <p className="text-xl font-bold text-slate-900 dark:text-white">Your library is empty</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Upload a study material today and let AI help you reach your goals faster.</p>
            </div>
            <Link
              to="/upload"
              className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-violet-500 transition-all premium-gradient"
            >
              <UploadCloud className="h-5 w-5" />
              Upload PDF
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {/* Summary Modal */}
      {summaryModal?.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-scale-in">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-[#13131f] shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#13131f] z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                   <BookOpen className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white truncate max-w-[250px] sm:max-w-md">{summaryModal.title}</h2>
                   <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mt-1">AI Generated Summary</p>
                </div>
              </div>
              <button 
                onClick={() => setSummaryModal(null)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white transition-colors"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 prose prose-invert prose-violet max-w-none text-slate-300">
              <ReactMarkdown>{summaryModal.content}</ReactMarkdown>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-white/5 text-center">
               <button 
                 onClick={() => setSummaryModal(null)}
                 className="px-8 py-3 rounded-xl bg-violet-600 font-bold text-white premium-gradient"
               >
                 Done Reading
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizModal?.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-scale-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-white dark:bg-[#13131f] shadow-2xl flex flex-col">
            <div className="p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#13131f] z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                   <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white truncate max-w-[250px] sm:max-w-md">{quizModal.title}</h2>
                   <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">AI Practice Quiz</p>
                </div>
              </div>
              <button 
                onClick={() => setQuizModal(null)} 
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              {quizModal.questions.map((q, i) => (
                <QuizCard key={i} question={q} index={i} />
              ))}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-white/5 flex justify-center">
               <button 
                 onClick={() => setQuizModal(null)}
                 className="px-8 py-3 rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/20"
               >
                 Finish Quiz
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
