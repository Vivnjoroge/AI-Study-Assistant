import { Document } from '@/lib/types';
import { FileText, CheckCircle2, LayoutGrid, X } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-slate-100/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10">
        <FileText className="h-5 w-5 text-slate-400 mb-2" />
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          No indexed material found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
           <LayoutGrid className="h-3 w-3 text-violet-500" />
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Knowledge Scope</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={selectAll} 
            className="text-[10px] font-black text-violet-500 hover:text-violet-400 uppercase tracking-widest transition-all"
          >
            Select All
          </button>
          <div className="h-3 w-[1px] bg-slate-200 dark:bg-white/10" />
          <button 
            onClick={clearAll} 
            className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {ready.map((doc) => {
          const isSelected = selectedIds.includes(doc.id);
          return (
            <button
              key={doc.id}
              id={`select-doc-${doc.id}`}
              onClick={() => toggle(doc.id)}
              className={`group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-bold transition-all duration-300 ${
                isSelected
                  ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:border-violet-500/30 hover:bg-violet-500/5'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                {isSelected ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <FileText className="h-3 w-3" />
                )}
              </div>
              <span className="max-w-[150px] truncate">{doc.file_name}</span>
              {isSelected && (
                <div onClick={(e) => { e.stopPropagation(); toggle(doc.id); }} className="ml-1 hover:text-white/80 transition-colors">
                   <X className="h-3 w-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-1">
         <div className={`h-1.5 w-1.5 rounded-full ${selectedIds.length > 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
         <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
           {selectedIds.length === 0 
             ? 'Broad Search: Analyzing all available documents in your library' 
             : `Focused Analysis: Querying ${selectedIds.length} specific document${selectedIds.length > 1 ? 's' : ''}`
           }
         </p>
      </div>
    </div>
  );
}
