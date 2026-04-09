'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// Root page — redirect based on auth state
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/auth');
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
    </div>
  );
}
