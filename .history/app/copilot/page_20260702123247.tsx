'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, User, Brain, Zap, FileText, TrendingUp, ShieldCheck, BookOpen, ChevronRight } from 'lucide-react';
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
import { policyEngine } from '@/lib/policy-engine';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

const suggestions = [
  { text: 'Give me a summary of this customer', icon: Brain },
  { text: 'What should I do next?', icon: Zap },
  { text: 'What documents are missing?', icon: FileText },
  { text: 'How is their financial situation?', icon: TrendingUp },
  { text: 'What does the bank require for this customer?', icon: ShieldCheck },
  { text: 'Show me all the banking policies that apply', icon: BookOpen },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
};

type Context = {
  company: Company;
  ci: CompanyIntelligenceOutput;
  fa: FinancialAnalysisOutput;
  comp: ComplianceOutput;
  nba: NextBestActionOutput;
};

function generateResponse(message: string, ctx: Context): { text: string; sources: string[] } {
  const lower = message.toLowerCase();
  const { company, ci, fa, comp, nba } = ctx;

  if (/summarize|who is|tell me about|overview|profile/.test(lower)) {
    return { text: ci.executiveSummary, sources: ['Company Profile', 'Banking Products', 'Relationship History'] };
  }
  if (/what should|next action|recommend|priority|what do i do|next step/.test(lower)) {
    const extras = nba.additionalActions.slice(0, 2).map(a => `• **${a.action}** (${a.priority}): ${a.reason}`).join('\n');
    return {
      text: `**Primary Recommendation:** ${nba.primaryRecommendation.action}\n\n${nba.primaryRecommendation.reason}\n\n**Business Impact:** ${nba.primaryRecommendation.businessImpact}\n\n**Additional Actions:**\n${extras}\n\n${nba.overallAssessment}`,
      sources: ['Company Intelligence Agent', 'Financial Analysis Agent', 'Compliance Agent', 'Next Best Action Agent', 'Policy Engine'],
    };
  }
  if (/missing|document|compliance|expired|doc/.test(lower)) {
    const missing = comp.checklist.filter(d => d.status === 'Missing');
    const needsUpdate = comp.checklist.filter(d => d.status === 'Needs Update');
    let text = comp.summaryNarrative + '\n\n';
    if (missing.length > 0) text += `**Missing Documents:**\n${missing.map(d => `• ${d.documentType}: ${d.policyExplanation}`).join('\n')}\n\n`;
    if (needsUpdate.length > 0) text += `**Require Renewal:**\n${needsUpdate.map(d => `• ${d.documentType}: ${d.policyExplanation}`).join('\n')}`;
    if (missing.length === 0 && needsUpdate.length === 0) text = 'All required documents are complete and up to date. No action required at this time.';
    return { text: text.trim(), sources: ['Document Registry', 'Compliance & Document Agent', 'Policy Engine BP-003, BP-004, BP-005'] };
  }
  if (/financial|finance|revenue|profit|margin|income|health score|balance|liquidity/.test(lower)) {
    const strengths = fa.strengths.length ? `\n\n**Strengths:**\n${fa.strengths.map(s => `• ${s}`).join('\n')}` : '';
    const weaknesses = fa.weaknesses.length ? `\n\n**Areas of Concern:**\n${fa.weaknesses.map(w => `• ${w}`).join('\n')}` : '';
    return {
      text: `**Financial Health Score: ${fa.healthScore}/100 — ${fa.healthLabel}**\n\n${fa.narrativeSummary}${strengths}${weaknesses}`,
      sources: ['Financial Statements 2021–2023', 'Financial Analysis Agent', 'Credit Risk Policy BP-001'],
    };
  }
  if (/ubo|beneficial owner/.test(lower)) {
    const policy = policyEngine.bankingPolicies.find(p => p.id === 'BP-004');
    return {
      text: `The **UBO (Ultimate Beneficial Owner) Declaration** is required under anti-money laundering regulations.\n\n${policy?.description}\n\nThis document must be submitted before the banking relationship can proceed. Any beneficial owner holding 25% or more of the company must be disclosed and verified.`,
      sources: ['Policy Engine — BP-004 AML/CFT', 'KYC Requirements'],
    };
  }
  if (/kyc|know your customer|aml|anti-money/.test(lower)) {
    const policy = policyEngine.bankingPolicies.find(p => p.id === 'BP-002');
    const kycItems = policyEngine.kycRequirements.mandatoryInformation.slice(0, 5).map(i => `• ${i}`).join('\n');
    return {
      text: `**KYC Policy:** ${policy?.description}\n\n**Mandatory Information Required:**\n${kycItems}\n\n...and more. KYC must be refreshed annually for all corporate customers. Overdue KYC blocks all new requests.`,
      sources: ['Policy Engine — BP-002 KYC & AML', 'KYC Requirements'],
    };
  }
  if (/policy|rule|regulation|procedure/.test(lower)) {
    const summary = policyEngine.bankingPolicies.map(p => `• **${p.title}** (${p.id}): ${p.description}`).join('\n');
    return { text: `Here are the active banking policies that apply to this customer:\n\n${summary}`, sources: ['Policy Engine — All Active Policies'] };
  }
  if (/credit|facility|loan|financing/.test(lower)) {
    const policy = policyEngine.bankingPolicies.find(p => p.id === 'BP-001');
    const procedure = policyEngine.operationalProcedures.find(p => p.id === 'OP-002');
    const steps = procedure?.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') || '';
    return {
      text: `**Credit Facility Policy:**\n${policy?.description}\n\n**Renewal Procedure (OP-002):**\n${steps}`,
      sources: ['Policy Engine — BP-001 Credit Risk', 'Operational Procedure OP-002'],
    };
  }
  if (/risk|rating/.test(lower)) {
    const policy = policyEngine.bankingPolicies.find(p => p.id === 'BP-006');
    return {
      text: `${company.name} is currently rated **${company.risk_rating} Risk**.\n\n**Risk Rating Policy:** ${policy?.description}\n\nThe customer's financial health score is ${fa.healthScore}/100 (${fa.healthLabel}). ${fa.weaknesses.length > 0 ? `Key risk observations: ${fa.weaknesses[0]}` : 'No significant risk concerns identified.'}`,
      sources: ['Policy Engine — BP-006 Risk Management', 'Financial Analysis Agent', 'Company Profile'],
    };
  }
  return {
    text: `Based on my analysis of ${company.name}, I can help you with:\n\n• **Customer summary** — ask "summarize this customer"\n• **Next actions** — ask "what should I do next?"\n• **Documents** — ask "show missing documents"\n• **Financial health** — ask "explain the financial analysis"\n• **Policy questions** — ask about any banking policy or procedure\n\nWhat would you like to know?`,
    sources: ['AI Copilot — ready to help'],
  };
}

