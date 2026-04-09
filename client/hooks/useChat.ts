'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Message, MessageSource, Chat } from '@/lib/types';

export function useChat(initialChatId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<MessageSource[]>([]);
  const [isGrounded, setIsGrounded] = useState(true);

  // Load existing chat history
  const loadChat = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/chats/${id}`);
      setMessages(res.data.messages);
      setChatId(id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      question: string,
      documentIds: string[],
      explainLikeBeginner: boolean
    ) => {
      // Optimistically add user message to UI
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId || '',
        role: 'user',
        content: question,
        sources: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await api.post('/ask', {
          question,
          chatId,
          documentIds,
          explainLikeBeginner,
        });

        const { chatId: newChatId, answer, sources: src, isGrounded: grounded, message } = res.data;

        setChatId(newChatId);
        setSources(src);
        setIsGrounded(grounded);

        // Replace temp message with real one, add assistant reply
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
          return [
            ...withoutTemp,
            { ...tempUserMsg, id: `user-${Date.now()}`, chat_id: newChatId },
            message,
          ];
        });

        return newChatId;
      } catch (err: any) {
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setError(err.response?.data?.error || 'Failed to get answer');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [chatId]
  );

  const resetChat = () => {
    setMessages([]);
    setChatId(undefined);
    setSources([]);
    setError(null);
  };

  return { messages, chatId, loading, error, sources, isGrounded, sendMessage, loadChat, resetChat };
}
