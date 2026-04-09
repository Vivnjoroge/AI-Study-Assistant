'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UploadZone from '@/components/documents/UploadZone';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/15">
          <UploadCloud className="h-7 w-7 text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Upload a Document</h1>
        <p className="mt-2 text-slate-400">
          Upload a PDF and our AI will extract, chunk, and index it for instant Q&A
        </p>

        {/* Info pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {['Text extraction', 'Smart chunking', 'Vector embeddings', 'Instant search'].map((f) => (
            <span key={f} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-400">
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      <UploadZone />
    </div>
  );
}
