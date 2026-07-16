'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, User, Brain, FileText, TrendingUp, Shield, BookOpen, RotateCcw } from 'lucide-react';
import { fetchCompanyData } from '@/lib/db';
import { type Company, type FinancialStatement, type CompanyDocument, type BankingProduct, type TimelineEvent } from '@/lib/supabase';
import {
  runCompanyIntelligenceAgent,
  runFinancialAnalysisAgent,
  runComplianceAgent,
  runNextBestActionAgent,
  type CompanyIntelligenceOutput,
  type FinancialAnalysisOutput,
  type ComplianceOutput,
  type NextBestActionOutput,
} from '@/lib/agents';
import { cn } from '@/lib/utils';

const COMPANY_ID = '11111111-1111-1111-1111-111111111111';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  typing?: boolean;
};

const PROMPTS = [
  { icon: Brain, label: 'Summarize this customer', q: 'Summarize this customer.' },
  { icon: TrendingUp, label: 'Explain the financial analysis', q: 'Explain the financial analysis for this customer.' },
  { icon: FileText, label: 'Which documents are missing?', q: 'Which documents are missing or need renewal?' },
  { icon: Shield, label: 'Why is this recommendation generated?', q: 'Why was the primary recommendation generated? Explain the reasoning.' },
  { icon: BookOpen, label: 'Explain this policy', q: 'Explain the most relevant banking policy for this customer right now.' },
  { icon: Sparkles, label: 'Show KYC status', q: 'What is the KYC status for this customer?' },
];

