'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, TrendingUp, FileText, ShieldCheck, CreditCard, Landmark, Building2, CircleAlert as AlertCircle, CircleCheck as CheckCircle2, Clock, ChevronDown, ChevronUp, Users, Sparkles, Activity } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FinancingType =
  | 'All'
  | 'tamayoz'
  | 'entrepreneurs'
  | 'franchise'
  | 'sme'
  | 'working-capital'
  | 'equipment'
  | 'trade'
  | 'supply-chain'
  | 'invoice'
  | 'project'
  | 'real-estate';

type Status = 'Under Review' | 'Pending Documents' | 'Approved' | 'Action Required' | 'Rejected';
type Risk   = 'Low' | 'Medium' | 'High';

type CompanyApplication = {
  id: string;
  companyName: string;
  initials: string;
  color: string;
  sector: string;
  financingType: FinancingType;
  requestedAmount: number;
  purpose: string;
  tenure: string;
  status: Status;
  aiEligibility: number;
  riskScore: Risk;
  submittedDate: string;
  rmName: string;
  missingDocs: number;
};

// ── Filter definitions ────────────────────────────────────────────────────────

const FILTERS: {
  key: FinancingType;
  labelAr: string;
  labelEn: string;
  icon: typeof Landmark;
  color: string;
  iconBg: string;
}[] = [
  { key: 'All',           labelAr: 'جميع الطلبات',                        labelEn: 'All Requests',            icon: SlidersHorizontal, color: 'text-slate-600',   iconBg: 'bg-slate-100 dark:bg-slate-800' },
  { key: 'tamayoz',       labelAr: 'تمويل التميّز',                       labelEn: 'Tamweel Al-Tamayoz',      icon: Sparkles,          color: 'text-amber-600',   iconBg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'entrepreneurs', labelAr: 'تمويل رواد الأعمال',                  labelEn: 'Entrepreneurs Finance',   icon: TrendingUp,        color: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'franchise',     labelAr: 'تمويل الامتياز التجاري',              labelEn: 'Commercial Franchise',    icon: Building2,         color: 'text-blue-600',    iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'sme',           labelAr: 'تمويل المنشآت الصغيرة والمتوسطة',    labelEn: 'SME Finance',             icon: Users,             color: 'text-violet-600',  iconBg: 'bg-violet-50 dark:bg-violet-900/20' },
  { key: 'working-capital',labelAr: 'تمويل رأس المال العامل',             labelEn: 'Working Capital Finance', icon: Activity,          color: 'text-cyan-600',    iconBg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { key: 'equipment',     labelAr: 'تمويل المعدات والأصول',               labelEn: 'Equipment & Asset Finance',icon: Landmark,         color: 'text-orange-600',  iconBg: 'bg-orange-50 dark:bg-orange-900/20' },
  { key: 'trade',         labelAr: 'تمويل التجارة',                       labelEn: 'Trade Finance',           icon: FileText,          color: 'text-indigo-600',  iconBg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { key: 'supply-chain',  labelAr: 'تمويل سلاسل الإمداد',                labelEn: 'Supply Chain Finance',    icon: Activity,          color: 'text-teal-600',    iconBg: 'bg-teal-50 dark:bg-teal-900/20' },
  { key: 'invoice',       labelAr: 'تمويل الفواتير',                      labelEn: 'Invoice Financing',       icon: CreditCard,        color: 'text-rose-600',    iconBg: 'bg-rose-50 dark:bg-rose-900/20' },
  { key: 'project',       labelAr: 'تمويل المشاريع',                      labelEn: 'Project Finance',         icon: CheckCircle2,      color: 'text-blue-700',    iconBg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'real-estate',   labelAr: 'التمويل العقاري التجاري',             labelEn: 'Real Estate Finance',     icon: ShieldCheck,       color: 'text-green-700',   iconBg: 'bg-green-50 dark:bg-green-900/20' },
];

// ── Mock data ─────────────────────────────────────────────────────────────────

const APPLICATIONS: CompanyApplication[] = [
  // تمويل التميّز
  { id: 'a01', companyName: 'نور للتقنية الرقمية', initials: 'نت', color: 'from-amber-500 to-orange-600', sector: 'تقنية المعلومات', financingType: 'tamayoz', requestedAmount: 2_500_000, purpose: 'توسعة الأعمال', tenure: '5 سنوات', status: 'Under Review', aiEligibility: 94, riskScore: 'Low', submittedDate: '2025-07-01', rmName: 'أحمد الرشيد', missingDocs: 0 },
  { id: 'a02', companyName: 'مجموعة الرائد للاستشارات', initials: 'ار', color: 'from-amber-600 to-yellow-700', sector: 'الاستشارات المالية', financingType: 'tamayoz', requestedAmount: 5_000_000, purpose: 'تطوير الكوادر وبناء الطاقة التشغيلية', tenure: '7 سنوات', status: 'Approved', aiEligibility: 89, riskScore: 'Low', submittedDate: '2025-06-20', rmName: 'سارة العتيبي', missingDocs: 0 },
  { id: 'a03', companyName: 'هلال للخدمات الإدارية', initials: 'هخ', color: 'from-yellow-500 to-amber-700', sector: 'خدمات الأعمال', financingType: 'tamayoz', requestedAmount: 1_800_000, purpose: 'رقمنة العمليات الداخلية', tenure: '3 سنوات', status: 'Pending Documents', aiEligibility: 76, riskScore: 'Medium', submittedDate: '2025-07-08', rmName: 'خالد الدوسري', missingDocs: 2 },

  // تمويل رواد الأعمال
  { id: 'a04', companyName: 'ريادة لحلول الذكاء الاصطناعي', initials: 'رذ', color: 'from-emerald-500 to-green-700', sector: 'الذكاء الاصطناعي', financingType: 'entrepreneurs', requestedAmount: 1_200_000, purpose: 'بناء منصة SaaS للقطاع الصحي', tenure: '4 سنوات', status: 'Under Review', aiEligibility: 88, riskScore: 'Low', submittedDate: '2025-07-05', rmName: 'فاطمة الزهراني', missingDocs: 0 },
  { id: 'a05', companyName: 'مسار للتعليم الإلكتروني', initials: 'مع', color: 'from-green-500 to-teal-600', sector: 'التعليم والتدريب', financingType: 'entrepreneurs', requestedAmount: 800_000, purpose: 'توسعة محتوى المنصة التعليمية', tenure: '3 سنوات', status: 'Approved', aiEligibility: 91, riskScore: 'Low', submittedDate: '2025-06-28', rmName: 'أحمد الرشيد', missingDocs: 0 },
  { id: 'a06', companyName: 'نبض للخدمات الصحية الرقمية', initials: 'نص', color: 'from-teal-500 to-emerald-700', sector: 'الرعاية الصحية', financingType: 'entrepreneurs', requestedAmount: 2_000_000, purpose: 'تطوير تطبيق الرعاية الصحية عن بعد', tenure: '5 سنوات', status: 'Action Required', aiEligibility: 72, riskScore: 'Medium', submittedDate: '2025-07-10', rmName: 'سارة العتيبي', missingDocs: 3 },

  // تمويل الامتياز التجاري
  { id: 'a07', companyName: 'أفق للمطاعم السعودية', initials: 'أم', color: 'from-blue-500 to-indigo-600', sector: 'قطاع الأغذية والمطاعم', financingType: 'franchise', requestedAmount: 3_500_000, purpose: 'فتح 5 فروع جديدة بنظام الامتياز', tenure: '6 سنوات', status: 'Under Review', aiEligibility: 85, riskScore: 'Low', submittedDate: '2025-07-03', rmName: 'خالد الدوسري', missingDocs: 1 },
  { id: 'a08', companyName: 'توسع للتجزئة الحديثة', initials: 'تح', color: 'from-blue-600 to-sky-700', sector: 'التجزئة', financingType: 'franchise', requestedAmount: 6_200_000, purpose: 'توسعة شبكة متاجر الامتياز في المنطقة الشرقية', tenure: '8 سنوات', status: 'Pending Documents', aiEligibility: 79, riskScore: 'Medium', submittedDate: '2025-06-25', rmName: 'فاطمة الزهراني', missingDocs: 2 },

  // تمويل المنشآت الصغيرة والمتوسطة
  { id: 'a09', companyName: 'الخليج للصناعات الخفيفة', initials: 'خص', color: 'from-violet-500 to-purple-700', sector: 'الصناعات التحويلية', financingType: 'sme', requestedAmount: 4_500_000, purpose: 'شراء معدات إنتاجية وتوسعة المصنع', tenure: '5 سنوات', status: 'Approved', aiEligibility: 87, riskScore: 'Low', submittedDate: '2025-06-15', rmName: 'أحمد الرشيد', missingDocs: 0 },
  { id: 'a10', companyName: 'بيئة للاستدامة البيئية', initials: 'بس', color: 'from-purple-500 to-violet-700', sector: 'البيئة والاستدامة', financingType: 'sme', requestedAmount: 2_800_000, purpose: 'تطوير تقنيات إعادة التدوير', tenure: '4 سنوات', status: 'Under Review', aiEligibility: 83, riskScore: 'Low', submittedDate: '2025-07-07', rmName: 'سارة العتيبي', missingDocs: 0 },
  { id: 'a11', companyName: 'درع للأمن السيبراني', initials: 'دأ', color: 'from-indigo-500 to-violet-600', sector: 'أمن المعلومات', financingType: 'sme', requestedAmount: 1_500_000, purpose: 'توسعة فريق التطوير وبنية تحتية الخوادم', tenure: '3 سنوات', status: 'Action Required', aiEligibility: 68, riskScore: 'High', submittedDate: '2025-07-11', rmName: 'خالد الدوسري', missingDocs: 4 },

  // تمويل رأس المال العامل
  { id: 'a12', companyName: 'نخيل للتوزيع الغذائي', initials: 'نغ', color: 'from-cyan-500 to-teal-600', sector: 'توزيع المواد الغذائية', financingType: 'working-capital', requestedAmount: 7_000_000, purpose: 'تمويل موسم الذروة وتوسعة المخزون', tenure: 'سنة واحدة متجددة', status: 'Approved', aiEligibility: 92, riskScore: 'Low', submittedDate: '2025-07-02', rmName: 'فاطمة الزهراني', missingDocs: 0 },
  { id: 'a13', companyName: 'إثراء للمقاولات العامة', initials: 'إم', color: 'from-teal-500 to-cyan-700', sector: 'المقاولات', financingType: 'working-capital', requestedAmount: 12_000_000, purpose: 'تغطية التزامات المشاريع الجارية', tenure: '18 شهراً', status: 'Under Review', aiEligibility: 78, riskScore: 'Medium', submittedDate: '2025-07-06', rmName: 'أحمد الرشيد', missingDocs: 1 },

  // تمويل المعدات والأصول
  { id: 'a14', companyName: 'سرعة للنقل والخدمات اللوجستية', initials: 'سن', color: 'from-orange-500 to-amber-600', sector: 'النقل واللوجستيات', financingType: 'equipment', requestedAmount: 9_500_000, purpose: 'شراء أسطول مركبات ثقيلة جديد', tenure: '5 سنوات', status: 'Under Review', aiEligibility: 86, riskScore: 'Low', submittedDate: '2025-07-04', rmName: 'سارة العتيبي', missingDocs: 0 },
  { id: 'a15', companyName: 'الصناعات الدقيقة المتقدمة', initials: 'صد', color: 'from-orange-600 to-red-600', sector: 'التصنيع الدقيق', financingType: 'equipment', requestedAmount: 15_000_000, purpose: 'خط إنتاج CNC ومعدات التصنيع المتقدمة', tenure: '7 سنوات', status: 'Pending Documents', aiEligibility: 81, riskScore: 'Medium', submittedDate: '2025-06-29', rmName: 'خالد الدوسري', missingDocs: 2 },

  // تمويل التجارة
  { id: 'a16', companyName: 'الواردات الاستراتيجية للبتروكيماويات', initials: 'وب', color: 'from-indigo-500 to-blue-700', sector: 'البتروكيماويات', financingType: 'trade', requestedAmount: 22_000_000, purpose: 'اعتمادات مستندية لاستيراد المواد الخام', tenure: '90 يوم', status: 'Approved', aiEligibility: 95, riskScore: 'Low', submittedDate: '2025-06-18', rmName: 'فاطمة الزهراني', missingDocs: 0 },
  { id: 'a17', companyName: 'ترانس خليج للتجارة الدولية', initials: 'تج', color: 'from-blue-500 to-indigo-700', sector: 'التجارة الدولية', financingType: 'trade', requestedAmount: 8_700_000, purpose: 'تمويل صفقة تصدير منتجات البلاستيك', tenure: '120 يوم', status: 'Under Review', aiEligibility: 82, riskScore: 'Low', submittedDate: '2025-07-09', rmName: 'أحمد الرشيد', missingDocs: 1 },

  // تمويل سلاسل الإمداد
  { id: 'a18', companyName: 'مدار للتوريد والمشتريات', initials: 'مت', color: 'from-teal-600 to-green-700', sector: 'المشتريات والتوريد', financingType: 'supply-chain', requestedAmount: 5_500_000, purpose: 'تمويل الموردين الرئيسيين في سلسلة الإمداد', tenure: '2 سنة', status: 'Under Review', aiEligibility: 84, riskScore: 'Low', submittedDate: '2025-07-01', rmName: 'سارة العتيبي', missingDocs: 0 },
  { id: 'a19', companyName: 'سلاسل المملكة للخدمات اللوجستية', initials: 'سم', color: 'from-green-600 to-teal-700', sector: 'اللوجستيات', financingType: 'supply-chain', requestedAmount: 11_000_000, purpose: 'تمويل الحلقة الوسيطة في سلسلة توريد الأجهزة الإلكترونية', tenure: '3 سنوات', status: 'Pending Documents', aiEligibility: 77, riskScore: 'Medium', submittedDate: '2025-07-03', rmName: 'خالد الدوسري', missingDocs: 2 },

  // تمويل الفواتير
  { id: 'a20', companyName: 'تقنيات الجزيرة للمقاولات', initials: 'تق', color: 'from-rose-500 to-red-600', sector: 'المقاولات والتشييد', financingType: 'invoice', requestedAmount: 3_200_000, purpose: 'تمويل فواتير مستحقة لعقود حكومية', tenure: '6 أشهر', status: 'Approved', aiEligibility: 90, riskScore: 'Low', submittedDate: '2025-06-22', rmName: 'فاطمة الزهراني', missingDocs: 0 },
  { id: 'a21', companyName: 'الرياض للخدمات الهندسية', initials: 'ره', color: 'from-red-500 to-rose-700', sector: 'الخدمات الهندسية', financingType: 'invoice', requestedAmount: 1_900_000, purpose: 'خصم فواتير عقود الصيانة الدورية', tenure: '3 أشهر', status: 'Under Review', aiEligibility: 88, riskScore: 'Low', submittedDate: '2025-07-08', rmName: 'أحمد الرشيد', missingDocs: 0 },

  // تمويل المشاريع
  { id: 'a22', companyName: 'مجموعة المدار للإنشاء والتطوير', initials: 'مم', color: 'from-blue-700 to-indigo-800', sector: 'الإنشاء والتطوير العقاري', financingType: 'project', requestedAmount: 80_000_000, purpose: 'تمويل مشروع سكني تجاري متكامل في نيوم', tenure: '10 سنوات', status: 'Pending Documents', aiEligibility: 80, riskScore: 'Medium', submittedDate: '2025-06-25', rmName: 'سارة العتيبي', missingDocs: 3 },
  { id: 'a23', companyName: 'سلام للطاقة المتجددة', initials: 'سط', color: 'from-sky-600 to-blue-800', sector: 'الطاقة المتجددة', financingType: 'project', requestedAmount: 120_000_000, purpose: 'إنشاء محطة طاقة شمسية بقدرة 200 ميغاواط', tenure: '15 سنة', status: 'Under Review', aiEligibility: 88, riskScore: 'Medium', submittedDate: '2025-07-02', rmName: 'خالد الدوسري', missingDocs: 1 },

  // التمويل العقاري التجاري
  { id: 'a24', companyName: 'ديار المملكة للتطوير العقاري', initials: 'دم', color: 'from-green-600 to-emerald-800', sector: 'التطوير العقاري', financingType: 'real-estate', requestedAmount: 45_000_000, purpose: 'شراء وتطوير برج تجاري في الرياض', tenure: '12 سنة', status: 'Under Review', aiEligibility: 82, riskScore: 'Medium', submittedDate: '2025-07-04', rmName: 'فاطمة الزهراني', missingDocs: 1 },
  { id: 'a25', companyName: 'الإتقان للمجمعات التجارية', initials: 'إت', color: 'from-emerald-600 to-green-800', sector: 'المجمعات التجارية', financingType: 'real-estate', requestedAmount: 62_000_000, purpose: 'إنشاء مركز تجاري متعدد الطوابق في جدة', tenure: '15 سنة', status: 'Approved', aiEligibility: 91, riskScore: 'Low', submittedDate: '2025-06-17', rmName: 'أحمد الرشيد', missingDocs: 0 },
];

// ── UI config ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Status, {
  label: string; labelAr: string;
  dot: string; text: string; bg: string;
}> = {
  'Approved':          { label: 'Approved',       labelAr: 'معتمد',            dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/60' },
  'Under Review':      { label: 'Under Review',   labelAr: 'قيد المراجعة',     dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-300',       bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/60' },
  'Pending Documents': { label: 'Pending Docs',   labelAr: 'ينتظر مستندات',    dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-300',     bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/60' },
  'Action Required':   { label: 'Action Required',labelAr: 'إجراء مطلوب',      dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-300',         bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/60' },
  'Rejected':          { label: 'Rejected',       labelAr: 'مرفوض',            dot: 'bg-slate-400',   text: 'text-slate-600 dark:text-slate-400',     bg: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700' },
};

const RISK_CFG: Record<Risk, { label: string; text: string; bg: string; bar: string }> = {
  Low:    { label: 'Low',    text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20',  bar: 'bg-emerald-500' },
  Medium: { label: 'Medium', text: 'text-amber-700 dark:text-amber-300',     bg: 'bg-amber-50 dark:bg-amber-900/20',      bar: 'bg-amber-500' },
  High:   { label: 'High',   text: 'text-red-700 dark:text-red-300',         bg: 'bg-red-50 dark:bg-red-900/20',          bar: 'bg-red-500' },
};

function fmtAmt(n: number) {
  if (!n) return '—';
  if (n >= 1_000_000) return `SAR ${(n / 1_000_000).toFixed(1)}M`;
  return `SAR ${(n / 1_000).toFixed(0)}K`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-SA', { day: 'numeric', month: 'short', year: 'numeric' });
}

function aiColor(score: number) {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function aiBg(score: number) {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

// ── Company card ──────────────────────────────────────────────────────────────

function CompanyCard({ app }: { app: CompanyApplication }) {
  const st = STATUS_CFG[app.status];
  const rt = RISK_CFG[app.riskScore];
  const filter = FILTERS.find(f => f.key === app.financingType)!;
  const TypeIcon = filter.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col overflow-hidden">

      {/* Accent stripe */}
      <div className={`h-1 bg-gradient-to-r ${app.color} opacity-80`} />

      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Company header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-extrabold bg-gradient-to-br ${app.color} shadow-sm`}>
              {app.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight truncate">{app.companyName}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{app.sector}</p>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.labelAr}
          </span>
        </div>

        {/* Financing product badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${filter.iconBg}`}>
          <TypeIcon className={`w-4 h-4 shrink-0 ${filter.color}`} />
          <div className="min-w-0">
            <p className={`text-xs font-extrabold ${filter.color} truncate`}>{filter.labelAr}</p>
            <p className="text-[10px] text-slate-400 truncate">{filter.labelEn}</p>
          </div>
        </div>

        {/* Core fields grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">المبلغ المطلوب</p>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fmtAmt(app.requestedAmount)}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">مدة التمويل</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />{app.tenure}
            </p>
          </div>
          <div className="col-span-2 space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الغرض من التمويل</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{app.purpose}</p>
          </div>
        </div>

        {/* AI Eligibility + Risk */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">

          {/* AI Eligibility */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Eligibility</p>
              </div>
              <span className={`text-sm font-extrabold ${aiColor(app.aiEligibility)}`}>{app.aiEligibility}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${aiBg(app.aiEligibility)}`} style={{ width: `${app.aiEligibility}%` }} />
            </div>
          </div>

          {/* Risk score */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Score</p>
              </div>
              <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${rt.bg} ${rt.text}`}>{rt.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className={`h-full rounded-full ${rt.bar}`} style={{ width: app.riskScore === 'Low' ? '30%' : app.riskScore === 'Medium' ? '60%' : '90%' }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {app.rmName.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{app.rmName}</span>
          </div>
          <div className="flex items-center gap-2">
            {app.missingDocs > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="w-3 h-3" />{app.missingDocs}
              </span>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />{fmtDate(app.submittedDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinancingRequestsPage() {
  const [activeFilter, setActiveFilter] = useState<FinancingType>('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return APPLICATIONS.filter(app => {
      if (activeFilter !== 'All' && app.financingType !== activeFilter) return false;
      if (statusFilter !== 'All' && app.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !app.companyName.toLowerCase().includes(q) &&
          !app.purpose.toLowerCase().includes(q) &&
          !app.sector.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [activeFilter, search, statusFilter]);

  const countFor = (key: FinancingType) =>
    key === 'All' ? APPLICATIONS.length : APPLICATIONS.filter(a => a.financingType === key).length;

  const actionCount = filtered.filter(a => a.status === 'Action Required' || a.status === 'Pending Documents').length;
  const approvedCount = filtered.filter(a => a.status === 'Approved').length;
  const totalAmt = filtered.reduce((s, a) => s + a.requestedAmount, 0);

  const activeFilterMeta = FILTERS.find(f => f.key === activeFilter)!;
  const ActiveFilterIcon = activeFilterMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Corporate Banking</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">طلبات التمويل</h1>
            <p className="text-sm text-slate-500 mt-1">Financing Requests — filter by product type to review pending applications</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total Requests', value: filtered.length, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
              { label: 'Needs Attention', value: actionCount, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
              { label: 'Approved', value: approvedCount, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${s.bg}`}>
                <span className={`text-lg font-extrabold leading-none ${s.color}`}>{s.value}</span>
                <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Total portfolio amount ── */}
        {activeFilter !== 'All' && totalAmt > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeFilterMeta.iconBg}`}>
              <ActiveFilterIcon className={`w-4 h-4 ${activeFilterMeta.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{activeFilterMeta.labelAr} — Total Requested</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{fmtAmt(totalAmt)}</p>
            </div>
          </div>
        )}

        {/* ── Search + secondary filters ── */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search company, purpose, sector..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showFilters && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Status | 'All')}
              className="text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Pending Documents">Pending Documents</option>
              <option value="Approved">Approved</option>
              <option value="Action Required">Action Required</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}
          {(search || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('All'); }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Financing type filter tabs (scrollable) ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
          {FILTERS.map(({ key, labelAr, labelEn, icon: Icon }) => {
            const active = activeFilter === key;
            const count  = countFor(key);
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap leading-none">{labelAr}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Active filter label ── */}
        {activeFilter !== 'All' && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${activeFilterMeta.iconBg}`}>
              <ActiveFilterIcon className={`w-3.5 h-3.5 ${activeFilterMeta.color}`} />
              <span className={`${activeFilterMeta.color}`}>{activeFilterMeta.labelAr}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {/* ── Cards grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(app => <CompanyCard key={app.id} app={app} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications found</p>
              <p className="text-xs text-slate-400 mt-1">Adjust your filter, status, or search term.</p>
            </div>
            <button
              onClick={() => { setActiveFilter('All'); setSearch(''); setStatusFilter('All'); }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
