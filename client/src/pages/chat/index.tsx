import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useDocuments } from '@/hooks/useDocuments';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import DocumentSelector from '@/components/chat/DocumentSelector';
import api from '@/lib/api';
import { Chat } from '@/lib/types';
import {
  Loader2, MessageSquare, Plus, Trash2, ChevronLeft, ChevronRight,
  SlidersHorizontal, Sparkles, Pin
} from 'lucide-react';

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const { messages, chatId, loading, error, isGrounded, sendMessage, loadChat, resetChat } = useChat();
  const { documents } = useDocuments();

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(docIdParam ? [docIdParam] : []);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth', { replace: true });
  }, [user, authLoading, navigate]);

  // Load chat list
  useEffect(() => {
    api.get('/chats')
      .then((res) => setChats(res.data.chats))
      .finally(() => setLoadingChats(false));
  }, [chatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string, eli5: boolean) => {
    await sendMessage(text, selectedDocIds, eli5);
  };

  const handleNewChat = () => {
    resetChat();
    navigate('/chat');
  };

  const handleLoadChat = async (id: string) => {
    await loadChat(id);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/chats/${id}`);
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (chatId === id) resetChat();
  };

  if (authLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-[#0a0a14]">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col border-r border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-[#0a0a14] transition-all duration-300 relative z-20 ${
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
             <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Library History</span>
          </div>
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-110 active:scale-95 transition-all"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5">
          {loadingChats ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : chats.length === 0 ? (
            <div className="px-4 py-12 text-center space-y-3">
               <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                     <MessageSquare className="h-5 w-5 text-slate-400" />
                  </div>
               </div>
               <p className="text-xs font-semibold text-slate-500">No sessions yet</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => handleLoadChat(chat.id)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                  chatId === chat.id
                    ? 'bg-violet-600 text-white shadow-xl shadow-violet-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 border border-transparent hover:border-slate-200/50 dark:hover:border-white/5'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${chatId === chat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
                   <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                   <span className="block truncate text-xs font-bold leading-tight">{chat.title}</span>
                   <span className={`text-[9px] mt-0.5 block font-medium uppercase tracking-wider ${chatId === chat.id ? 'text-white/60' : 'text-slate-400'}`}>Session</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className={`hidden group-hover:flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${chatId === chat.id ? 'hover:bg-white/20 text-white/70' : 'hover:bg-red-500/10 text-slate-400 hover:text-red-500'}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Toggle Button for Mobile/Closed Sidebar */}
      {!sidebarOpen && (
         <button
           onClick={() => setSidebarOpen(true)}
           className="fixed left-4 bottom-4 z-40 h-10 w-10 bg-white dark:bg-[#13131f] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all text-violet-500"
         >
            <ChevronRight className="h-5 w-5" />
         </button>
      )}

      {/* ── Main Chat Area ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-violet-600/[0.03] to-transparent pointer-events-none" />

        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-slate-200/50 dark:border-white/5 px-6 py-4 bg-white/50 dark:bg-[#0a0a14]/50 backdrop-blur-md z-10">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          
          <div className="flex-1 flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/10">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Grounded AI</span>
             </div>
          </div>

          <button
            id="toggle-doc-selector"
            onClick={() => setSelectorOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
              selectorOpen || selectedDocIds.length > 0
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10 hover:border-violet-500/30'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-current opacity-70" />
            {selectedDocIds.length > 0 ? `${selectedDocIds.length} Scope Active` : 'Define Knowledge Scope'}
          </button>
        </div>

        {/* Document Selector Panel */}
        {selectorOpen && (
          <div className="border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#0a0a14]/90 px-6 py-5 animate-slide-down z-10">
            <DocumentSelector
              documents={documents}
              selectedIds={selectedDocIds}
              onChange={setSelectedDocIds}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 relative scroll-smooth CustomScrollbar">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-8 text-center animate-slide-up">
              <div className="relative">
                 <div className="absolute inset-0 blur-2xl bg-violet-600/20 rounded-full" />
                 <div className="relative flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px]">
                    <div className="flex h-full w-full items-center justify-center rounded-[calc(2.5rem-1px)] bg-[#0a0a14]">
                       <MessageSquare className="h-10 w-10 text-violet-500" />
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">How can I assist you today?</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Start a deep analysis session or ask questions about your indexed documents.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-2xl w-full">
                {[
                  'What are the key concepts in this document?',
                  'Summarize the main findings',
                  'What does this chapter say about the core thesis?',
                  'Explain the methodology used here',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt, false)}
                    className="group rounded-2xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.03] p-5 text-left transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/5 hover:-translate-y-1"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Quick Analysis</p>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-8 pb-12">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-fade-in">
                  <ChatBubble
                    message={msg}
                    isGrounded={msg.role === 'assistant' ? isGrounded : true}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 animate-pulse-subtle">
                    <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
                  </div>
                  <div className="rounded-3xl rounded-tl-sm premium-card px-6 py-4">
                    <div className="flex gap-1.5 items-center">
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 animate-slide-up z-30">
            <div className="rounded-[1.25rem] bg-red-500 text-white px-6 py-4 text-sm font-bold shadow-2xl flex items-center justify-between border border-white/20">
               <div className="flex items-center gap-3">
                  <Pin className="h-4 w-4 rotate-45" />
                  {error}
               </div>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="bg-gradient-to-t from-white dark:from-[#0a0a14] via-white/80 dark:via-[#0a0a14]/80 to-transparent p-6 sm:p-10 z-20">
          <div className="mx-auto max-w-4xl">
            <ChatInput onSend={handleSend} loading={loading} />
            <p className="text-center text-[10px] text-slate-500 dark:text-slate-500 mt-4 font-bold uppercase tracking-[0.2em]">
               Powered by Google Gemini 1.5 Flash • RAG Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
