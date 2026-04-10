import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden bg-black/20 shadow-lg shadow-violet-500/25 border border-white/10 p-1">
          <img src="/logo.png" alt="study ai logo" className="h-full w-full object-cover rounded-xl" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">study ai</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Your AI-powered study companion</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white shadow-sm dark:shadow-none dark:bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
        {/* Tab Switch */}
        <div className="mb-6 flex rounded-xl bg-slate-100 dark:bg-black/30 p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                mode === m
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white shadow-sm dark:shadow-none dark:bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none ring-0 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Password</label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white shadow-sm dark:shadow-none dark:bg-white/5 px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none ring-0 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:opacity-90 hover:shadow-violet-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
