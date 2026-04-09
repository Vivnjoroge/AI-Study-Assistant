'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Loader2, GraduationCap } from 'lucide-react';

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
    <div className="space-y-2">
      {/* ELI5 Toggle */}
      <div className="flex items-center justify-end px-1">
        <button
          id="eli5-toggle"
          onClick={() => setEli5((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
            eli5
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 hover:text-slate-300'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          Explain like I&apos;m a beginner
        </button>
      </div>

      {/* Input Row */}
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-violet-500/50 transition-colors">
        <textarea
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder="Ask a question about your documents…"
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder-slate-500 outline-none scrollbar-thin max-h-32"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <button
          id="send-btn"
          onClick={handleSend}
          disabled={!text.trim() || loading || disabled}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-all hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-slate-600">Enter to send • Shift+Enter for newline</p>
    </div>
  );
}