function fmt(v: number): string {
  if (v >= 1e9) return `SAR ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `SAR ${(v / 1e6).toFixed(0)}M`;
  return `SAR ${v.toLocaleString()}`;
}

function buildAnswer(
  q: string,
  company: Company,
  ci: CompanyIntelligenceOutput,
  fa: FinancialAnalysisOutput,
  comp: ComplianceOutput,
  nba: NextBestActionOutput
): string {
  const lower = q.toLowerCase();

  if (lower.includes('summarize') || lower.includes('summary') || lower.includes('overview') || lower.includes('about')) {
    return ci.executiveSummary;
  }

  if (lower.includes('financial') || lower.includes('revenue') || lower.includes('profit') || lower.includes('income')) {
    return `${fa.narrativeSummary}\n\nStrengths: ${fa.strengths.slice(0, 2).join(' | ')}\n\nAreas of concern: ${fa.weaknesses.length > 0 ? fa.weaknesses.slice(0, 2).join(' | ') : 'None identified.'}\n\nKey observations: ${fa.observations.slice(0, 2).join(' | ')}`;
  }

  if (lower.includes('document') || lower.includes('missing') || lower.includes('renewal') || lower.includes('compliance')) {
    const missing = comp.checklist.filter(d => d.status === 'Missing');
    const needs = comp.checklist.filter(d => d.status === 'Needs Update');
    const complete = comp.checklist.filter(d => d.status === 'Complete');
    let ans = `${comp.summaryNarrative}\n\n`;
    if (missing.length > 0) {
      ans += `**Missing documents (${missing.length}):**\n${missing.map(d => `• ${d.documentType}: ${d.policyExplanation}`).join('\n')}\n\n`;
    }
    if (needs.length > 0) {
      ans += `**Needs renewal (${needs.length}):**\n${needs.map(d => `• ${d.documentType}: ${d.policyExplanation}`).join('\n')}\n\n`;
    }
    if (complete.length > 0) {
      ans += `**Complete (${complete.length}):** ${complete.map(d => d.documentType).join(', ')}`;
    }
    return ans.trim();
  }

  if (lower.includes('recommendation') || lower.includes('action') || lower.includes('next') || lower.includes('should')) {
    let ans = `**Primary Recommendation (${nba.primaryRecommendation.priority} Priority):** ${nba.primaryRecommendation.action}\n\n`;
    ans += `**Reason:** ${nba.primaryRecommendation.reason}\n\n`;
    ans += `**Business Impact:** ${nba.primaryRecommendation.businessImpact}\n\n`;
    if (nba.additionalActions.length > 0) {
      ans += `**Additional actions:**\n${nba.additionalActions.slice(0, 3).map(a => `• [${a.priority}] ${a.action}`).join('\n')}`;
    }
    return ans;
  }

  if (lower.includes('policy') || lower.includes('regulation') || lower.includes('rule') || lower.includes('kyc') || lower.includes('aml')) {
    const relevant = comp.checklist.filter(d => d.status !== 'Complete');
    if (lower.includes('kyc')) {
      const kycDoc = comp.checklist.find(d => d.documentType.toLowerCase().includes('kyc'));
      if (kycDoc) {
        return `**KYC Status for ${company.name}:**\n\nStatus: ${kycDoc.status}\n\n${kycDoc.policyExplanation}\n\nRequired for: ${kycDoc.requiredFor.join(', ') || 'All banking services'}`;
      }
      return `KYC status: ${comp.overallStatus}. Compliance score: ${comp.complianceScore}%. ${comp.summaryNarrative}`;
    }
    return `The most relevant policy issue right now:\n\n${relevant.length > 0
      ? relevant.slice(0, 2).map(d => `**${d.documentType}** (${d.status}): ${d.policyExplanation}`).join('\n\n')
      : 'All documents are compliant. No active policy issues.'
    }\n\n${comp.summaryNarrative}`;
  }

  if (lower.includes('risk') || lower.includes('credit')) {
    return `**Risk Profile for ${company.name}:**\n\nRisk Rating: ${company.risk_rating}\nCustomer Segment: ${company.customer_segment}\nFinancial Health: ${fa.healthScore}/100 (${fa.healthLabel})\n\n${fa.weaknesses.length > 0 ? `Key financial risks: ${fa.weaknesses.join('; ')}` : 'No significant financial risks identified.'}\n\nCompliance status: ${comp.overallStatus} (${comp.complianceScore}%)`;
  }

  if (lower.includes('product') || lower.includes('facility') || lower.includes('account') || lower.includes('loan')) {
    const prods = ci.customerProfile.filter(p => p.label === 'Segment' || p.label === 'Annual Revenue' || p.label === 'Relationship Manager');
    return `${ci.executiveSummary}\n\nKey relationship data:\n${prods.map(p => `• ${p.label}: ${p.value}`).join('\n')}\n\nRelationship highlights:\n${ci.relationshipHighlights.map(h => `• ${h}`).join('\n')}`;
  }

  return `Based on my analysis of ${company.name}:\n\n${nba.overallAssessment}\n\nFor specific details, try asking about financials, documents, compliance, or the recommended next action.`;
}

export default function AICopilotPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [ci, setCi] = useState<CompanyIntelligenceOutput | null>(null);
  const [fa, setFa] = useState<FinancialAnalysisOutput | null>(null);
  const [comp, setComp] = useState<ComplianceOutput | null>(null);
  const [nba, setNba] = useState<NextBestActionOutput | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompanyData(COMPANY_ID).then(({ company: co, statements, documents, products, timelineEvents }) => {
      const ciResult = runCompanyIntelligenceAgent(co, products as BankingProduct[], timelineEvents as TimelineEvent[]);
      const faResult = runFinancialAnalysisAgent(co, statements as FinancialStatement[]);
      const compResult = runComplianceAgent(co, documents as CompanyDocument[]);
      const nbaResult = runNextBestActionAgent(co, ciResult, faResult, compResult, products as BankingProduct[]);
      setCompany(co);
      setCi(ciResult);
      setFa(faResult);
      setComp(compResult);
      setNba(nbaResult);
      setReady(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim() || !ready || !company || !ci || !fa || !comp || !nba) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const typingMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', typing: true };
    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput('');
    setTimeout(() => {
      const answer = buildAnswer(text, company, ci, fa, comp, nba);
      setMessages(prev => prev.map(m => m.id === typingMsg.id ? { ...m, content: answer, typing: false } : m));
    }, 600 + Math.random() * 400);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function clearChat() {
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function renderContent(content: string) {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-semibold text-foreground mt-3 first:mt-0">{line.slice(2, -2)}</p>;
      }
      if (line.match(/^\*\*.*\*\*/)) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className="leading-relaxed">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
      }
      if (line.startsWith('• ')) {
        return <p key={i} className="pl-3 leading-relaxed text-foreground/85">{line}</p>;
      }
      if (line === '') return <div key={i} className="h-1" />;
      return <p key={i} className="leading-relaxed text-foreground/85">{line}</p>;
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading AI Copilot...</p>
      </div>
    </div>
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">AI Copilot</h1>
            <p className="text-xs text-muted-foreground">{company?.name} · Decision Support</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasMessages && (
            <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted">
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            4 Agents Ready
          </div>
        </div>
      </div>

      {/* Messages / Empty State */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask anything about {company?.name}</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md leading-relaxed">
              Four AI agents have analyzed this customer's profile, financials, documents, and compliance. Ask a question or pick a prompt below.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
              {PROMPTS.map(prompt => (
                <button
                  key={prompt.q}
                  onClick={() => sendMessage(prompt.q)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border bg-card hover:bg-muted/50 text-left transition-all group shadow-sm hover:shadow"
                >
                  <prompt.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-muted border'
                )}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5" />
                    : <Sparkles className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className={cn(
                  'rounded-2xl px-4 py-3 max-w-[80%] text-sm shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border rounded-tl-sm'
                )}>
                  {msg.typing ? (
                    <div className="flex items-center gap-1.5 py-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {msg.role === 'assistant' ? renderContent(msg.content) : <p>{msg.content}</p>}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t shrink-0">
        <div className="max-w-3xl mx-auto">
          {hasMessages && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {PROMPTS.slice(0, 3).map(p => (
                <button
                  key={p.q}
                  onClick={() => sendMessage(p.q)}
                  className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 p-3 rounded-2xl border bg-card shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={ready ? 'Ask about this customer...' : 'Loading agents...'}
              disabled={!ready}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || !ready}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0',
                input.trim() && ready
                  ? 'bg-primary text-white hover:opacity-90 shadow-sm'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Decision support only · All final decisions require authorized banking professional approval
          </p>
        </div>
      </div>
    </div>
  );
}
