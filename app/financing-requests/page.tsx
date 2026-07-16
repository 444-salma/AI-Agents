'use client';

import { useState, useMemo } from 'react';
import {
  Search, SlidersHorizontal, TrendingUp, FileText,
  ShieldCheck, CreditCard, Landmark, Building2,
  AlertCircle, CheckCircle2, ArrowLeft, Users,
  ChevronDown, ChevronUp,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type CategoryKey = 'الكل' | 'شركات قائمة' | 'منشآت جديدة' | 'مشاريع كبرى';

type FinancingType =
  | 'قرض لأجل'
  | 'خطاب اعتماد'
  | 'تسهيلات ائتمانية'
  | 'سحب على المكشوف'
  | 'ضمان بنكي'
  | 'حساب جاري';

type RequestStatus = 'قيد المراجعة' | 'ينتظر مستندات' | 'معتمد' | 'إجراء مطلوب';

type Company = {
  id: string;
  name: string;
  initials: string;
  color: string;
  sector: string;
  amount: number;
  status: RequestStatus;
  missingDocs: number;
  submittedDate: string;
  rm: string;
};

type FinancingProduct = {
  type: FinancingType;
  nameAr: string;
  descAr: string;
  icon: typeof Landmark;
  color: string;
  iconBg: string;
  category: CategoryKey;
  companies: Company[];
};

// ── Data ──────────────────────────────────────────────────────────────────────

const PRODUCTS: FinancingProduct[] = [
  {
    type: 'قرض لأجل', nameAr: 'قرض لأجل',
    descAr: 'تمويل طويل الأجل لتغطية النفقات الرأسمالية وتمويل المشاريع الكبرى والتوسع في الطاقة الإنتاجية للشركات القائمة والناشئة.',
    icon: TrendingUp, color: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    category: 'شركات قائمة',
    companies: [
      { id: 'c1', name: 'شركة المصارف الصناعية', initials: 'صم', color: 'from-blue-600 to-blue-800', sector: 'صناعة', amount: 50_000_000, status: 'قيد المراجعة', missingDocs: 1, submittedDate: '2025-07-01', rm: 'أحمد الرشيد' },
      { id: 'c2', name: 'مجموعة المدار للإنشاء', initials: 'مد', color: 'from-emerald-600 to-teal-700', sector: 'إنشاءات', amount: 80_000_000, status: 'ينتظر مستندات', missingDocs: 3, submittedDate: '2025-06-25', rm: 'سارة العتيبي' },
      { id: 'c3', name: 'لوجستيك رواج', initials: 'لر', color: 'from-orange-500 to-red-600', sector: 'لوجستيات', amount: 25_000_000, status: 'إجراء مطلوب', missingDocs: 4, submittedDate: '2025-07-05', rm: 'خالد الدوسري' },
    ],
  },
  {
    type: 'خطاب اعتماد', nameAr: 'خطاب اعتماد',
    descAr: 'أداة تمويل تجاري لاستيراد البضائع وإدارة مخاطر الدفع للموردين الدوليين، تُصدر بضمان البنك لصالح المورد.',
    icon: FileText, color: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-900/20',
    category: 'شركات قائمة',
    companies: [
      { id: 'c4', name: 'خليج فارما للتوزيع', initials: 'خف', color: 'from-sky-500 to-blue-700', sector: 'أدوية', amount: 18_500_000, status: 'قيد المراجعة', missingDocs: 0, submittedDate: '2025-07-08', rm: 'فاطمة الزهراني' },
      { id: 'c5', name: 'الواحة للتجارة', initials: 'وت', color: 'from-violet-600 to-purple-800', sector: 'تجزئة', amount: 9_200_000, status: 'معتمد', missingDocs: 0, submittedDate: '2025-06-30', rm: 'أحمد الرشيد' },
      { id: 'c6', name: 'جدارة لحلول التقنية', initials: 'جت', color: 'from-cyan-500 to-sky-700', sector: 'تقنية', amount: 5_750_000, status: 'ينتظر مستندات', missingDocs: 2, submittedDate: '2025-07-10', rm: 'سارة العتيبي' },
    ],
  },
  {
    type: 'تسهيلات ائتمانية', nameAr: 'تسهيلات ائتمانية',
    descAr: 'خط ائتمان متجدد لتمويل رأس المال العامل والاحتياجات التشغيلية، يُتيح للشركة السحب والسداد بمرونة وفق احتياجاتها.',
    icon: CreditCard, color: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    category: 'شركات قائمة',
    companies: [
      { id: 'c13', name: 'جدارة لحلول التقنية', initials: 'جت', color: 'from-cyan-500 to-sky-700', sector: 'تقنية', amount: 30_000_000, status: 'قيد المراجعة', missingDocs: 1, submittedDate: '2025-07-02', rm: 'فاطمة الزهراني' },
      { id: 'c14', name: 'خليج فارما للتوزيع', initials: 'خف', color: 'from-sky-500 to-blue-700', sector: 'أدوية', amount: 45_000_000, status: 'ينتظر مستندات', missingDocs: 2, submittedDate: '2025-06-28', rm: 'سارة العتيبي' },
    ],
  },
  {
    type: 'سحب على المكشوف', nameAr: 'سحب على المكشوف',
    descAr: 'تمويل قصير الأجل يُتيح للشركة السحب من حسابها الجاري بما يتجاوز الرصيد لتغطية الفجوات النقدية الطارئة في التدفق.',
    icon: Landmark, color: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    category: 'شركات قائمة',
    companies: [
      { id: 'c7', name: 'إثراء للعقارات', initials: 'عق', color: 'from-rose-500 to-red-700', sector: 'عقارات', amount: 12_000_000, status: 'قيد المراجعة', missingDocs: 1, submittedDate: '2025-07-03', rm: 'خالد الدوسري' },
      { id: 'c8', name: 'نخيل للزراعة', initials: 'نز', color: 'from-green-500 to-emerald-700', sector: 'زراعة', amount: 6_500_000, status: 'معتمد', missingDocs: 0, submittedDate: '2025-07-09', rm: 'فاطمة الزهراني' },
    ],
  },
  {
    type: 'ضمان بنكي', nameAr: 'ضمان بنكي',
    descAr: 'ضمان يُصدره البنك لصالح جهة ثالثة (حكومية أو خاصة) يضمن التزام الشركة العميلة بتنفيذ عقد أو تقديم خدمة.',
    icon: ShieldCheck, color: 'text-teal-600', iconBg: 'bg-teal-50 dark:bg-teal-900/20',
    category: 'مشاريع كبرى',
    companies: [
      { id: 'c9', name: 'ميدكو للصناعات الفولاذية', initials: 'مف', color: 'from-slate-500 to-slate-700', sector: 'معادن', amount: 15_000_000, status: 'معتمد', missingDocs: 0, submittedDate: '2025-06-20', rm: 'أحمد الرشيد' },
      { id: 'c10', name: 'مجموعة المدار للإنشاء', initials: 'مد', color: 'from-emerald-600 to-teal-700', sector: 'إنشاءات', amount: 7_500_000, status: 'ينتظر مستندات', missingDocs: 2, submittedDate: '2025-07-06', rm: 'سارة العتيبي' },
      { id: 'c11', name: 'سلام للشحن والموانئ', initials: 'سش', color: 'from-blue-400 to-indigo-600', sector: 'شحن', amount: 22_000_000, status: 'إجراء مطلوب', missingDocs: 5, submittedDate: '2025-07-11', rm: 'خالد الدوسري' },
    ],
  },
  {
    type: 'حساب جاري', nameAr: 'حساب جاري مؤسسي',
    descAr: 'حساب تشغيلي رئيسي للمنشآت الجديدة أو القائمة لإدارة التدفقات النقدية اليومية وعمليات الرواتب والمدفوعات.',
    icon: Building2, color: 'text-slate-600', iconBg: 'bg-slate-50 dark:bg-slate-800/40',
    category: 'منشآت جديدة',
    companies: [
      { id: 'c12', name: 'لوجستيك رواج', initials: 'لر', color: 'from-orange-500 to-red-600', sector: 'لوجستيات', amount: 0, status: 'قيد المراجعة', missingDocs: 2, submittedDate: '2025-07-12', rm: 'أحمد الرشيد' },
    ],
  },
];

const CATEGORIES: CategoryKey[] = ['الكل', 'شركات قائمة', 'منشآت جديدة', 'مشاريع كبرى'];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<RequestStatus, { dot: string; text: string; bg: string }> = {
  'معتمد':          { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' },
  'قيد المراجعة':  { dot: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-300',       bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' },
  'ينتظر مستندات': { dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-300',     bg: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' },
  'إجراء مطلوب':   { dot: 'bg-red-500',     text: 'text-red-700 dark:text-red-300',         bg: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' },
};

const CAT_BADGE: Record<CategoryKey, string> = {
  'الكل':         'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'شركات قائمة': 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  'منشآت جديدة': 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
  'مشاريع كبرى': 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
};

function fmtAmt(n: number) {
  if (!n) return '—';
  return `${(n / 1_000_000).toFixed(1)} مليون ر.س`;
}

// ── Company row inside expanded card ─────────────────────────────────────────

function CompanyRow({ c }: { c: Company }) {
  const st = STATUS_CFG[c.status];
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-[11px] font-extrabold bg-gradient-to-br ${c.color}`}>
          {c.initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
          <p className="text-[10px] text-slate-400">{c.sector}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        {c.missingDocs > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="w-3 h-3" />{c.missingDocs}
          </span>
        )}
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {c.status}
        </span>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{fmtAmt(c.amount)}</span>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function ProductCard({ product, search }: { product: FinancingProduct; search: string }) {
  const [open, setOpen] = useState(false);

  const visibleCompanies = useMemo(() => {
    if (!search) return product.companies;
    const q = search.toLowerCase();
    return product.companies.filter(c =>
      c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)
    );
  }, [product.companies, search]);

  if (search && visibleCompanies.length === 0) return null;

  const Icon = product.icon;
  const catBadge = CAT_BADGE[product.category];
  const actionCount = visibleCompanies.filter(c => c.status === 'إجراء مطلوب' || c.status === 'ينتظر مستندات').length;
  const approvedCount = visibleCompanies.filter(c => c.status === 'معتمد').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col" dir="rtl">

      {/* Card body */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${product.iconBg} self-center`}>
          <Icon className={`w-6 h-6 ${product.color}`} />
        </div>

        {/* Title + desc */}
        <div className="text-center space-y-2">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{product.nameAr}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{product.descAr}</p>
        </div>

        {/* Category badge */}
        <div className="flex justify-center">
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${catBadge}`}>{product.category}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="text-center">
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-none">{visibleCompanies.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-center"><Users className="w-3 h-3" />شركة طالبة</p>
          </div>
          {actionCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-extrabold text-amber-500 leading-none">{actionCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">تحتاج إجراء</p>
            </div>
          )}
          {approvedCount > 0 && (
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-500 leading-none">{approvedCount}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">معتمد</p>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-[#0d7d4a] hover:bg-[#0a6540] text-white transition-colors"
        >
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {open ? 'إخفاء الشركات' : 'عرض الشركات'}
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          التفاصيل
        </button>
      </div>

      {/* Expandable companies list */}
      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 pb-4 pt-3 space-y-2 bg-slate-50/50 dark:bg-slate-800/20">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-right">الشركات الطالبة ({visibleCompanies.length})</p>
          {visibleCompanies.map(c => <CompanyRow key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinancingRequestsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('الكل');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    PRODUCTS.filter(p => activeCategory === 'الكل' || p.category === activeCategory),
    [activeCategory]
  );

  const totalRequests = PRODUCTS.reduce((s, p) => s + p.companies.length, 0);
  const totalAction   = PRODUCTS.reduce((s, p) => s + p.companies.filter(c => c.status === 'إجراء مطلوب' || c.status === 'ينتظر مستندات').length, 0);
  const totalApproved = PRODUCTS.reduce((s, p) => s + p.companies.filter(c => c.status === 'معتمد').length, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap" dir="rtl">
          <div>
            <p className="text-[10px] font-extrabold text-[#0d7d4a] uppercase tracking-widest mb-1">الخدمات المصرفية للشركات</p>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">طلبات التمويل</h1>
            <p className="text-sm text-slate-500 mt-1">استعرض طلبات التمويل المقدمة مصنّفةً حسب نوع المنتج</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'إجمالي الطلبات', value: totalRequests, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
              { label: 'تحتاج إجراء', value: totalAction, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
              { label: 'معتمدة', value: totalApproved, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${s.bg}`}>
                <span className={`text-lg font-extrabold leading-none ${s.color}`}>{s.value}</span>
                <span className="text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter tabs + search bar ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap" dir="rtl">

          {/* Category tabs — matches image style */}
          <div className="flex items-center gap-1 border-b-2 border-slate-200 dark:border-slate-700">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2.5 text-sm font-bold transition-all duration-150 relative whitespace-nowrap ${
                  activeCategory === cat
                    ? 'text-[#0d7d4a] dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat}
                {activeCategory === cat && (
                  <span className="absolute bottom-[-2px] right-0 left-0 h-0.5 bg-[#0d7d4a] dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث..."
                className="pr-9 pl-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-48"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              تصفية
            </button>
          </div>
        </div>

        {/* ── Product cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => (
            <ProductCard key={p.type} product={p} search={search} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد نتائج</p>
            <button
              onClick={() => { setActiveCategory('الكل'); setSearch(''); }}
              className="text-xs font-semibold text-[#0d7d4a] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />إعادة تعيين الفلتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
