'use client';

import { useEffect, useState } from 'react';
import { Building2, TrendingUp, FileText, Target, Shield, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { supabase, type Company, type FinancialStatement, type CompanyDocument, type BankingProduct, type TimelineEvent } from '@/lib/supabase';
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

type StepStatus = 'waiting' | 'running' | 'done';

type Step = {
  id: string;
  icon: typeof Building2;
  name: string;
  description: string;
  input: string;
  status: StepStatus;
  output?: string;
};

const BASE_STEPS: Omit<Step, 'status' | 'output'>[] = [
  {
    id: 'company',
    icon: Building2,
    name: 'Company Intelligence Agent',
    description: 'Analyzes customer profile, relationship history, banking products, and strategic position.',
    input: 'Company profile · Banking products · Relationship timeline',
  },
  {
    id: 'financial',
    icon: TrendingUp,
    name: 'Financial Analysis Agent',
    description: 'Reviews audited financial statements, calculates health score, identifies strengths and risks.',
    input: 'Financial statements · Revenue · Ratios · Cash flow',
  },
  {
    id: 'compliance',
    icon: FileText,
    name: 'Compliance & Document Agent',
    description: 'Checks document completeness against policy requirements, identifies missing or expiring items.',
    input: 'Document checklist · KYC status · Policy requirements',
  },
  {
    id: 'policy',
    icon: Shield,
    name: 'Policy Engine',
    description: 'Centralized knowledge base consulted by all agents. Contains banking policies, KYC rules, business rules, and required document definitions.',
    input: 'Banking policies · KYC requirements · Business rules · Document library',
  },
  {
    id: 'action',
    icon: Target,
    name: 'Next Best Action Agent',
    description: 'Synthesizes outputs from all three agents through the Policy Engine to generate a prioritized, policy-grounded recommendation.',
    input: 'All agent outputs · Policy constraints · Priority logic',
  },
];

export default function AIAgentsPage() {
  const [steps, setSteps] = useState<Step[]>(BASE_STEPS.map(s => ({ ...s, status: 'waiting' })));
  const [company, setCompany] = useState<Company | null>(null);
  const [ci, setCi] = useState<CompanyIntelligenceOutput | null>(null);
  const [fa, setFa] = useState<FinancialAnalysisOutput | null>(null);
  const [comp, setComp] = useState<ComplianceOutput | null>(null);
  const [nba, setNba] = useState<NextBestActionOutput | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('companies').select('*').eq('id', COMPANY_ID).single(),
      supabase.from('financial_statements').select('*').eq('company_id', COMPANY_ID).order('year', { ascending: false }),
      supabase.from('documents').select('*').eq('company_id', COMPANY_ID),
      supabase.from('banking_products').select('*').eq('company_id', COMPANY_ID),
      supabase.from('timeline_events').select('*').eq('company_id', COMPANY_ID).order('event_date', { ascending: false }),
    ]).then(([c, s, d, p, t]) => {
      setCompany(c.data as Company);
      setLoading(false);
      runSequence(
        c.data as Company,
        (s.data || []) as FinancialStatement[],
        (d.data || []) as CompanyDocument[],
        (p.data || []) as BankingProduct[],
        (t.data || []) as TimelineEvent[]
      );
    });
  }, []);

  function setStepStatus(id: string, status: StepStatus, output?: string) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, output } : s));
  }

  function runSequence(
    co: Company,
    st: FinancialStatement[],
    docs: CompanyDocument[],
    prods: BankingProduct[],
    tl: TimelineEvent[]
  ) {
    setRan(true);
    const DELAY = 700;

    setStepStatus('company', 'running');
    setTimeout(() => {
      const ciResult = runCompanyIntelligenceAgent(co, prods, tl);
      setCi(ciResult);
      setStepStatus('company', 'done', ciResult.executiveSummary.slice(0, 200) + '...');

      setStepStatus('financial', 'running');
      setTimeout(() => {
        const faResult = runFinancialAnalysisAgent(co, st);
        setFa(faResult);
        setStepStatus('financial', 'done', faResult.narrativeSummary.slice(0, 200) + '...');

        setStepStatus('compliance', 'running');
        setStepStatus('policy', 'running');
        setTimeout(() => {
          const compResult = runComplianceAgent(co, docs);
          setComp(compResult);
          setStepStatus('compliance', 'done', compResult.summaryNarrative.slice(0, 200) + '...');
          setStepStatus('policy', 'done', '6 banking policies · 3 operational procedures · 8 business rules · KYC requirements consulted.');

          setStepStatus('action', 'running');
          setTimeout(() => {
            const nbaResult = runNextBestActionAgent(co, ciResult, faResult, compResult, prods);
            setNba(nbaResult);
            setStepStatus('action', 'done', `Primary: ${nbaResult.primaryRecommendation.action} (${nbaResult.primaryRecommendation.priority} Priority)`);
          }, DELAY);
        }, DELAY);
      }, DELAY);
    }, DELAY);
  }

  const statusColors: Record<StepStatus, string> = {
    waiting: 'border-border bg-card opacity-50',
    running: 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20',
    done: 'border-primary/30 bg-primary/5',
  };

  const iconBg: Record<StepStatus, string> = {
    waiting: 'bg-muted text-muted-foreground',
    running: 'bg-blue-500 text-white',
    done: 'bg-primary text-white',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Agent Workflow</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          How four specialized agents work together to analyze {company?.name} and generate decision support recommendations.
        </p>
      </div>

      {/* Policy Engine notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground/80 leading-relaxed">
          <span className="font-semibold text-foreground">Policy Engine</span> is the single source of truth for all banking policies, KYC requirements, and business rules. Every agent consults it before generating any recommendation — no rules are invented.
        </p>
      </div>

      {/* Workflow */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isLast = i === steps.length - 1;
          const isOpen = expanded === step.id;

          return (
            <div key={step.id} className="relative">
              {/* Connector */}
              {!isLast && (
                <div className="absolute left-[1.875rem] top-full z-10 flex flex-col items-center" style={{ height: '0.75rem' }}>
                  <div className={cn(
                    'w-px flex-1 transition-colors duration-500',
                    step.status === 'done' ? 'bg-primary/40' : 'bg-border'
                  )} />
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors duration-500',
                    step.status === 'done' ? 'bg-primary/40' : 'bg-border'
                  )} />
                </div>
              )}

              <div className={cn(
                'rounded-2xl border transition-all duration-500 overflow-hidden',
                statusColors[step.status]
              )}>
                <button
                  className="w-full p-5 flex items-center gap-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : step.id)}
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                    iconBg[step.status]
                  )}>
                    {step.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold">{step.name}</p>
                      {step.status === 'running' && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Processing...</span>
                      )}
                      {step.status === 'done' && (
                        <span className="text-xs text-primary font-medium">Complete</span>
                      )}
                      {step.status === 'waiting' && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Waiting
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Expand toggle */}
                  {step.status === 'done' && (
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', isOpen && 'rotate-180')} />
                  )}
                </button>

                {/* Expanded detail */}
                {isOpen && step.status === 'done' && (
                  <div className="px-5 pb-5 space-y-3">
                    <div className="h-px bg-border" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-muted/50 border p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Input</p>
                        <p className="text-xs leading-relaxed">{step.input}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Output</p>
                        <p className="text-xs leading-relaxed text-foreground/80">{step.output}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final output */}
      {nba && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Workflow Complete</p>
              <p className="text-xs text-muted-foreground">All agents finished · Primary recommendation ready</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Primary Recommendation</p>
            <p className="text-sm font-bold">{nba.primaryRecommendation.action}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{nba.primaryRecommendation.reason}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                nba.primaryRecommendation.priority === 'Critical' ? 'bg-red-500' :
                nba.primaryRecommendation.priority === 'High' ? 'bg-orange-500' :
                nba.primaryRecommendation.priority === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'
              )} />
              <span className="text-xs font-medium text-muted-foreground">{nba.primaryRecommendation.priority} Priority</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic leading-relaxed">{nba.overallAssessment}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/50 border">
        <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Decision Support Only.</span>{' '}
          This platform supports Relationship Managers in understanding customer information faster. It does not automatically approve or reject any banking request.
        </p>
      </div>
    </div>
  );
}
