import ReactMarkdown from 'react-markdown';
import { Message } from '@/lib/types';
import { Bot, User, AlertTriangle, Sparkles } from 'lucide-react';
import SourceHighlight from './SourceHighlight';

interface ChatBubbleProps {
  message: Message;
  isGrounded?: boolean;
}

export default function ChatBubble({ message, isGrounded = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex flex-col items-center gap-2">
         <div
           className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-110 ${
             isUser 
               ? 'bg-violet-600 text-white shadow-violet-500/20' 
               : 'bg-white dark:bg-[#13131f] border border-slate-200 dark:border-white/10 text-violet-500 shadow-slate-200/50 dark:shadow-none'
           }`}
         >
           {isUser ? (
             <User className="h-5 w-5" />
           ) : (
             <Bot className="h-5 w-5" />
           )}
         </div>
      </div>

      {/* Bubble Container */}
      <div className={`flex max-w-[85%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role label */}
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
           {isUser ? 'Me' : 'Assistant'}
        </span>

        {/* Bubble */}
        <div
          className={`rounded-3xl px-6 py-4 text-sm leading-relaxed shadow-sm transition-all duration-300 ${
            isUser
              ? 'bg-violet-600 text-white rounded-tr-sm premium-gradient'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-200 rounded-tl-sm backdrop-blur-md'
          }`}
        >
          {isUser ? (
            <p className="font-medium">{message.content}</p>
          ) : (
            <div className="prose prose-slate dark:prose-invert prose-sm max-w-none 
              prose-p:leading-relaxed prose-p:my-2
              prose-headings:font-black prose-headings:tracking-tight
              prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline
              prose-code:text-violet-500 dark:prose-code:text-violet-400 prose-code:bg-violet-500/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-900/50 dark:prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-2xl
            ">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata & Enhancements */}
        {!isUser && (
           <div className="flex flex-col gap-3 mt-1 px-1">
              {!isGrounded && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
                  <AlertTriangle className="h-3 w-3" />
                  Grounded Check: Partial Fallback
                </div>
              )}

              {message.sources && message.sources.length > 0 && (
                <div className="space-y-2">
                   <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <Sparkles className="h-3 w-3" />
                      Verification Sources
                   </div>
                   <SourceHighlight sources={message.sources} />
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
