import ReactMarkdown from 'react-markdown';
import { Message } from '@/lib/types';
import { Bot, User, AlertTriangle } from 'lucide-react';
import SourceHighlight from './SourceHighlight';

interface ChatBubbleProps {
  message: Message;
  isGrounded?: boolean;
}

export default function ChatBubble({ message, isGrounded = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-violet-600' : 'bg-slate-700'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-violet-600 text-white rounded-tr-sm'
              : 'bg-white shadow-sm dark:shadow-none dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-code:text-violet-300 prose-pre:bg-slate-100 dark:bg-black/30">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Fallback warning badge */}
        {!isUser && !isGrounded && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
            <AlertTriangle className="h-3 w-3" />
            <span>Fallback: answer based on general AI knowledge</span>
          </div>
        )}

        {/* Source highlights */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceHighlight sources={message.sources} />
        )}
      </div>
    </div>
  );
}
