import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const rules = [
  {
    id: 'BR-001',
    condition: 'Credit facility request is above SAR 50M',
    action: 'Require Credit Committee approval before proceeding.',
    priority: 'High',
  },
  {
    id: 'BR-002',
    condition: 'KYC refresh date is more than 12 months ago',
    action: 'Block all new requests until KYC is refreshed.',
    priority: 'High',
  },
  {
    id: 'BR-003',
    condition: 'Commercial Registration expires within 90 days',
    action: 'Flag for renewal. No facility processing until renewed.',
    priority: 'High',
  },
  {
    id: 'BR-004',
    condition: 'UBO Declaration is missing',
    action: 'Block the banking relationship until declaration is submitted.',
    priority: 'Critical',
  },
  {
    id: 'BR-005',
    condition: 'Financial statements are older than 18 months',
    action: 'Request updated statements before processing any credit request.',
    priority: 'High',
  },
  {
    id: 'BR-006',
    condition: 'Customer risk rating is High',
    action: 'Escalate to senior Relationship Manager and require enhanced due diligence.',
    priority: 'High',
  },
];

const priorityStyle: Record<string, string> = {
  Critical: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
  High: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
};

export default function BusinessRulesPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <Link href="/policy-center" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Policy Center
      </Link>

      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-500">Policy</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Business Rules</h1>
        <p className="text-sm text-slate-500">Automated rules that govern approvals, flags, and restrictions.</p>
      </div>

      <PolicySection title="Purpose">
        <p>Business rules are the automated logic the AI uses to evaluate a customer's file. Each rule follows a simple IF/THEN structure — if a condition is met, a specific action must be taken. These rules ensure consistent, policy-compliant decisions across all customers.</p>
      </PolicySection>

      <PolicySection title="Active Rules">
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{rule.id}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${priorityStyle[rule.priority] || priorityStyle.Medium}`}>
                  {rule.priority}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">IF</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{rule.condition}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">THEN</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{rule.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PolicySection>

      <PolicySection title="Simple Example">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">A customer's Commercial Registration expires in 45 days. The customer also requests a new credit facility.</p>
          <div className="space-y-2">
            {[
              'AI Copilot checks BR-003 — CR expires within 90 days → flagged.',
              'AI Copilot checks BR-005 — Financial statements are current → no flag.',
              'System blocks credit facility processing until CR is renewed.',
              'Relationship Manager is notified to request CR renewal immediately.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
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
