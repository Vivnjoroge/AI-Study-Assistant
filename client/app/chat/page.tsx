'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  SlidersHorizontal
} from 'lucide-react';

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get('docId');

  const { messages, chatId, loading, error, sources, isGrounded, sendMessage, loadChat, resetChat } = useChat();
  const { documents } = useDocuments();

  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(docIdParam ? [docIdParam] : []);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth');
  }, [user, authLoading, router]);

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
    router.push('/chat');
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
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col border-r border-white/10 bg-[#0d0d1a] transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-semibold text-slate-300">Conversations</span>
          <button
            id="new-chat-btn"
            onClick={handleNewChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {loadingChats ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : chats.length === 0 ? (
            <p className="px-2 py-4 text-xs text-slate-500 text-center">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => handleLoadChat(chat.id)}
                className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all ${
                  chatId === chat.id
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1 truncate">{chat.title}</span>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
          <div className="flex-1" />
          <button
            id="toggle-doc-selector"
            onClick={() => setSelectorOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              selectorOpen || selectedDocIds.length > 0
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {selectedDocIds.length > 0 ? `${selectedDocIds.length} doc${selectedDocIds.length !== 1 ? 's' : ''}` : 'Filter docs'}
          </button>
        </div>

        {/* Document Selector Panel */}
        {selectorOpen && (
          <div className="border-b border-white/10 bg-[#0d0d1a]/80 px-4 py-3 animate-fade-in">
            <DocumentSelector
              documents={documents}
              selectedIds={selectedDocIds}
              onChange={setSelectedDocIds}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10">
                <MessageSquare className="h-8 w-8 text-violet-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Start a conversation</p>
                <p className="mt-1 text-sm text-slate-400">
                  Ask anything about your documents
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-w-lg mt-2">
                {[
                  'What are the key concepts in this document?',
                  'Summarize the main findings',
                  'What does this chapter say about X?',
                  'Explain the methodology used',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt, false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-xs text-slate-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, i) => (
                <div key={msg.id} className="animate-fade-in">
                  <ChatBubble
                    message={msg}
                    isGrounded={msg.role === 'assistant' ? isGrounded : true}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                    <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 bg-[#0d0d1a]/80 p-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSend={handleSend} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
