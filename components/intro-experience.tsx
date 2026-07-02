'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Brain, Building2, TrendingUp, FileText, ShieldCheck,
  CheckCircle2, Sparkles, Search, ChevronRight, Zap,
  Database, Users, BarChart3, FolderOpen, Clock,
  Lightbulb,
} from 'lucide-react';
import { useLang } from '@/lib/language-context';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Phase = 'welcome' | 'retrieving' | 'analyzing' | 'exiting';

interface Customer {
  id: string;
  name: string;
  industry: string;
  initials: string;
  color: string;
  segment: string;
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CUSTOMERS: Customer[] = [
  { id: 'almadar',  name: 'AlMadar Construction Group',   industry: 'Construction',         initials: 'AC', color: 'from-blue-600 to-blue-700',    segment: 'Large Corporate' },
  { id: 'gulf',     name: 'Gulf Petrochemical Industries', industry: 'Petrochemicals',        initials: 'GP', color: 'from-emerald-600 to-emerald-700', segment: 'Large Corporate' },
  { id: 'noor',     name: 'Noor Digital Technologies',    industry: 'Technology',            initials: 'ND', color: 'from-violet-600 to-violet-700', segment: 'Mid Corporate' },
];

/* Timing constants (ms) */
const RETRIEVE_STEP_MS  = 700;
const ANALYZE_STEP_MS   = 1300;
const BETWEEN_MS        = 200;
const SUCCESS_PAUSE_MS  = 1800;
const EXIT_MS           = 650;

/* ─────────────────────────────────────────────
   WELCOME SCREEN
───────────────────────────────────────────── */
function WelcomeScreen({ onStart }: { onStart: (c: Customer) => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useLang();

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const filtered = query.trim()
    ? CUSTOMERS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : CUSTOMERS;

  const canAnalyze = !!selected;

  const handleSelect = (c: Customer) => {
    setSelected(c);
    setQuery(c.name);
    setFocused(false);
    inputRef.current?.blur();
  };

  const showDropdown = focused && !selected;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 45%, #0f2757 100%)' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      <div className={`relative z-10 w-full max-w-xl text-center space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{t.corporateBankingAI}</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-[2.8rem] sm:text-5xl font-extrabold text-white leading-[1.05] tracking-tight">
            {t.corporateBankingAICopilot}<br />
            <span style={{
              background: 'linear-gradient(135deg, #93c5fd 0%, #a5b4fc 50%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{t.aiCopilotTitle}</span>
          </h1>
          <p className="text-base text-white/55 font-medium leading-relaxed max-w-md mx-auto">
            {t.aiDecisionSupport}
          </p>
          <p className="text-sm text-white/35 leading-relaxed max-w-lg mx-auto">
            {t.analyzeDescription}
          </p>
        </div>

        {/* Search box */}
        <div className="relative">
          <div className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-200 ${
            focused
              ? 'ring-2 ring-blue-500/50 bg-white dark:bg-slate-900'
              : 'bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/15'
          }`}>
            <Search className={`w-5 h-5 shrink-0 transition-colors ${focused ? 'text-blue-500' : 'text-white/50'}`} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder={t.searchCorporateCustomer}
              className={`flex-1 bg-transparent text-sm font-medium outline-none placeholder:font-normal transition-colors ${
                focused ? 'text-slate-900 dark:text-slate-100 placeholder:text-slate-400' : 'text-white placeholder:text-white/40'
              }`}
            />
            {selected && (
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/25 shrink-0">
                {t.selected}
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20"
              style={{ background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(24px)' }}>
              <div className="px-3 py-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 py-1.5">{t.suggestedCustomers}</p>
                {filtered.map(c => (
                  <button key={c.id} onMouseDown={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/8 transition-colors text-left group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br ${c.color}`}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                      <p className="text-xs text-white/40">{c.industry} · {c.segment}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggested pills */}
        {!selected && !focused && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 font-medium">{t.suggestedCustomers}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {CUSTOMERS.map(c => (
                <button key={c.id} onClick={() => handleSelect(c)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/12 bg-white/6 hover:bg-white/12 hover:border-white/25 text-sm text-white/70 font-medium transition-all">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-gradient-to-br ${c.color}`}>{c.initials[0]}</div>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected customer preview */}
        {selected && (
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-blue-500/25 animate-fade-in"
            style={{ background: 'rgba(59,130,246,0.08)' }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 bg-gradient-to-br ${selected.color}`}>
              {selected.initials}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white">{selected.name}</p>
              <p className="text-xs text-white/45">{selected.industry} · {selected.segment}</p>
            </div>
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">{t.ready}</span>
          </div>
        )}

        {/* CTA */}
        <button
          disabled={!canAnalyze}
          onClick={() => selected && onStart(selected)}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
            canAnalyze
              ? 'text-white shadow-2xl hover:opacity-90 active:scale-98'
              : 'text-white/30 cursor-not-allowed border border-white/10 bg-white/5'
          }`}
          style={canAnalyze ? { background: 'linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' } : {}}
        >
          <Brain className="w-5 h-5" />
          {t.analyzeCustomer}
          {canAnalyze && <ChevronRight className="w-4 h-4 opacity-70" />}
        </button>

        {canAnalyze && (
          <p className="text-xs text-white/25 flex items-center justify-center gap-1.5 -mt-4">
            <Zap className="w-3 h-3 text-blue-400" />
            {t.poweredBy5Agents}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROCESSING SCREEN — shared layout
───────────────────────────────────────────── */
function ProcessingLayout({
  customer, title, subtitle, children, progress, progressLabel,
}: {
  customer: Customer;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  progress: number;
  progressLabel: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: 'linear-gradient(150deg, #0f172a 0%, #1e1b4b 45%, #0f2757 100%)' }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-15 rounded-full"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 65%)', filter: 'blur(70px)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 opacity-10 rounded-full"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 65%)', filter: 'blur(70px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Customer badge */}
        <div className="flex items-center justify-center gap-2.5 animate-fade-in">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${customer.color} shrink-0`}>
            {customer.initials}
          </div>
          <span className="text-sm font-semibold text-white/60">{customer.name}</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2 animate-slide-up">
          <div className="relative w-14 h-14 mx-auto mb-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}>
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{title}</h2>
          <p className="text-sm text-white/45">{subtitle}</p>
        </div>

        {/* Steps */}
        <div className="space-y-2">{children}</div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
            />
          </div>
          <p className="text-[10px] text-white/25 text-center font-medium">{progressLabel}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP ROW (retrieval)
───────────────────────────────────────────── */
function RetrieveRow({ icon: Icon, label, desc, state, doneLabel, waitingLabel }: {
  icon: React.ElementType; label: string; desc: string;
  state: 'pending' | 'active' | 'done';
  doneLabel: string; waitingLabel: string;
}) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-400 ${
      state === 'done'   ? 'border-emerald-500/25 bg-emerald-500/6' :
      state === 'active' ? 'border-blue-500/35 bg-blue-500/8 scale-[1.01]' :
      'border-white/[0.05] bg-white/[0.02] opacity-30'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-400 ${
        state === 'done'   ? 'bg-emerald-500/20' :
        state === 'active' ? 'bg-blue-500/25' :
        'bg-white/[0.06]'
      }`}>
        {state === 'done'
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          : <Icon className={`w-5 h-5 ${state === 'active' ? 'text-blue-300' : 'text-white/25'}`} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${state === 'done' ? 'text-emerald-300' : state === 'active' ? 'text-white' : 'text-white/30'}`}>
          {label}
        </p>
        <p className={`text-xs ${state === 'done' ? 'text-emerald-400/50' : state === 'active' ? 'text-white/45' : 'text-white/15'}`}>
          {state === 'done' ? doneLabel : state === 'active' ? desc : waitingLabel}
        </p>
      </div>
      <div className="shrink-0 w-16 text-right">
        {state === 'done' && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">DONE</span>}
        {state === 'active' && (
          <div className="flex gap-1 justify-end">
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{ animation: `typing-dot 1.2s ease-in-out infinite ${i * 200}ms` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AGENT ROW (analysis)
───────────────────────────────────────────── */
function AgentRow({ icon: Icon, name, desc, gradient, state, successLabel, waitingLabel }: {
  icon: React.ElementType; name: string; desc: string; gradient: string;
  state: 'pending' | 'active' | 'done';
  successLabel?: string; waitingLabel: string;
}) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-all duration-400 ${
      state === 'done'   ? 'border-emerald-500/25 bg-emerald-500/6' :
      state === 'active' ? 'border-blue-500/35 bg-blue-500/8 scale-[1.01]' :
      'border-white/[0.05] bg-white/[0.02] opacity-30'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
        state === 'done'   ? 'bg-emerald-500/20' :
        state === 'active' ? `bg-gradient-to-br ${gradient}` :
        'bg-white/[0.06]'
      }`}>
        {state === 'done'
          ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          : <Icon className={`w-5 h-5 ${state === 'active' ? 'text-white' : 'text-white/25'}`} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${state === 'done' ? 'text-emerald-300' : state === 'active' ? 'text-white' : 'text-white/30'}`}>
          {name}
        </p>
        <p className={`text-xs ${state === 'done' ? 'text-emerald-400/50' : state === 'active' ? 'text-white/45' : 'text-white/15'}`}>
          {state === 'done' ? (successLabel || 'Completed') : state === 'active' ? desc : waitingLabel}
        </p>
      </div>
      <div className="shrink-0 w-16 text-right">
        {state === 'done' && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">DONE</span>}
        {state === 'active' && (
          <div className="flex gap-1 justify-end">
            {[0,1,2].map(i => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{ animation: `typing-dot 1.2s ease-in-out infinite ${i * 200}ms` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export interface IntroExperienceProps {
  onComplete: () => void;
}

export default function IntroExperience({ onComplete }: IntroExperienceProps) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [exitOpacity, setExitOpacity] = useState(1);
  const { t } = useLang();

  /* retrieval state */
  const [retrieveActive, setRetrieveActive] = useState(-1);
  const [retrieveDone, setRetrieveDone] = useState<number[]>([]);

  /* analysis state */
  const [analyzeActive, setAnalyzeActive] = useState(-1);
  const [analyzeDone, setAnalyzeDone] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const RETRIEVE_STEPS = [
    { icon: Building2,  label: t.companyProfile,      desc: t.fetchingFromCRM },
    { icon: Database,   label: t.bankingProducts,      desc: t.loadingAccountData },
    { icon: BarChart3,  label: t.financialStatements,  desc: t.retrieving3Year },
    { icon: FolderOpen, label: t.customerDocuments,    desc: t.checkingDocStore },
    { icon: Clock,      label: t.relationshipHistory,  desc: t.loadingPrevInteractions },
  ];

  const ANALYZE_STEPS = [
    { icon: Building2,  name: t.companyIntelligenceAgent, desc: t.analyzingProfile },
    { icon: TrendingUp, name: t.financialAnalysisAgent,   desc: t.reviewingFinancials },
    { icon: FileText,   name: t.complianceDocumentAgent,  desc: t.checkingKYC },
    { icon: ShieldCheck,name: t.policyEngine,             desc: t.matchingPolicies },
    { icon: Lightbulb,  name: t.recommendationAgent,      desc: t.generatingBestAction },
  ];

  const agentSuccessLabels = [
    t.profileAnalyzed,
    t.financialsReviewed,
    t.complianceChecked,
    t.policiesMatched,
    t.recommendationGenerated,
  ];

  function handleStart(c: Customer) {
    setCustomer(c);
    setPhase('retrieving');
    startRetrieval();
  }

  function startRetrieval() {
    let offset = 300;
    RETRIEVE_STEPS.forEach((_, i) => {
      setTimeout(() => setRetrieveActive(i), offset);
      offset += RETRIEVE_STEP_MS;
      const ci = i;
      setTimeout(() => setRetrieveDone(prev => [...prev, ci]), offset);
      offset += BETWEEN_MS;
    });
    setTimeout(() => {
      setPhase('analyzing');
      startAnalysis();
    }, offset + 400);
  }

  function startAnalysis() {
    let offset = 300;
    ANALYZE_STEPS.forEach((_, i) => {
      setTimeout(() => setAnalyzeActive(i), offset);
      offset += ANALYZE_STEP_MS;
      const ci = i;
      setTimeout(() => setAnalyzeDone(prev => [...prev, ci]), offset);
      offset += BETWEEN_MS;
    });
    setTimeout(() => setShowSuccess(true), offset + 400);
    setTimeout(() => {
      setPhase('exiting');
      setExitOpacity(0);
      setTimeout(() => {
        sessionStorage.setItem('ai-analyzed', 'true');
        onComplete();
      }, EXIT_MS);
    }, offset + 400 + SUCCESS_PAUSE_MS);
  }

  const retrieveProgress = retrieveDone.length === 0 && retrieveActive < 0
    ? 0
    : Math.round(((retrieveDone.length + (retrieveActive >= 0 && !retrieveDone.includes(retrieveActive) ? 0.5 : 0)) / RETRIEVE_STEPS.length) * 100);

  const analyzeProgress = analyzeDone.length === 0 && analyzeActive < 0
    ? 0
    : Math.round(((analyzeDone.length + (analyzeActive >= 0 && !analyzeDone.includes(analyzeActive) ? 0.5 : 0)) / ANALYZE_STEPS.length) * 100);

  const agentGradients = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-violet-500 to-violet-600',
    'from-blue-500 to-indigo-600',
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ transition: `opacity ${EXIT_MS}ms ease`, opacity: exitOpacity }}
    >
      {phase === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {phase === 'retrieving' && customer && (
        <ProcessingLayout
          customer={customer}
          title={t.retrievingCustomerInfo}
          subtitle={t.collectingData}
          progress={retrieveProgress}
          progressLabel={`${retrieveDone.length} ${t.ofData} ${RETRIEVE_STEPS.length} ${t.dataSourcesRetrieved}`}
        >
          {RETRIEVE_STEPS.map((step, i) => (
            <RetrieveRow
              key={step.label}
              icon={step.icon}
              label={step.label}
              desc={step.desc}
              doneLabel={t.retrievedSuccessfully}
              waitingLabel={t.waiting}
              state={retrieveDone.includes(i) ? 'done' : retrieveActive === i ? 'active' : 'pending'}
            />
          ))}
        </ProcessingLayout>
      )}

      {(phase === 'analyzing' || phase === 'exiting') && customer && (
        <ProcessingLayout
          customer={customer}
          title={t.analyzingCustomer}
          subtitle={t.aiAgentsReviewing}
          progress={showSuccess ? 100 : analyzeProgress}
          progressLabel={showSuccess
            ? `5 ${t.ofData} 5 ${t.agentsCompleted}`
            : `${analyzeDone.length} ${t.ofData} ${ANALYZE_STEPS.length} ${t.agentsCompleted}`}
        >
          {ANALYZE_STEPS.map((step, i) => (
            <AgentRow
              key={step.name}
              icon={step.icon}
              name={step.name}
              desc={step.desc}
              gradient={agentGradients[i]}
              successLabel={agentSuccessLabels[i]}
              waitingLabel={t.waiting}
              state={analyzeDone.includes(i) ? 'done' : analyzeActive === i ? 'active' : 'pending'}
            />
          ))}

          {/* Success banner */}
          <div className={`transition-all duration-600 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-400/25"
              style={{ background: 'rgba(16,185,129,0.08)' }}>
              <div className="relative w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div className="absolute inset-0 rounded-xl bg-emerald-500/15 animate-ping opacity-60" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-emerald-300">{t.aiRecommendationGenerated}</p>
                <p className="text-xs text-emerald-400/55 mt-0.5">{t.openingDashboard}</p>
              </div>
            </div>
          </div>
        </ProcessingLayout>
      )}
    </div>
  );
}
