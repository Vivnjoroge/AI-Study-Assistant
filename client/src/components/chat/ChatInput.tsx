import { useState, KeyboardEvent } from 'react';
import { Send, Loader2, GraduationCap, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, explainLikeBeginner: boolean) => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, loading, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [eli5, setEli5] = useState(false);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setText('');
    await onSend(trimmed, eli5);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* ELI5 Toggle & Controls */}
      <div className="flex items-center justify-between px-2">
        <label className="flex items-center gap-2 cursor-pointer group">
           <input 
             type="checkbox" 
             checked={eli5} 
             onChange={() => setEli5(!eli5)} 
             className="sr-only"
           />
           <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
             eli5 
               ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
               : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200/50 dark:border-white/5 hover:border-amber-500/30 hover:text-amber-500'
           }`}>
             <GraduationCap className={`h-3.5 w-3.5 ${eli5 ? 'animate-bounce' : ''}`} />
             {eli5 ? 'Beginner Mode Active' : 'Explain to Beginner'}
           </div>
        </label>
        
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
           <Sparkles className="h-3 w-3" />
           AI Thinking Mode
        </div>
      </div>

      {/* Input Container */}
      <div className="relative group">
         {/* Focus Glow */}
         <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] opacity-0 blur-xl group-focus-within:opacity-20 transition-opacity duration-500" />
         
         <div className="relative flex items-end gap-3 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#13131f]/70 backdrop-blur-xl p-3 shadow-2xl focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all">
            <textarea
              id="chat-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled || loading}
              placeholder="Ask for details, summaries, or citations…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none max-h-48 min-h-[48px]"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={!text.trim() || loading || disabled}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-30 disabled:hover:scale-100 group/btn"
              title="Send Message"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
         </div>
      </div>
      
      <div className="flex items-center justify-center gap-6">
         <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Enter to send
         </p>
         <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
         <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Shift + Enter for newline
         </p>
      </div>
    </div>
  );
}
