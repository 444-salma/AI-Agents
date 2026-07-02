'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageSquare, BookOpen, Building2, X,
  UserCircle, Upload, Sparkles, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { href: '/customer-profile', label: 'Customer Profile', icon: UserCircle, badge: null },
  { href: '/customer-portal', label: 'Customer Portal', icon: Upload, badge: 'NEW' },
  { href: '/copilot', label: 'AI Copilot', icon: MessageSquare, badge: 'AI' },
  { href: '/policy-center', label: 'Policy Center', icon: BookOpen, badge: null },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 ease-in-out',
        'w-64 sidebar-premium',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Building2 className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-tight text-white">Banking Copilot</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                <p className="text-[10px] text-white/40 leading-tight tracking-wide">AI-POWERED</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.12em] px-3 pt-1 pb-2">Navigation</p>
          {nav.map(({ href, label, icon: Icon, badge }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative',
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/[0.05]'
                )}
                style={active ? {
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.15))',
                  border: '1px solid rgba(59,130,246,0.25)',
                } : {}}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-blue-400" />
                )}
                <div className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all',
                  active ? 'bg-blue-500/30' : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                )}>
                  <Icon className={cn('w-3.5 h-3.5', active ? 'text-blue-300' : 'text-white/40 group-hover:text-white/70')} />
                </div>
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide',
                    badge === 'AI'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  )}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white/90 truncate">Ahmed Al-Rashid</p>
              <p className="text-[10px] text-white/35 truncate">Relationship Manager</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}
