'use client';

import { useState } from 'react';
import { MessageSource } from '@/lib/types';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SourceHighlightProps {
  sources: MessageSource[];
}

export default function SourceHighlight({ sources }: SourceHighlightProps) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  // Deduplicate sources by chunk_id
  const unique = sources.filter((s, i, arr) => arr.findIndex((x) => x.chunk_id === s.chunk_id) === i);

  return (
    <div className="w-full">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-300 transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        <span>{unique.length} source{unique.length !== 1 ? 's' : ''} used</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {unique.map((source) => (
            <div
              key={source.chunk_id}
              className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3"
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span className="text-xs font-medium text-violet-300 truncate">
                  {source.document_name}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                {source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
