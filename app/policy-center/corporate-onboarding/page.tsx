import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CorporateOnboardingPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <Link href="/policy-center" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Policy Center
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-500">Policy</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Corporate Onboarding</h1>
        <p className="text-sm text-slate-500">How to open a new corporate account from start to finish.</p>
      </div>

      <PolicySection title="Purpose">
        <p>Corporate onboarding is the process of establishing a new banking relationship with a company. It ensures the bank fully understands who the customer is, what they do, and that they meet all regulatory requirements before any banking services are provided.</p>
      </PolicySection>

      <PolicySection title="Required Documents">
        <ul className="space-y-2">
          {[
            'Valid Commercial Registration certificate',
            'Articles of Association',
            'Authorized signatory IDs (National ID or Passport)',
            'UBO Declaration (for owners with 25%+ shareholding)',
            'Corporate KYC Form (completed and signed)',
            'Latest 2 years of audited financial statements',
          ].map(doc => (
            <li key={doc} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
            </li>
          ))}
        </ul>
      </PolicySection>

      <PolicySection title="Business Rule">
        <RuleCard
          condition="New corporate account is requested"
          action="All mandatory documents must be collected and verified before account activation. No banking service can be provided until onboarding is complete."
        />
      </PolicySection>

      <PolicySection title="Simple Example">
        <ExampleCard
          scenario="A construction company applies to open a corporate account."
          steps={[
            'Relationship Manager collects all 6 required documents.',
            'Compliance team verifies the Commercial Registration and runs AML screening.',
            'UBO Declaration is reviewed — all beneficial owners are confirmed.',
            'Account is activated only after all checks pass.',
          ]}
        />
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

function RuleCard({ condition, action }: { condition: string; action: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">IF</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{condition}</p>
      </div>
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">THEN</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">{action}</p>
      </div>
    </div>
  );
}

function ExampleCard({ scenario, steps }: { scenario: string; steps: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{scenario}</p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-slate-600 dark:text-slate-400">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
