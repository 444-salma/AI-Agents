import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const services = [
  {
    name: 'Corporate Account Opening',
    docs: ['Commercial Registration', 'Articles of Association', 'Authorized Signatory IDs', 'UBO Declaration', 'Corporate KYC Form'],
  },
  {
    name: 'Credit Facility',
    docs: ['Audited Financial Statements (last 2 years)', 'Commercial Registration', 'Credit Application Form', 'Collateral Documentation'],
  },
  {
    name: 'Letter of Credit',
    docs: ['Trade Contract or Purchase Order', 'Commercial Registration', 'Customer Financial Statements', 'LC Application Form'],
  },
  {
    name: 'Letter of Guarantee',
    docs: ['LG Application Form', 'Contract Reference', 'Commercial Registration', 'Counter-Guarantee (if applicable)'],
  },
];

export default function RequiredDocumentsPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <Link href="/policy-center" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Policy Center
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-500">Policy</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Required Documents</h1>
        <p className="text-sm text-slate-500">Mandatory documents for each banking service.</p>
      </div>

      <PolicySection title="Purpose">
        <p>Before providing any banking service, the bank must collect and verify all required documents. This protects the bank legally, satisfies regulatory requirements, and ensures the customer is who they claim to be.</p>
      </PolicySection>

      <PolicySection title="Documents by Service">
        <div className="space-y-4">
          {services.map(svc => (
            <div key={svc.name} className="space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{svc.name}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {svc.docs.map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {doc}
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
            <p className="text-sm text-slate-700 dark:text-slate-300">Any mandatory document is missing or expired</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">THEN</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">The banking service request is blocked until the document is obtained and verified.</p>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Simple Example">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">A customer applies for a new credit facility without submitting audited financial statements.</p>
          <div className="space-y-2">
            {[
              'AI Copilot checks the document checklist against the credit facility requirements.',
              'Financial Statements are flagged as Missing.',
              'The credit request cannot proceed until statements are submitted.',
              'Once uploaded and verified, processing continues.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
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
