'use client';

import { useEffect, useState } from 'react';
import { Menu, Sun, Moon, Bell, Search, Command } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import SearchPalette from '@/components/search-palette';
import { useLang } from '@/lib/language-context';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}

      <header className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl px-3 py-2 w-56 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300/60 dark:hover:border-blue-700/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all group text-left"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
            <span className="flex-1 text-xs text-slate-400">{t.searchCustomers}</span>
            <kbd className="flex items-center gap-0.5 text-[9px] font-medium text-slate-300 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/60 px-1.5 py-0.5 rounded-md shrink-0">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 h-8 px-2.5 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60"
          >
            {t.langToggle}
          </Button>

          {/* Notification bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 h-8 w-8">
              <Bell className="w-4 h-4" />
            </Button>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
          </div>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 h-8 w-8"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}

          {/* User avatar */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              AR
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">Ahmed Al-Rashid</p>
              <p className="text-[10px] text-slate-400 leading-tight">{t.relationshipManager}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
