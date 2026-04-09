import { Document } from '@/lib/types';
import { FileText, CheckCircle2 } from 'lucide-react';

interface DocumentSelectorProps {
  documents: Document[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function DocumentSelector({ documents, selectedIds, onChange }: DocumentSelectorProps) {
  const ready = documents.filter((d) => d.status === 'ready');

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => onChange(ready.map((d) => d.id));
  const clearAll = () => onChange([]);

  if (ready.length === 0) {
    return (
      <p className="text-center text-xs text-slate-500 py-2">
        No documents ready. Upload a PDF first.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter by document</p>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            All
          </button>
          <span className="text-slate-600">·</span>
          <button onClick={clearAll} className="text-xs text-slate-500 hover:text-slate-600 dark:text-slate-300 transition-colors">
            None
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ready.map((doc) => {
          const isSelected = selectedIds.includes(doc.id);
          return (
            <button
              key={doc.id}
              id={`select-doc-${doc.id}`}
              onClick={() => toggle(doc.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
                  : 'border-slate-200 dark:border-white/10 bg-white shadow-sm dark:shadow-none dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:border-white/20 hover:text-slate-600 dark:text-slate-300'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <FileText className="h-3 w-3" />
              )}
              <span className="max-w-[120px] truncate">{doc.file_name}</span>
            </button>
          );
        })}
      </div>

      {selectedIds.length === 0 && (
        <p className="text-xs text-slate-500">No filter — searching all your documents</p>
      )}
    </div>
  );
}
