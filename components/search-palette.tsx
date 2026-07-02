'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search, X, LayoutDashboard, MessageSquare, BookOpen,
  UserCircle, Upload, Building2, FileText, ShieldCheck,
  TrendingUp, Bell, ArrowRight, Brain, ChevronRight,
  Sparkles, Command,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type SearchResult = {
  id: string;
  type: 'page' | 'action' | 'company' | 'policy';
  title: string;
  subtitle: string;
  icon: React.ElementType;
  href?: string;
  color: string;
  badge?: string;
};

const STATIC_RESULTS: SearchResult[] = [
  {
    id: 'dashboard',
    type: 'page',
    title: 'Dashboard',
    subtitle: 'AI analysis and recommended actions',
    icon: LayoutDashboard,
    href: '/',
    color: 'text-blue-500',
  },
  {
    id: 'customer-profile',
    type: 'page',
    title: 'Customer Profile',
    subtitle: 'Full customer overview and details',
    icon: UserCircle,
    href: '/customer-profile',
    color: 'text-violet-500',
  },
  {
    id: 'customer-portal',
    type: 'page',
    title: 'Customer Portal',
    subtitle: 'Document upload and AI validation',
    icon: Upload,
    href: '/customer-portal',
    color: 'text-emerald-500',
    badge: 'NEW',
  },
  {
    id: 'copilot',
    type: 'page',
    title: 'AI Copilot',
    subtitle: 'Ask anything about this customer',
    icon: MessageSquare,
    href: '/copilot',
    color: 'text-blue-500',
    badge: 'AI',
  },
  {
    id: 'policy-center',
    type: 'page',
    title: 'Policy Center',
    subtitle: 'Banking policies and compliance rules',
    icon: BookOpen,
    href: '/policy-center',
    color: 'text-slate-500',
  },
  {
    id: 'almadar',
    type: 'company',
    title: 'AlMadar Construction Group',
    subtitle: 'Construction · Active Customer · Low Risk',
    icon: Building2,
    href: '/customer-profile',
    color: 'text-blue-600',
  },
  {
    id: 'cr-doc',
    type: 'action',
    title: 'Update Commercial Registration',
    subtitle: 'Document action · Expires in 30 days',
    icon: FileText,
    href: '/customer-portal',
    color: 'text-amber-500',
  },
  {
    id: 'kyc',
    type: 'policy',
    title: 'KYC Policy (BP-002)',
    subtitle: 'Annual KYC refresh for corporate customers',
    icon: ShieldCheck,
    href: '/policy-center/kyc',
    color: 'text-violet-500',
  },
  {
    id: 'onboarding',
    type: 'policy',
    title: 'Corporate Onboarding',
    subtitle: 'Required documents and procedures',
    icon: BookOpen,
    href: '/policy-center/corporate-onboarding',
    color: 'text-slate-500',
  },
  {
    id: 'financial',
    type: 'action',
    title: 'Financial Analysis',
    subtitle: 'View AI-generated financial health report',
    icon: TrendingUp,
    href: '/customer-profile',
    color: 'text-emerald-500',
  },
  {
    id: 'notify',
    type: 'action',
    title: 'Notify Customer',
    subtitle: 'Send document request notification',
    icon: Bell,
    href: '/',
    color: 'text-blue-500',
  },
  {
    id: 'banking-services',
    type: 'policy',
    title: 'Banking Services Policy',
    subtitle: 'Eligible products and requirements',
    icon: ShieldCheck,
    href: '/policy-center/banking-services',
    color: 'text-violet-500',
  },
];

const TYPE_LABELS: Record<string, string> = {
  page: 'Pages',
  company: 'Customers',
  action: 'Actions',
  policy: 'Policies',
};

function score(result: SearchResult, query: string): number {
  const q = query.toLowerCase();
  const t = result.title.toLowerCase();
  const s = result.subtitle.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  if (s.includes(q)) return 30;
  return 0;
}

function getResults(query: string): SearchResult[] {
  if (!query.trim()) return STATIC_RESULTS.slice(0, 6);
  return STATIC_RESULTS
    .map(r => ({ r, s: score(r, query) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ r }) => r);
}

function groupResults(results: SearchResult[]) {
  const groups: Record<string, SearchResult[]> = {};
  for (const r of results) {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  }
  return groups;
}

interface SearchPaletteProps {
  onClose: () => void;
}

function SearchPalette({ onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = getResults(query);
  const flatResults = results;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const navigate = (result: SearchResult) => {
    if (result.href) router.push(result.href);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = flatResults[activeIdx];
      if (r) navigate(r);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const grouped = groupResults(results);
  const typeOrder = ['company', 'page', 'action', 'policy'];

  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '1.25rem',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search pages, customers, actions, policies..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-300 hover:text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-slate-300 bg-slate-100 px-1.5 py-1 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="py-2 max-h-[420px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Brain className="w-8 h-8 text-slate-200 mx-auto" />
              <p className="text-sm text-slate-400">No results for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            <>
              {!query && (
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4 pb-1.5">
                  Suggested
                </p>
              )}
              {typeOrder.map(type => {
                const group = grouped[type];
                if (!group?.length) return null;
                return (
                  <div key={type}>
                    {query && (
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest px-4 pt-3 pb-1.5">
                        {TYPE_LABELS[type]}
                      </p>
                    )}
                    {group.map(result => {
                      const idx = globalIdx++;
                      const Icon = result.icon;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigate(result)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                            isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-blue-100' : 'bg-slate-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : result.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                                {result.title}
                              </span>
                              {result.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  result.badge === 'AI'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                  {result.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-200'}`} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 rounded-b-[1.25rem]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-slate-300">
              <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-300">
              <kbd className="bg-white border border-slate-200 rounded px-1 py-0.5 text-[9px] font-mono">↵</kbd>
              open
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-slate-300 font-medium">AI Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPalette;
