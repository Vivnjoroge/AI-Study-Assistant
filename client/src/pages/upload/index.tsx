import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UploadZone from '@/components/documents/UploadZone';
import { UploadCloud, Loader2, Sparkles, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth', { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 animate-slide-up">
      <div className="mb-12 text-center relative">
        <div className="absolute inset-x-0 -top-12 flex justify-center opacity-20 blur-3xl pointer-events-none">
           <div className="h-40 w-40 rounded-full bg-violet-600" />
        </div>

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-violet-500/10 border border-violet-500/20 text-violet-500 shadow-2xl shadow-violet-500/10 relative overflow-hidden group">
           <div className="absolute inset-0 bg-violet-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
           <UploadCloud className="h-9 w-9 relative z-10" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight sm:text-5xl">
          Expand your knowledge
        </h1>
        <p className="mt-4 text-base font-medium text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upload your documents to the AI vault. We&apos;ll index them instantly for deep research, lightning-fast Q&A, and smart summarization.
        </p>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { label: 'OCR Extraction', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Semantic Indexing', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Vector Mapping', icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Global Availability', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          ].map((f) => (
            <span key={f.label} className={`flex items-center gap-2 rounded-2xl ${f.bg} px-4 py-2 text-[10px] font-black uppercase tracking-widest ${f.color} border border-transparent hover:border-current transition-colors cursor-default`}>
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
         <div className="absolute inset-0 blur-[100px] bg-violet-600/5 rounded-full" />
         <UploadZone />
      </div>
    </div>
  );
}
