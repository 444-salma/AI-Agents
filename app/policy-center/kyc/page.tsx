import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function KYCPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <Link href="/policy-center" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Policy Center
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-500">Policy</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">KYC — Know Your Customer</h1>
        <p className="text-sm text-slate-500">What information the bank must collect and verify about every corporate customer.</p>
      </div>

      <PolicySection title="Purpose">
        <p>KYC (Know Your Customer) is a regulatory requirement that ensures the bank fully understands who its customers are, what they do, and where their money comes from. It protects the bank from being used for money laundering, terrorism financing, or fraud.</p>
      </PolicySection>

      <PolicySection title="Required Information">
        <ul className="space-y-2">
          {[
            'Legal company name and commercial registration number',
            'Tax identification number (TIN)',
            'Registered business address',
            'Description of business activity',
            'Names and IDs of authorized signatories',
            'UBO information — all owners with 25%+ shareholding',
            'Source of funds declaration',
            'Financial statements for the last 2 years',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
            </li>
          ))}
        </ul>
      </PolicySection>

      <PolicySection title="Business Rule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">IF</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">KYC has not been refreshed in the last 12 months</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">THEN</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">KYC must be refreshed before processing any new request or facility renewal.</p>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Simple Example">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">A customer requests a new credit facility after 14 months with no KYC update.</p>
          <div className="space-y-2">
            {[
              'AI Copilot detects KYC was last refreshed 14 months ago (overdue by 2 months).',
              'System flags the request — KYC must be refreshed first.',
              'Relationship Manager contacts the customer to complete the annual KYC form.',
              'Once KYC is refreshed, the credit facility request can proceed.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-slate-600 dark:text-slate-400">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </PolicySection>
    </div>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</div>
    </div>
  );
}
