import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useDocuments } from '@/hooks/useDocuments';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2, File, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function UploadZone() {
  const navigate = useNavigate();
  const { pollDocument } = useDocuments();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === 'application/pdf') {
      setFile(dropped);
      setError('');
    } else {
      setError('Only PDF files are supported.');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const document = res.data.document;
      setStatus('processing');
      setUploading(false);

      // Poll until document is ready
      pollDocument(document.id, (doc) => {
        if (doc.status === 'ready') {
          setStatus('done');
        } else {
          setStatus('error');
          setError('Processing failed. Please try again.');
        }
      });
    } catch (err: any) {
      setUploading(false);
      setStatus('error');
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 h-full">
      {/* Drop Zone */}
      {status === 'idle' || status === 'error' ? (
        <div className="animate-scale-in">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed p-16 text-center transition-all duration-500 cursor-pointer ${
              dragging
                ? 'border-violet-500 bg-violet-500/10 scale-[1.02] shadow-2xl shadow-violet-500/10'
                : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/[0.02] hover:shadow-xl hover:shadow-violet-500/5'
            }`}
          >
            <input
              id="file-upload-input"
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileSelect}
            />
            
            <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] transition-all duration-500 ${dragging ? 'bg-violet-500 text-white rotate-12' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-500 group-hover:-rotate-6'}`}>
              <UploadCloud className={`h-12 w-12 transition-transform duration-500 ${dragging ? 'scale-110' : ''}`} />
            </div>

            <div className="space-y-2">
               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                 {dragging ? 'Ready to Drop' : 'Select Research PDF'}
               </p>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                 Drag & Drop or <span className="text-violet-500 font-bold underline">click to browse</span>
               </p>
            </div>

            <div className="mt-8 flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               <span className="flex items-center gap-1.5"><File className="h-3 w-3" /> PDF ONLY</span>
               <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
               <span className="flex items-center gap-1.5">MAX 50MB</span>
            </div>
          </div>

          {/* Selected File Preview Component */}
          {file && (
            <div className="mt-8 animate-slide-up">
              <div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-violet-600/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                   <FileText className="h-7 w-7" />
                </div>
                
                <div className="min-w-0 flex-1 relative z-10">
                  <p className="truncate text-base font-bold text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-xs font-black text-violet-500 uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB PDF Document</p>
                </div>

                <button
                  id="remove-file-btn"
                  onClick={() => setFile(null)}
                  className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-red-500 hover:text-white transition-all transform hover:rotate-90"
                  title="Remove file"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <button
                id="upload-btn"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-6 rounded-[1.5rem] premium-gradient py-5 font-black text-white text-base shadow-2xl transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 disabled:grayscale disabled:opacity-40 flex items-center justify-center gap-3"
              >
                <Sparkles className="h-5 w-5" />
                Start AI Indexing
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm font-bold text-red-500 flex items-center gap-3 animate-shake">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Status Card Redesign */
        <div className="flex flex-col items-center justify-center gap-8 rounded-[3.5rem] border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] p-16 text-center shadow-2xl animate-scale-in">
          {status === 'uploading' && (
            <div className="space-y-6">
              <div className="relative flex justify-center">
                 <div className="absolute inset-0 blur-2xl bg-violet-500/30 rounded-full animate-pulse" />
                 <Loader2 className="h-20 w-20 animate-spin text-violet-500 relative z-10" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Syncing Document...</h2>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Securely transmitting to our AI processing nodes.</p>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="space-y-8 w-full max-w-sm">
              <div className="relative flex justify-center py-4">
                 <div className="flex gap-2 items-end">
                    <div className="h-4 w-4 rounded-full bg-violet-600 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-6 w-6 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-8 w-8 rounded-full bg-indigo-500 animate-bounce" />
                    <div className="h-6 w-6 rounded-full bg-violet-500 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-4 w-4 rounded-full bg-violet-600 animate-bounce [animation-delay:-0.3s]" />
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Intelligent Analysis</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Extracting • Chunking • Mapping</p>
                 </div>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Our RAG engine is currently building a semantic multidimensional model of your document.</p>
                 <div className="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-progress-indeterminate" />
                 </div>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="space-y-8 flex flex-col items-center">
              <div className="relative">
                 <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full animate-pulse" />
                 <div className="h-24 w-24 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-500 relative z-10 animate-bounce-subtle">
                    <CheckCircle2 className="h-12 w-12" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Index Complete</h2>
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Your knowledge base has been updated. AI is ready to discuss this material.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full px-4">
                <button
                  id="go-chat-btn"
                  onClick={() => navigate('/chat')}
                  className="flex-1 rounded-[1.25rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Enter Chat <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="upload-another-btn"
                  onClick={() => { setFile(null); setStatus('idle'); }}
                  className="flex-1 rounded-[1.25rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 px-8 py-4 text-sm font-black uppercase tracking-widest hover:border-violet-500/30 hover:text-violet-500 transition-all"
                >
                  New Document
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
