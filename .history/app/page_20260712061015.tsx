"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Bell,
  Mail,
  X,
  Copy,
  Send,
  Building2,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Zap,
  ArrowDown,
} from "lucide-react";
import {
  type Company,
  type CompanyDocument,
  type FinancialStatement,
  type BankingProduct,
  type TimelineEvent,
} from "@/lib/supabase";
import {
  runCompanyIntelligenceAgent,
  runFinancialAnalysisAgent,
  runComplianceAgent,
  runNextBestActionAgent,
  type CompanyIntelligenceOutput,
  type FinancialAnalysisOutput,
  type ComplianceOutput,
  type NextBestActionOutput,
} from "@/lib/agents";
import { useLang } from "@/lib/language-context";

const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

/* ── Welcome banner shown once after the intro ── */
function WelcomeBanner({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLang();
  return (
    <div className="animate-slide-up mx-4 sm:mx-6 mt-5 mb-1">
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-4 flex items-start gap-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
          border: "1px solid rgba(16,185,129,0.25)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute right-0 top-0 w-40 h-full opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at right, rgba(16,185,129,0.3), transparent 70%)",
          }}
        />

        <div className="relative w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <div className="absolute inset-0 rounded-xl bg-emerald-500/15 animate-ping opacity-70" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              {t.aiAnalysisCompleted}
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.analysisReady}
            </span>
          </div>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60">
            {t.reviewInsights}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="shrink-0 p-1.5 rounded-lg text-emerald-500/50 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

const priorityBadge: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50",
  High: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50",
  Medium:
    "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50",
};

const workflowSteps = [
  {
    labelKey: "aiDetectsRequired" as const,
    subKey: "documentGapIdentified" as const,
    icon: Brain,
    color: "from-blue-500 to-blue-600",
  },
  {
    labelKey: "rmNotifiesCustomer" as const,
    subKey: "secureNotificationSent" as const,
    icon: Bell,
    color: "from-violet-500 to-violet-600",
  },
  {
    labelKey: "customerUploadsDocument" as const,
    subKey: "viaSecurePortal" as const,
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    labelKey: "aiValidatesDocument" as const,
    subKey: "automatedQualityCheck" as const,
    icon: Zap,
    color: "from-blue-500 to-indigo-600",
  },
  {
    labelKey: "rmContinuesProcess" as const,
    subKey: "actionCompleted" as const,
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
  },
];
const mockCompany: Company = {
  id: COMPANY_ID,
  name: "AlMadar Construction Group",
  industry: "Construction",
  sector: "Real Estate & Infrastructure",
  registration_number: "CR-1010234567",
  tax_id: "TAX-300123456",
  founded_year: 2001,
  headquarters: "Riyadh, Saudi Arabia",
  country: "Saudi Arabia",
  employees_count: 4500,
  annual_revenue: 2800000000,
  website: "https://almadar.example.com",
  description:
    "A leading construction and infrastructure company operating across Saudi Arabia.",
  relationship_manager: "Ahmed Al-Rashid",
  relationship_since: "2015-03-01",
  risk_rating: "Low",
  customer_segment: "Corporate",
  status: "Active",
  logo_initials: "AC",
};

const mockProducts: BankingProduct[] = [
  {
    id: "p1",
    company_id: COMPANY_ID,
    product_type: "Credit Facility",
    product_name: "Revolving Credit Facility",
    account_number: "CF-2023-0045",
    limit_amount: 500000000,
    outstanding_amount: 320000000,
    currency: "SAR",
    start_date: "2023-01-01",
    expiry_date: "2027-01-15",
    status: "Active",
  },
];

const mockStatements: FinancialStatement[] = [
  {
    id: "fs1",
    company_id: COMPANY_ID,
    year: 2023,
    total_assets: 4200000000,
    total_liabilities: 2800000000,
    total_equity: 1400000000,
    total_revenue: 2800000000,
    gross_profit: 620000000,
    operating_income: 380000000,
    net_income: 280000000,
    operating_cash_flow: 350000000,
    investing_cash_flow: -120000000,
    financing_cash_flow: -80000000,
    current_ratio: 1.85,
    debt_to_equity: 2.0,
    return_on_equity: 20,
    return_on_assets: 6.6,
    gross_margin: 22.1,
    net_margin: 10,
  },
];

