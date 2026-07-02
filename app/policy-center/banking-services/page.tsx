import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const services = [
  {
    name: 'Corporate Current Account',
    description: 'Primary operating account for day-to-day business transactions.',
    eligibility: ['Valid Commercial Registration', 'Completed KYC', 'UBO Declaration submitted'],
  },
  {
    name: 'Credit Facility',
    description: 'Revolving credit line for working capital and operational needs.',
    eligibility: ['Audited financial statements (last 2 years)', 'Positive credit history', 'Current ratio above 1.2x', 'Facilities above SAR 50M require Credit Committee approval'],
  },
  {
    name: 'Term Loan',
    description: 'Fixed-term financing for capital expenditure or project funding.',
    eligibility: ['Full KYC compliance', 'Financial statements showing debt serviceability', 'Collateral documentation (where applicable)'],
  },
  {
    name: 'Letter of Guarantee',
    description: 'Bank guarantee for tender bonds, performance bonds, and advance payment guarantees.',
    eligibility: ['Active corporate account', 'Valid contract reference', 'Sufficient credit limit or cash collateral'],
  },
  {
    name: 'Letter of Credit',
    description: 'Trade finance instrument for importing goods and managing supplier payment risk.',
    eligibility: ['Trade contract or purchase order', 'Import/export business registration', 'Sufficient credit limit'],
  },
];

export default function BankingServicesPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <Link href="/policy-center" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Policy Center
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Policy</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Corporate Banking Services</h1>
        <p className="text-sm text-slate-500">Available banking products and their eligibility requirements.</p>
      </div>

      <PolicySection title="Purpose">
        <p>This page lists all corporate banking products the bank offers, along with the minimum eligibility criteria for each. The AI Copilot uses this information to identify which products a customer may qualify for and what they need to provide.</p>
      </PolicySection>

      <PolicySection title="Available Services">
        <div className="space-y-5">
          {services.map(svc => (
            <div key={svc.name} className="space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{svc.name}</p>
              <p className="text-xs text-slate-500">{svc.description}</p>
              <div className="space-y-1.5">
                {svc.eligibility.map(req => (
                  <div key={req} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="Business Rule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">IF</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Customer does not meet all eligibility criteria for a product</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">THEN</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">AI flags the gap and guides the Relationship Manager on what must be resolved first.</p>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Simple Example">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">A customer asks about applying for a Letter of Credit for importing raw materials.</p>
          <div className="space-y-2">
            {[
              'AI Copilot checks the LC eligibility requirements.',
              'Customer has a valid account and credit limit — requirements met.',
              'AI confirms the customer qualifies and recommends the Relationship Manager proceed.',
              'If trade contract is missing, AI flags this as a blocker.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
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
