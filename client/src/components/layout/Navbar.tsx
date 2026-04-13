import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { LogOut, UploadCloud, MessageSquare, LayoutDashboard, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload', icon: UploadCloud },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-[#0a0a14]/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a14]">
               <img src="/logo.png" alt="logo" className="h-5 w-5 object-contain grayscale-[0.5] group-hover:grayscale-0 transition-all" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              study<span className="text-violet-500">.ai</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Assistant</span>
          </div>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1.5 rounded-2xl bg-slate-100/50 dark:bg-white/5 p-1 border border-slate-200/50 dark:border-white/5">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = location.pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse-subtle' : ''}`} />
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/50 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-slate-500 dark:text-slate-400"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="hidden lg:flex flex-col items-end leading-none">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
