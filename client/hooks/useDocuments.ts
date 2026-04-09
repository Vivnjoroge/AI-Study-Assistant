'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Document } from '@/lib/types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      setDocuments(res.data.documents);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = async (id: string) => {
    await api.delete(`/documents/${id}`);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Poll a specific document until it's ready (for post-upload status updates)
  const pollDocument = useCallback(async (id: string, onReady: (doc: Document) => void) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/documents/${id}`);
        const doc: Document = res.data.document;
        setDocuments((prev) => prev.map((d) => (d.id === id ? doc : d)));
        if (doc.status === 'ready' || doc.status === 'error') {
          clearInterval(interval);
          onReady(doc);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  }, []);

  return { documents, loading, error, fetchDocuments, deleteDocument, pollDocument };
}