const mockDocuments: CompanyDocument[] = [
  {
    id: "d1",
    company_id: COMPANY_ID,
    document_type: "Commercial Registration",
    document_name: "Commercial Registration",
    status: "Needs Update",
    expiry_date: "2026-08-15",
    upload_date: "2025-08-15",
    issuing_authority: "Ministry of Commerce",
    notes: "Commercial Registration expires within 90 days.",
    required_for: ["Credit Facility", "Corporate Account"],
  },
  {
    id: "d2",
    company_id: COMPANY_ID,
    document_type: "KYC Form",
    document_name: "Corporate KYC Form",
    status: "Needs Update",
    expiry_date: null,
    upload_date: "2024-01-01",
    issuing_authority: null,
    notes: "Annual KYC refresh is overdue.",
    required_for: ["Corporate Banking"],
  },
  {
    id: "d3",
    company_id: COMPANY_ID,
    document_type: "Financial Statements",
    document_name: "Audited Financial Statements 2023",
    status: "Complete",
    expiry_date: null,
    upload_date: "2024-03-01",
    issuing_authority: "External Auditor",
    notes: null,
    required_for: ["Credit Facility"],
  },
];

const mockTimeline: TimelineEvent[] = [
  {
    id: "t1",
    company_id: COMPANY_ID,
    event_type: "Meeting",
    title: "Quarterly Review Meeting",
    description: "Business review meeting with CFO and RM team.",
    event_date: "2024-01-15",
    created_by: "Ahmed Al-Rashid",
  },
  {
    id: "t2",
    company_id: COMPANY_ID,
    event_type: "Alert",
    title: "Commercial Registration Expiry Alert",
    description: "Commercial Registration due for renewal within 90 days.",
    event_date: "2023-10-10",
    created_by: "System",
  },
];
export default function Dashboard() {
  const [company, setCompany] = useState<Company | null>(null);
  const [ci, setCi] = useState<CompanyIntelligenceOutput | null>(null);
  const [fa, setFa] = useState<FinancialAnalysisOutput | null>(null);
  const [comp, setComp] = useState<ComplianceOutput | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [nba, setNba] = useState<NextBestActionOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const { t } = useLang();
  useEffect(() => {
    if (sessionStorage.getItem("ai-analyzed") === "true") {
      setShowBanner(true);
      sessionStorage.removeItem("ai-analyzed");
    }

    const co = mockCompany;
    const ciR = runCompanyIntelligenceAgent(co, mockProducts, mockTimeline);
    const faR = runFinancialAnalysisAgent(co, mockStatements);
    const compR = runComplianceAgent(co, mockDocuments);
    const nbaR = runNextBestActionAgent(co, ciR, faR, compR, mockProducts);

    setCompany(co);
    setCi(ciR);
    setFa(faR);
    setComp(compR);
    setNba(nbaR);
    setLoading(false);

    for (let i = 0; i <= workflowSteps.length; i++) {
      setTimeout(() => setPipelineStep(i), 600 + i * 350);
    }

    setTimeout(() => {
      setSummaryVisible(true);
      setTimeout(() => setTypingDone(true), 1200);
    }, 400);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-5 animate-fade-in">
          <div className="relative w-16 h-16 mx-auto">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            >
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div
              className="absolute inset-0 rounded-2xl animate-ping opacity-20"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
            />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {t.aiGenerating}
            </p>
            <p className="text-sm text-slate-400 mt-1">{t.running4Agents}</p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                style={{
                  animation: `typing-dot 1.2s ease-in-out infinite ${i * 200}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!company || !ci || !fa || !comp || !nba) return null;

  const missing = comp.checklist.filter((d) => d.status === "Missing").length;
  const needsUpdate = comp.checklist.filter(
    (d) => d.status === "Needs Update",
  ).length;
  const docSummary =
    missing > 0
      ? `${missing} document${missing > 1 ? "s" : ""} ${missing > 1 ? "are" : "is"} missing and must be submitted.`
      : needsUpdate > 0
        ? `${needsUpdate} document${needsUpdate > 1 ? "s" : ""} require renewal before expiry.`
        : "All required documents are complete and up to date.";
  const policySummary =
    comp.complianceScore >= 80
      ? "Customer meets minimum compliance requirements for corporate banking."
      : "Customer has outstanding compliance items that must be resolved.";

  const pBadge =
    priorityBadge[nba.primaryRecommendation.priority] || priorityBadge.Medium;

  const emailSubject = `Action Required: ${nba.primaryRecommendation.action}`;
  const emailBody = `Dear ${company.name},\n\nAs part of the corporate banking documentation review, your ${nba.primaryRecommendation.action.replace(/^(Request |Update |Obtain Missing )/, "")} requires attention.\n\n${nba.primaryRecommendation.reason}\n\nPlease upload the updated document through the secure customer action link provided by your Relationship Manager.\n\nThank you,\nCorporate Banking Team`;

  const statusCards = [
    {
      icon: Building2,
      label: t.company,
      value: t.stable,
      sub: company.industry,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200/60 dark:border-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
    },
    {
      icon: TrendingUp,
      label: t.financial,
      value: fa.healthLabel,
      sub: `${fa.healthScore}/100`,
      gradient:
        fa.healthScore >= 70
          ? "from-emerald-500 to-emerald-600"
          : "from-amber-500 to-amber-600",
      bg:
        fa.healthScore >= 70
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-amber-50 dark:bg-amber-950/30",
      border:
        fa.healthScore >= 70
          ? "border-emerald-200/60 dark:border-emerald-900/40"
          : "border-amber-200/60 dark:border-amber-900/40",
      text:
        fa.healthScore >= 70
          ? "text-emerald-700 dark:text-emerald-300"
          : "text-amber-700 dark:text-amber-300",
    },
    {
      icon: FileText,
      label: t.documents,
      value:
        missing + needsUpdate > 0
          ? `${missing + needsUpdate} ${t.issues}`
          : t.complete,
      sub:
        missing + needsUpdate > 0
          ? `${missing} ${t.missing}, ${needsUpdate} ${t.expiring}`
          : t.allValid,
      gradient:
        missing > 0
          ? "from-red-500 to-red-600"
          : needsUpdate > 0
            ? "from-amber-500 to-amber-600"
            : "from-emerald-500 to-emerald-600",
      bg:
        missing > 0
          ? "bg-red-50 dark:bg-red-950/30"
          : needsUpdate > 0
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-emerald-50 dark:bg-emerald-950/30",
      border:
        missing > 0
          ? "border-red-200/60 dark:border-red-900/40"
          : needsUpdate > 0
            ? "border-amber-200/60 dark:border-amber-900/40"
            : "border-emerald-200/60 dark:border-emerald-900/40",
      text:
        missing > 0
          ? "text-red-700 dark:text-red-300"
          : needsUpdate > 0
            ? "text-amber-700 dark:text-amber-300"
            : "text-emerald-700 dark:text-emerald-300",
    },
    {
      icon: ShieldCheck,
      label: t.policy,
      value: comp.overallStatus,
      sub: `${comp.complianceScore}%`,
      gradient:
        comp.overallStatus === "Compliant"
          ? "from-violet-500 to-violet-600"
          : "from-amber-500 to-amber-600",
      bg:
        comp.overallStatus === "Compliant"
          ? "bg-violet-50 dark:bg-violet-950/30"
          : "bg-amber-50 dark:bg-amber-950/30",
      border:
        comp.overallStatus === "Compliant"
          ? "border-violet-200/60 dark:border-violet-900/40"
          : "border-amber-200/60 dark:border-amber-900/40",
      text:
        comp.overallStatus === "Compliant"
          ? "text-violet-700 dark:text-violet-300"
          : "text-amber-700 dark:text-amber-300",
    },
  ];

  const aiFindings = [
    {
      num: "01",
      title: t.companyIntelligenceTitle,
      insight: ci.keyInsights[0] || ci.executiveSummary.split(".")[0] + ".",
      color: "text-blue-600 dark:text-blue-400",
      dotColor: "bg-blue-500",
    },
    {
      num: "02",
      title: t.financialHealthTitle,
      insight: fa.strengths[0] || fa.narrativeSummary.split(".")[0] + ".",
      color: "text-emerald-600 dark:text-emerald-400",
      dotColor: "bg-emerald-500",
    },
    {
      num: "03",
      title: t.documentStatusTitle,
      insight: docSummary,
      color:
        missing > 0
          ? "text-red-600 dark:text-red-400"
          : "text-amber-600 dark:text-amber-400",
      dotColor: missing > 0 ? "bg-red-500" : "bg-amber-500",
    },
    {
      num: "04",
      title: t.policyComplianceTitle,
      insight: policySummary,
      color: "text-violet-600 dark:text-violet-400",
      dotColor: "bg-violet-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* WELCOME BANNER */}
      {showBanner && <WelcomeBanner onDismiss={() => setShowBanner(false)} />}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          <div className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            {toast}
          </div>
        </div>
      )}

      {/* EMAIL MODAL */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <div className="glass-card rounded-3xl w-full max-w-lg animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {t.aiGeneratedEmail}
                </span>
              </div>
              <button
                onClick={() => setEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t.subject}
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-white/[0.05] rounded-xl px-3 py-2 border border-slate-200/60 dark:border-white/[0.08]">
                  {emailSubject}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  {t.body}
                </p>
                <pre className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 dark:bg-white/[0.04] rounded-xl p-4 border border-slate-200/60 dark:border-white/[0.08] text-[13px]">
                  {emailBody}
                </pre>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-2.5">
              <button
                onClick={() =>
                  handleCopy(`Subject: ${emailSubject}\n\n${emailBody}`)
                }
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? t.copied : t.copyEmail}
              </button>
              <button
                onClick={() => {
                  setEmailModal(false);
                  showToast(t.notificationSent);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {t.sendNotification}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          HERO BANNER
          ================================================================ */}
      <div className="relative overflow-hidden">
        <div className="ai-hero-gradient px-6 py-10 lg:px-10 lg:py-12">
          {/* Orbs */}
          <div
            className="absolute top-0 right-0 w-96 h-96 opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 70% 30%, rgba(139,92,246,0.5), transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-64 h-64 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.6), transparent 60%)",
            }}
          />

          <div className="relative max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-3 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white/80 tracking-wide">
                  {t.aiAnalysisComplete}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Corporate Banking AI Copilot
                <br />
                <span className="text-blue-200">
                  From scattered customer data to a clear banking decision.
                </span>
              </h1>
              <p className="text-sm lg:text-base text-white/75 max-w-xl leading-relaxed">
                AI analyzes financial health, documents, and compliance—then
                recommends the next action for the Relationship Manager.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">
                    {company.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/80">
                    {t.aiAgentsActive}
                  </span>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden sm:flex items-center justify-center animate-ai-float shrink-0">
              <div className="relative w-36 h-36">
                <div
                  className="absolute inset-0 rounded-3xl opacity-30 animate-spin-slow"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)",
                    padding: "2px",
                  }}
                >
                  <div className="w-full h-full rounded-3xl bg-transparent" />
                </div>
                <div
                  className="absolute inset-2 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <Brain className="w-14 h-14 text-white opacity-90" />
                </div>
                {/* Orbiting dots */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full bg-blue-300 opacity-70"
                      style={{
                        animation: `orbit ${2 + i * 0.5}s linear infinite ${i * 90}deg`,
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="h-6 relative overflow-hidden -mt-1">
          <div className="absolute inset-0 ai-hero-gradient" />
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-background rounded-t-[2rem]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12 space-y-10 -mt-2">
        {/* AI SUMMARY BAR */}
        <section className="animate-slide-up">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Today&apos;s AI Summary
                </p>

                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Customer analysis at a glance
                </h2>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  AI Confidence
                </p>

                <p className="text-xl font-extrabold text-blue-700 dark:text-blue-300">
                  96%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-900/40">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Financial Health
                </p>

                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                  {fa.healthLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-4 border border-blue-200 dark:border-blue-900/40">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Company Status
                </p>

                <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                  {company.status}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-900/40">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Documents
                </p>

                <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">
                  {missing + needsUpdate} Need Update
                </p>
              </div>

              <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-4 border border-violet-200 dark:border-violet-900/40">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Compliance
                </p>

                <p className="text-lg font-extrabold text-violet-700 dark:text-violet-300">
                  {comp.overallStatus}
                </p>
              </div>

              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 p-4 border border-indigo-200 dark:border-indigo-900/40">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Recommendation
                </p>

                <p className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300 leading-snug">
                  {nba.primaryRecommendation.action}
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ================================================================
            CUSTOMER INFO
            ================================================================ */}
        <section className="animate-slide-up">
          <SectionLabel>{t.customerOverview}</SectionLabel>
          <div className="glass-card rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1e40af, #4f46e5)",
                }}
              >
                {company.logo_initials ||
                  company.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {company.name}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.activeCustomer}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {company.industry} · {company.customer_segment} ·{" "}
                  {company.risk_rating} Risk
                </p>
              </div>
              <div className="shrink-0">
                <span className="text-[11px] font-bold tracking-wide text-slate-400 dark:text-slate-500">
                  {t.rm}: Ahmed Al-Rashid
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: t.founded, v: company.founded_year.toString() },
                { l: t.employees, v: company.employees_count.toLocaleString() },
                {
                  l: t.clientSince,
                  v: company?.relationship_since
                    ? new Date(company.relationship_since)
                        .getFullYear()
                        .toString()
                    : "-",
                },
                { l: t.hq, v: company.headquarters },
              ].map(({ l, v }) => (
                <div
                  key={l}
                  className="card-lift-sm bg-slate-50/80 dark:bg-white/[0.04] rounded-2xl px-3 py-3 border border-slate-200/40 dark:border-white/[0.06] cursor-default"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {l}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            STATUS CARDS
            ================================================================ */}

        {/* ================================================================
            AI EXECUTIVE SUMMARY (glass card with typing animation)
            ================================================================ */}
        <section>
          <SectionLabel>Customer Summary</SectionLabel>

          <div className="glass-card-blue rounded-3xl p-6 border">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>

              <p className="text-[11px] font-extrabold tracking-widest text-blue-600 dark:text-blue-400 uppercase">
                AI Summary
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Low-risk corporate customer with strong financial health.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  2 compliance documents require renewal.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  AI recommends renewing the Commercial Registration before
                  credit processing continues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            AI FINDINGS CARDS
            ================================================================ */}
        <section>
          <SectionLabel>{t.whatAIFound}</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiFindings.map(({ num, title, insight, color, dotColor }, i) => (
              <div
                key={num}
                className="card-lift glass-card rounded-2xl p-5 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-extrabold ${color} tracking-widest`}
                    >
                      {num}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${dotColor} shrink-0`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {title}
                      </p>
                      <span className="ai-badge">AI</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            RECOMMENDED NEXT ACTION
            ================================================================ */}
        <section>
          <SectionLabel>{t.recommendedNextAction}</SectionLabel>
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Gradient top bar */}
            <div
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
              }}
            />

            <div className="px-6 pt-6 pb-5 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {t.aiRecommendation}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${pBadge}`}
                >
                  {nba.primaryRecommendation.priority} {t.prioritySuffix}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                {nba.primaryRecommendation.action}
              </h2>

              <div className="space-y-0 divide-y divide-slate-100/80 dark:divide-white/[0.06]">
                <InfoRow
                  label={t.reason}
                  value={nba.primaryRecommendation.reason}
                />
                <InfoRow
                  label={t.businessImpact}
                  value={nba.primaryRecommendation.businessImpact}
                />
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                  {t.actionRequired30Days}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex flex-wrap gap-2.5">
              <button
                className="btn-press flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-ai-sm"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #4f46e5)",
                }}
              >
                {t.takeAction}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => showToast(t.notificationSent)}
                className="btn-press flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {t.notifyCustomer}
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="btn-press flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] text-sm font-bold rounded-xl transition-all active:scale-95"
              >
                <Mail className="w-4 h-4" />
                {t.generateEmail}
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            ANIMATED AI PIPELINE
            ================================================================ */}
        <section>
          <SectionLabel>{t.endToEndWorkflow}</SectionLabel>
          <div className="glass-card rounded-3xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-0">
              {workflowSteps.map(
                ({ labelKey, subKey, icon: Icon, color }, i) => {
                  const label = t[labelKey];
                  const sub = t[subKey];
                  const active = pipelineStep > i;
                  return (
                    <div
                      key={label}
                      className="flex lg:flex-col items-center flex-1 gap-0"
                    >
                      <div className="flex lg:flex-col items-center w-full gap-0">
                        {/* Connector before */}
                        {i > 0 && (
                          <div
                            className={`hidden lg:block h-px flex-1 transition-all duration-500 ${active ? "pipeline-connector bg-gradient-to-r from-blue-400 to-violet-500" : "bg-slate-200 dark:bg-white/10"}`}
                            style={{
                              height: "2px",
                              transitionDelay: `${i * 350}ms`,
                            }}
                          />
                        )}
                        {i > 0 && (
                          <div
                            className={`lg:hidden w-px h-5 transition-all duration-500 ${active ? "bg-gradient-to-b from-blue-400 to-violet-500" : "bg-slate-200 dark:bg-white/10"}`}
                            style={{ transitionDelay: `${i * 350}ms` }}
                          />
                        )}

                        {/* Step circle */}
                        <div
                          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 cursor-default hover:scale-110 ${
                            active
                              ? `bg-gradient-to-br ${color} shadow-md`
                              : "bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]"
                          }`}
                          style={{ transitionDelay: `${i * 350}ms` }}
                        >
                          <Icon
                            className={`w-5 h-5 transition-colors duration-500 ${active ? "text-white" : "text-slate-400 dark:text-slate-600"}`}
                          />
                          {active && (
                            <div
                              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-30 animate-ping`}
                            />
                          )}
                        </div>

                        {/* Connector after */}
                        {i < workflowSteps.length - 1 && (
                          <div
                            className={`hidden lg:block h-px flex-1 transition-all duration-500 ${pipelineStep > i + 1 ? "bg-gradient-to-r from-violet-400 to-blue-500" : "bg-slate-200 dark:bg-white/10"}`}
                            style={{
                              height: "2px",
                              transitionDelay: `${(i + 0.5) * 350}ms`,
                            }}
                          />
                        )}
                        {i < workflowSteps.length - 1 && (
                          <div
                            className={`lg:hidden w-px h-5 transition-all duration-500 ${pipelineStep > i + 1 ? "bg-gradient-to-b from-violet-400 to-blue-500" : "bg-slate-200 dark:bg-white/10"}`}
                            style={{ transitionDelay: `${(i + 0.5) * 350}ms` }}
                          />
                        )}
                      </div>

                      <div
                        className={`lg:text-center px-1 py-2 lg:py-3 space-y-0.5 transition-all duration-500 ${active ? "opacity-100" : "opacity-40"}`}
                        style={{ transitionDelay: `${i * 350}ms` }}
                      >
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {label}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight hidden lg:block">
                          {sub}
                        </p>
                      </div>

                      {/* Mobile arrow */}
                      {i < workflowSteps.length - 1 && (
                        <ArrowDown className="lg:hidden w-3 h-3 text-slate-300 dark:text-slate-600 -my-1 ml-auto mr-5" />
                      )}
                    </div>
                  );
                },
              )}
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6 pt-5 border-t border-slate-100/80 dark:border-white/[0.06]">
              {t.aiMonitorsEveryStep}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500 mb-3">
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-3.5">
      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        {value}
      </p>
    </div>
  );
}
