'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, LogOut, UploadCloud, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload', icon: UploadCloud },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f0f1a]/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            StudyAI
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  pathname.startsWith(href)
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* User Actions */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
