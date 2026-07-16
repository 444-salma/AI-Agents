'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Building2, TrendingUp, FileText, ShieldCheck, ArrowRight,
  Sparkles, AlertTriangle, CheckCircle2, Clock, User, Phone,
  ChevronRight, CircleDot, Wallet, BarChart3, RefreshCw, Brain,
} from 'lucide-react';
import {
  supabase, type Company, type CompanyDocument, type FinancialStatement,
  type BankingProduct, type TimelineEvent,
} from '@/lib/supabase';
import {
  runCompanyIntelligenceAgent, runFinancialAnalysisAgent,
  runComplianceAgent, runNextBestActionAgent,
  type CompanyIntelligenceOutput, type FinancialAnalysisOutput,
  type ComplianceOutput, type NextBestActionOutput,
} from '@/lib/agents';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

function fmt(value: number): string {
  if (value >= 1e9) return `SAR ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `SAR ${(value / 1e6).toFixed(0)}M`;
  return `SAR ${value.toLocaleString()}`;
}

const priorityMeta: Record<string, { label: string; badge: string; dot: string }> = {
  Critical: { label: 'CRITICAL', badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900', dot: 'bg-red-500' },
  High:     { label: 'HIGH',     badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900', dot: 'bg-amber-500' },
  Medium:   { label: 'MEDIUM',   badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900', dot: 'bg-blue-500' },
  Low:      { label: 'LOW',      badge: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', dot: 'bg-slate-400' },
};

/* Animated counter hook */
function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

function AnimatedBar({ score, color }: { score: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 80);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function CustomerProfile() {
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<BankingProduct[]>([]);
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [ci, setCi] = useState<CompanyIntelligenceOutput | null>(null);
  const [fa, setFa] = useState<FinancialAnalysisOutput | null>(null);
  const [comp, setComp] = useState<ComplianceOutput | null>(null);
  const [nba, setNba] = useState<NextBestActionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'documents' | 'products'>('overview');

  useEffect(() => {
    Promise.all([
      supabase.from('companies').select('*').eq('id', COMPANY_ID).single(),
      supabase.from('financial_statements').select('*').eq('company_id', COMPANY_ID).order('year', { ascending: false }),
      supabase.from('documents').select('*').eq('company_id', COMPANY_ID),
      supabase.from('banking_products').select('*').eq('company_id', COMPANY_ID),
      supabase.from('timeline_events').select('*').eq('company_id', COMPANY_ID).order('event_date', { ascending: false }),
    ]).then(([c, s, d, p, t]) => {
      const co = c.data as Company;
      const st = (s.data || []) as FinancialStatement[];
      const docs = (d.data || []) as CompanyDocument[];
      const prods = (p.data || []) as BankingProduct[];
      const tl = (t.data || []) as TimelineEvent[];
      setCompany(co); setProducts(prods); setStatements(st);
      const ciR = runCompanyIntelligenceAgent(co, prods, tl);
      const faR = runFinancialAnalysisAgent(co, st);
      const compR = runComplianceAgent(co, docs);
      const nbaR = runNextBestActionAgent(co, ciR, faR, compR, prods);
      setCi(ciR); setFa(faR); setComp(compR); setNba(nbaR);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-12 h-12 mx-auto">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
          </div>
          <p className="text-sm text-slate-500">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (!company || !ci || !fa || !comp || !nba) return null;

  const missing = comp.checklist.filter(d => d.status === 'Missing').length;
  const needsUpdate = comp.checklist.filter(d => d.status === 'Needs Update').length;
  const docIssues = missing + needsUpdate;
  const latest = statements[0] || null;
  const totalExposure = products.reduce((s, p) => s + (p.outstanding_amount || 0), 0);
  const activeProducts = products.filter(p => p.status === 'Active');
  const pMeta = priorityMeta[nba.primaryRecommendation.priority] || priorityMeta.Medium;

  const statusCards = [
    {
      icon: Building2, label: 'Company',
      value: ci.keyInsights.length > 0 ? 'Stable' : 'Review',
      detail: company.industry,
      hint: 'Company standing',
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50/80 dark:bg-blue-950/20', border: 'border-blue-200/60 dark:border-blue-900/40',
      text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500',
    },
    {
      icon: TrendingUp, label: 'Financial Health',
      value: fa.healthLabel, detail: `Score: ${fa.healthScore}/100`,
      hint: 'Based on latest statements',
      gradient: fa.healthScore >= 70 ? 'from-emerald-500 to-emerald-600' : 'from-amber-500 to-amber-600',
      bg: fa.healthScore >= 70 ? 'bg-emerald-50/80 dark:bg-emerald-950/20' : 'bg-amber-50/80 dark:bg-amber-950/20',
      border: fa.healthScore >= 70 ? 'border-emerald-200/60 dark:border-emerald-900/40' : 'border-amber-200/60 dark:border-amber-900/40',
      text: fa.healthScore >= 70 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300',
      dot: fa.healthScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500',
    },
    {
      icon: FileText, label: 'Documents',
      value: docIssues > 0 ? `${docIssues} Need Attention` : 'All Good',
      detail: docIssues > 0 ? `${missing} missing, ${needsUpdate} expiring` : 'All documents valid',
      hint: 'Required banking documents',
      gradient: missing > 0 ? 'from-red-500 to-red-600' : needsUpdate > 0 ? 'from-amber-500 to-amber-600' : 'from-emerald-500 to-emerald-600',
      bg: missing > 0 ? 'bg-red-50/80 dark:bg-red-950/20' : needsUpdate > 0 ? 'bg-amber-50/80 dark:bg-amber-950/20' : 'bg-emerald-50/80 dark:bg-emerald-950/20',
      border: missing > 0 ? 'border-red-200/60 dark:border-red-900/40' : needsUpdate > 0 ? 'border-amber-200/60 dark:border-amber-900/40' : 'border-emerald-200/60 dark:border-emerald-900/40',
      text: missing > 0 ? 'text-red-700 dark:text-red-300' : needsUpdate > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300',
      dot: missing > 0 ? 'bg-red-500' : needsUpdate > 0 ? 'bg-amber-500' : 'bg-emerald-500',
    },
    {
      icon: ShieldCheck, label: 'Policy Status',
      value: comp.overallStatus, detail: `${comp.complianceScore}% complete`,
      hint: 'Banking policy requirements',
      gradient: comp.overallStatus === 'Compliant' ? 'from-violet-500 to-violet-600' : 'from-amber-500 to-amber-600',
      bg: comp.overallStatus === 'Compliant' ? 'bg-violet-50/80 dark:bg-violet-950/20' : 'bg-amber-50/80 dark:bg-amber-950/20',
      border: comp.overallStatus === 'Compliant' ? 'border-violet-200/60 dark:border-violet-900/40' : 'border-amber-200/60 dark:border-amber-900/40',
      text: comp.overallStatus === 'Compliant' ? 'text-violet-700 dark:text-violet-300' : 'text-amber-700 dark:text-amber-300',
      dot: comp.overallStatus === 'Compliant' ? 'bg-violet-500' : 'bg-amber-500',
    },
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', hint: 'Summary & actions' },
    { id: 'financials' as const, label: 'Financial Health', hint: 'Revenue & ratios' },
    { id: 'documents' as const, label: `Documents${docIssues > 0 ? ` (${docIssues})` : ''}`, hint: 'Required paperwork' },
    { id: 'products' as const, label: 'Banking Products', hint: 'Active accounts & facilities' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

      {/* ── HEADER CARD ── */}
      <div className="glass-card rounded-3xl overflow-hidden animate-slide-up">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #1d4ed8, #4f46e5, #7c3aed, #06b6d4)' }} />
        <div className="px-5 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-ai-sm"
              style={{ background: 'linear-gradient(135deg, #1e40af, #4f46e5)' }}>
              {company.logo_initials || company.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">{company.name}</h1>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />{company.industry}
                </span>
                <span className="hidden sm:inline text-slate-200 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />RM: {company.relationship_manager || 'Ahmed Al-Rashid'}
                </span>
                <span className="hidden sm:inline text-slate-200 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />Since {new Date(company.relationship_since).getFullYear()}
                </span>
                <span className="hidden sm:inline text-slate-200 dark:text-slate-700">·</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />CR: {company.registration_number || '—'}
                </span>
              </div>
            </div>

            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 ${
              company.risk_rating === 'Low'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                : company.risk_rating === 'Medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                : 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40'
            }`}>
              {company.risk_rating} Risk
            </span>
          </div>

          <div className="mt-4 px-4 py-3.5 glass-card-blue rounded-2xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">In Brief</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {ci.executiveSummary.split('.').slice(0, 2).join('.') + '.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATUS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statusCards.map(({ icon: Icon, label, value, detail, hint, gradient, bg, border, text, dot }, i) => (
          <div key={label}
            className={`card-lift rounded-2xl border p-4 ${bg} ${border} space-y-2 animate-slide-up cursor-default`}
            style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
            </div>
            <div>
              <p className={`text-sm font-extrabold ${text}`}>{value}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{detail}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── RECOMMENDED NEXT ACTION ── */}
      <div className="glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
        <div className="px-5 sm:px-6 pt-5 pb-4 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Your Next Step</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${pMeta.badge}`}>{pMeta.label}</span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              {nba.primaryRecommendation.action}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {nba.primaryRecommendation.reason}
            </p>
          </div>

          <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/30">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <span className="font-bold">Business Impact: </span>{nba.primaryRecommendation.businessImpact}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-5 flex flex-wrap items-center gap-3">
          <button className="btn-press flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-ai-sm"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
            Do This Now <ArrowRight className="w-4 h-4" />
          </button>
          {nba.additionalActions.length > 0 && (
            <span className="text-xs text-slate-400">+{nba.additionalActions.length} more actions queued</span>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div>
        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl p-1 mb-5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max flex flex-col items-center py-2.5 px-3 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <span className="text-xs font-semibold">{tab.label}</span>
              <span className={`text-[9px] mt-0.5 ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-300 dark:text-slate-600'}`}>{tab.hint}</span>
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 space-y-4 card-lift">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">About This Company</p>
              <div className="space-y-2.5">
                {ci.customerProfile.map(f => (
                  <div key={f.label} className="row-hover flex items-start justify-between gap-4 py-1.5 px-2 rounded-xl -mx-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide shrink-0">{f.label}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-right">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-4 card-lift">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">What We Found</p>
              <div className="space-y-2.5">
                {ci.keyInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 px-2 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-950/10 transition-colors -mx-2">
                    <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 text-blue-600 dark:text-blue-400"
                      style={{ background: 'rgba(59,130,246,0.1)' }}>
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>

              {ci.relationshipHighlights.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Recent Events</p>
                  <div className="space-y-2">
                    {ci.relationshipHighlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <CircleDot className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {nba.additionalActions.length > 0 && (
              <div className="sm:col-span-2 glass-card rounded-2xl p-5">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">All Actions To Do</p>
                <div className="space-y-2">
                  {[nba.primaryRecommendation, ...nba.additionalActions].map((a, i) => {
                    const m = priorityMeta[a.priority] || priorityMeta.Medium;
                    return (
                      <div key={i} className="row-hover flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100/60 dark:border-white/[0.05] cursor-default">
                        <span className={`w-2 h-2 rounded-full ${m.dot} mt-1.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{a.action}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badge}`}>{m.label}</span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{a.reason}</p>
                        </div>
                        {i === 0 && <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FINANCIALS ── */}
        {activeTab === 'financials' && latest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Revenue', value: fmt(latest.total_revenue), icon: BarChart3, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50/80 dark:bg-blue-950/20', border: 'border-blue-200/60 dark:border-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
                { label: 'Net Income', value: fmt(latest.net_income), icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50/80 dark:bg-emerald-950/20', border: 'border-emerald-200/60 dark:border-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300' },
                { label: 'Total Assets', value: fmt(latest.total_assets), icon: Wallet, gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-50/80 dark:bg-slate-800/40', border: 'border-slate-200/60 dark:border-slate-700/40', text: 'text-slate-700 dark:text-slate-300' },
                { label: 'Total Equity', value: fmt(latest.total_equity), icon: ShieldCheck, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50/80 dark:bg-amber-950/20', border: 'border-amber-200/60 dark:border-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
              ].map(({ label, value, icon: Icon, gradient, bg, border, text }, i) => (
                <div key={label}
                  className={`card-lift rounded-2xl border p-4 ${bg} ${border} space-y-2.5 animate-slide-up`}
                  style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                  <p className={`text-sm font-extrabold ${text}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-5 space-y-4 card-lift">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Financial Indicators ({latest.year})</p>
                <div className="space-y-3">
                  {[
                    { label: 'Current Ratio', value: `${latest.current_ratio?.toFixed(2)}x`, ok: latest.current_ratio >= 1.5 },
                    { label: 'Debt / Equity', value: `${latest.debt_to_equity?.toFixed(2)}x`, ok: latest.debt_to_equity <= 2 },
                    { label: 'Net Margin', value: `${latest.net_margin?.toFixed(1)}%`, ok: latest.net_margin >= 10 },
                    { label: 'Return on Equity', value: `${latest.return_on_equity?.toFixed(1)}%`, ok: latest.return_on_equity >= 15 },
                    { label: 'Gross Margin', value: `${latest.gross_margin?.toFixed(1)}%`, ok: latest.gross_margin >= 20 },
                    { label: 'Return on Assets', value: `${latest.return_on_assets?.toFixed(1)}%`, ok: latest.return_on_assets >= 5 },
                  ].map(({ label, value, ok }) => (
                    <div key={label} className="row-hover flex items-center justify-between py-1.5 px-2 rounded-xl -mx-2 cursor-default">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{value}</span>
                        {ok
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 space-y-4 card-lift">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Health Assessment</p>

                <div className="p-3.5 bg-slate-50/80 dark:bg-white/[0.04] rounded-2xl border border-slate-200/40 dark:border-white/[0.06]">
                  <p className="text-[11px] font-bold text-slate-400 mb-2">Health Score</p>
                  <div className="flex items-center gap-3">
                    <AnimatedBar
                      score={fa.healthScore}
                      color={fa.healthScore >= 70 ? 'bg-emerald-500' : fa.healthScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}
                    />
                    <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 w-14 text-right shrink-0">
                      {fa.healthScore}/100
                    </span>
                  </div>
                </div>

                {fa.strengths.length > 0 && (
                  <div>
                    <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Strengths</p>
                    <div className="space-y-1.5">
                      {fa.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 group">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {fa.weaknesses.length > 0 && (
                  <div>
                    <p className="text-[10px] font-extrabold text-red-500 dark:text-red-400 uppercase tracking-widest mb-2">Concerns</p>
                    <div className="space-y-1.5">
                      {fa.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-start gap-2.5 group">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{w}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Required Documents</p>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Complete</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Expiring</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Missing</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100/80 dark:divide-white/[0.05]">
              {comp.checklist.map((doc, i) => {
                const ss = {
                  Complete: { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40' },
                  'Needs Update': { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40' },
                  Missing: { dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200/60 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40' },
                }[doc.status];
                return (
                  <div key={i} className="row-hover px-5 py-4 flex items-start gap-4 cursor-default">
                    <span className={`w-2 h-2 rounded-full ${ss.dot} mt-2 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{doc.documentName}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ss.badge}`}>{doc.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{doc.policyExplanation}</p>
                      {doc.expiryDate && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(doc.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 bg-slate-50/60 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between text-xs text-slate-400">
              <span>{comp.checklist.filter(d => d.status === 'Complete').length} of {comp.checklist.length} documents complete</span>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Active Products', value: activeProducts.length.toString(), bg: 'glass-card-blue', text: 'text-blue-700 dark:text-blue-300' },
                { label: 'Total Exposure', value: fmt(totalExposure), bg: 'glass-card', text: 'text-slate-800 dark:text-slate-200' },
                { label: 'Total Products', value: products.length.toString(), bg: 'glass-card', text: 'text-slate-800 dark:text-slate-200' },
              ].map(({ label, value, bg, text }, i) => (
                <div key={label}
                  className={`card-lift ${bg} rounded-2xl border border-transparent p-4 text-center animate-slide-up`}
                  style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
                  <p className={`text-2xl font-extrabold ${text}`}>{value}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="divide-y divide-slate-100/80 dark:divide-white/[0.05]">
                {products.map((p) => {
                  const daysLeft = p.expiry_date
                    ? Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000)
                    : null;
                  const expiringSoon = daysLeft !== null && daysLeft <= 180 && daysLeft > 0;
                  return (
                    <div key={p.id} className="row-hover px-5 py-4 flex items-start gap-4 cursor-default">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Wallet className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{p.product_name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40'
                              : 'bg-slate-50 text-slate-600 border-slate-200/60 dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/[0.08]'
                          }`}>{p.status}</span>
                          {expiringSoon && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200/60 flex items-center gap-1 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40">
                              <RefreshCw className="w-2.5 h-2.5" />{daysLeft}d to renew
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400 dark:text-slate-500">
                          <span>{p.product_type}</span>
                          {p.account_number && <span>· {p.account_number}</span>}
                          {p.outstanding_amount > 0 && <span>· Outstanding: {fmt(p.outstanding_amount)}</span>}
                          {p.limit_amount && <span>· Limit: {fmt(p.limit_amount)}</span>}
                          {p.expiry_date && <span>· Expires: {new Date(p.expiry_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
