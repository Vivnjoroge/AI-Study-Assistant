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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0f0f1a]/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-white/10 p-0.5 group-hover:border-violet-500/40 transition-colors">
            <img src="/logo.png" alt="study ai logo" className="h-full w-full object-cover rounded-md" />
          </div>
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent tracking-tight">
            study ai
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  location.pathname.startsWith(href)
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-white shadow-sm dark:shadow-none dark:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user && (
            <>
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">{user.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
