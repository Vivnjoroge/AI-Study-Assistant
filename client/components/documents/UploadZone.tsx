'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useDocuments } from '@/hooks/useDocuments';
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function UploadZone() {
  const router = useRouter();
  const { pollDocument } = useDocuments();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');
  const [docId, setDocId] = useState('');

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
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const document = res.data.document;
      setDocId(document.id);
      setStatus('processing');

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
      setStatus('error');
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Drop Zone */}
      {status === 'idle' || status === 'error' ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              dragging
                ? 'border-violet-400 bg-violet-500/10'
                : 'border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5'
            }`}
          >
            <input
              id="file-upload-input"
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${dragging ? 'bg-violet-500/20' : 'bg-white/5 group-hover:bg-violet-500/10'}`}>
              <UploadCloud className={`h-8 w-8 transition-all ${dragging ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-400'}`} />
            </div>
            <p className="text-lg font-semibold text-white">Drop your PDF here</p>
            <p className="mt-1 text-sm text-slate-400">or click to browse files</p>
            <p className="mt-3 text-xs text-slate-500">PDF only • Max 50MB</p>
          </div>

          {/* Selected File Preview */}
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <FileText className="h-8 w-8 flex-shrink-0 text-violet-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                id="remove-file-btn"
                onClick={() => setFile(null)}
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
          )}

          <button
            id="upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <UploadCloud className="h-5 w-5" />
            Upload & Process PDF
          </button>
        </>
      ) : (
        /* Status Card */
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          {status === 'uploading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-violet-400" />
              <p className="text-lg font-semibold text-white">Uploading...</p>
              <p className="text-sm text-slate-400">Sending your PDF to the server</p>
            </>
          )}
          {status === 'processing' && (
            <>
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-violet-600/20 border-t-violet-500 animate-spin" />
              </div>
              <p className="text-lg font-semibold text-white">Processing Document</p>
              <p className="text-sm text-slate-400">Extracting text, generating embeddings…</p>
              <p className="text-xs text-slate-500">This may take 30–60 seconds for large PDFs</p>
            </>
          )}
          {status === 'done' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <p className="text-lg font-semibold text-white">Document Ready!</p>
              <p className="text-sm text-slate-400">Your document is processed and ready to use</p>
              <div className="flex gap-3 mt-2">
                <button
                  id="go-chat-btn"
                  onClick={() => router.push('/chat')}
                  className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
                >
                  Start Chatting
                </button>
                <button
                  id="upload-another-btn"
                  onClick={() => { setFile(null); setStatus('idle'); setDocId(''); }}
                  className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
