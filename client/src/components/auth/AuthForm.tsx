import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up">
      {/* Logo & Intro */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="relative mb-6">
           <div className="absolute inset-0 blur-2xl bg-violet-500/30 rounded-full animate-pulse-subtle" />
           <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-2xl">
             <div className="flex h-full w-full items-center justify-center rounded-[calc(2rem-1px)] bg-[#0a0a14]">
                <img src="/logo.png" alt="logo" className="h-10 w-10 object-contain" />
             </div>
           </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
           <Sparkles className="h-5 w-5 text-violet-500" />
           <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">study<span className="text-violet-500">.ai</span></h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Your premium AI-powered research assistant</p>
      </div>

      {/* Auth Card */}
      <div className="premium-card rounded-[2.5rem] p-10 glass-panel">
        {/* Tab Switch */}
        <div className="mb-8 flex rounded-2xl bg-slate-100 dark:bg-black/40 p-1.5 border border-slate-200/50 dark:border-white/5">
          {(['login', 'register'] as const).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && <span className="mr-1.5">•</span>}
                {m === 'login' ? 'Sign In' : 'Join Now'}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input
                id="name-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="Enter your name"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] px-5 py-3.5 pr-14 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Security Key</label>
              <input
                id="confirm-password-input"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm font-semibold text-red-500 flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full rounded-[1.25rem] premium-gradient py-4 font-black text-white text-base shadow-xl transition-all hover:-translate-y-0.5 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:brightness-100 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : mode === 'login' ? 'Sign In to Assistant' : 'Initialize Account'}
          </button>
        </form>
      </div>
      
      {/* Footer info */}
      <p className="mt-8 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
}
