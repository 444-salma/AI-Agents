import Link from 'next/link';
import { ChevronRight, Building2, Shield, FileText, Zap, CreditCard } from 'lucide-react';

const policies = [
  {
    slug: 'corporate-onboarding',
    title: 'Corporate Onboarding',
    description: 'How to open a new corporate account from start to finish.',
    icon: Building2,
    color: 'blue',
  },
  {
    slug: 'kyc',
    title: 'KYC',
    description: 'Know Your Customer — what information we must collect and verify.',
    icon: Shield,
    color: 'emerald',
  },
  {
    slug: 'required-documents',
    title: 'Required Documents',
    description: 'Complete list of mandatory documents for each banking service.',
    icon: FileText,
    color: 'amber',
  },
  {
    slug: 'business-rules',
    title: 'Business Rules',
    description: 'Automated rules that govern approval, flagging, and restrictions.',
    icon: Zap,
    color: 'violet',
  },
  {
    slug: 'banking-services',
    title: 'Corporate Banking Services',
    description: 'Available banking products and their eligibility requirements.',
    icon: CreditCard,
    color: 'rose',
  },
];

const colorMap: Record<string, { bg: string; icon: string; arrow: string }> = {
  blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-blue-600 dark:text-blue-400',   arrow: 'text-blue-400' },
  emerald:{ bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', arrow: 'text-emerald-400' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-600 dark:text-amber-400',  arrow: 'text-amber-400' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'text-violet-600 dark:text-violet-400', arrow: 'text-violet-400' },
  rose:   { bg: 'bg-rose-50 dark:bg-rose-900/20',    icon: 'text-rose-600 dark:text-rose-400',    arrow: 'text-rose-400' },
};

export default function PolicyCenterPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Policy Center</h1>
        <p className="text-sm text-slate-500">The bank&apos;s official policies — used by AI agents to generate every recommendation.</p>
      </div>

      <div className="space-y-3">
        {policies.map(({ slug, title, description, icon: Icon, color }) => {
          const c = colorMap[color];
          return (
            <Link
              key={slug}
              href={`/policy-center/${slug}`}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${c.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <p className="text-xs text-slate-500 text-center leading-relaxed">
          All policies are maintained by the bank&apos;s Compliance and Risk teams.
          AI agents consult this knowledge base before generating any recommendation.
        </p>
      </div>
    </div>
  );
}