function formatText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-bold text-slate-900 dark:text-slate-100">{part}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ctx, setCtx] = useState<Context | null>(null);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('companies').select('*').eq('id', COMPANY_ID).single(),
      supabase.from('financial_statements').select('*').eq('company_id', COMPANY_ID).order('year', { ascending: false }),
      supabase.from('documents').select('*').eq('company_id', COMPANY_ID),
      supabase.from('banking_products').select('*').eq('company_id', COMPANY_ID),
      supabase.from('timeline_events').select('*').eq('company_id', COMPANY_ID).order('event_date', { ascending: false }),
    ]).then(([c, s, d, p, t]) => {
      const company = c.data as Company;
      const ci = runCompanyIntelligenceAgent(company, (p.data || []) as BankingProduct[], (t.data || []) as TimelineEvent[]);
      const fa = runFinancialAnalysisAgent(company, (s.data || []) as FinancialStatement[]);
      const comp = runComplianceAgent(company, (d.data || []) as CompanyDocument[]);
      const nba = runNextBestActionAgent(company, ci, fa, comp, (p.data || []) as BankingProduct[]);
      setCtx({ company, ci, fa, comp, nba });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || !ctx) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: msg }]);
    setTyping(true);
    setTimeout(() => {
      const { text: responseText, sources } = generateResponse(msg, ctx);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText, sources }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-14 h-14 mx-auto">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }} />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Getting customer information ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="text-center py-6 space-y-7 animate-slide-up">
              {/* AI Avatar */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed)' }}>
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white dark:border-slate-950">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Ask About This Customer</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  What would you like to know about <span className="font-semibold text-blue-600 dark:text-blue-400">{ctx?.company.name}</span>?
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Select a question below or type your own.</p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto text-left">
                {suggestions.map(({ text, icon: Icon }) => (
                  <button
                    key={text}
                    onClick={() => send(text)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group text-left card-lift"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/[0.06] group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-sm font-medium flex-1">{text}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'text-white'
                  : ''
              }`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }
                  : { background: 'linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed)' }
                }>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Brain className="w-4 h-4 text-white" />
                }
              </div>

              <div className={`flex-1 max-w-2xl space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'text-white text-sm'
                    : 'glass-card text-slate-700 dark:text-slate-300'
                }`}
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }
                    : {}
                  }>
                  {msg.role === 'user'
                    ? <p className="text-sm">{msg.text}</p>
                    : formatText(msg.text)
                  }
                </div>

                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wide">Based on</span>
                    {msg.sources.map(src => (
                      <span key={src} className="text-[10px] font-medium bg-slate-100/80 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-white/[0.06]">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5, #7c3aed)' }}>
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="glass-card rounded-2xl px-5 py-4">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 typing-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 typing-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-blue-500 typing-dot-3" />
                  <span className="text-xs text-slate-400 ml-1.5 font-medium">Looking it up...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.1] rounded-2xl shadow-sm focus-within:border-blue-400 dark:focus-within:border-blue-600/60 focus-within:shadow-ai-sm transition-all">
            <div className="pl-4 pr-1 shrink-0">
              <Brain className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type your question here..."
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none px-3 py-3.5"
            />
            <div className="pr-2 shrink-0">
              <button
                onClick={() => send()}
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #4f46e5)' }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-300 dark:text-slate-600 text-center mt-2 font-medium">
            This assistant helps you prepare — all final decisions require your approval.
          </p>
        </div>
      </div>
    </div>
  );
}
