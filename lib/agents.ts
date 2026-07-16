import { Company, BankingProduct, FinancialStatement, CompanyDocument, TimelineEvent } from './supabase';

export type CompanyIntelligenceOutput = {
  executiveSummary: string;
  customerProfile: { label: string; value: string }[];
  keyInsights: string[];
  relationshipHighlights: string[];
};

export type FinancialAnalysisOutput = {
  narrativeSummary: string;
  strengths: string[];
  weaknesses: string[];
  observations: string[];
  healthScore: number;
  healthLabel: string;
};

export type ComplianceOutput = {
  overallStatus: 'Compliant' | 'Needs Attention' | 'Non-Compliant';
  complianceScore: number;
  checklist: {
    documentName: string;
    documentType: string;
    status: 'Complete' | 'Needs Update' | 'Missing';
    policyExplanation: string;
    requiredFor: string[];
    expiryDate: string | null;
  }[];
  summaryNarrative: string;
};

export type NextBestActionOutput = {
  primaryRecommendation: {
    action: string;
    reason: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    businessImpact: string;
  };
  additionalActions: {
    action: string;
    reason: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    businessImpact: string;
  }[];
  overallAssessment: string;
};

function fmt(value: number): string {
  if (value >= 1e9) return `SAR ${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `SAR ${(value / 1e6).toFixed(0)}M`;
  return `SAR ${value.toLocaleString()}`;
}

export function runCompanyIntelligenceAgent(
  company: Company,
  products: BankingProduct[],
  timeline: TimelineEvent[]
): CompanyIntelligenceOutput {
  const activeProducts = products.filter(p => p.status === 'Active');
  const totalExposure = products.reduce((s, p) => s + (p.outstanding_amount || 0), 0);
  const years = new Date().getFullYear() - new Date(company.relationship_since).getFullYear();

  const executiveSummary = `${company.name} is an active ${company.customer_segment.toLowerCase()} banking client in the ${company.industry} sector (${company.sector}), headquartered in ${company.headquarters}. Founded in ${company.founded_year}, the company employs approximately ${company.employees_count.toLocaleString()} staff and generates annual revenues of ${fmt(company.annual_revenue)}. The banking relationship has been maintained since ${new Date(company.relationship_since).getFullYear()} — a ${years}-year partnership managed by ${company.relationship_manager}. Currently rated ${company.risk_rating} risk, the customer holds ${activeProducts.length} active banking products with total outstanding exposure of ${fmt(totalExposure)}. ${company.description}`;

  const customerProfile = [
    { label: 'Industry', value: company.industry },
    { label: 'Sector', value: company.sector },
    { label: 'Founded', value: company.founded_year.toString() },
    { label: 'Headquarters', value: company.headquarters },
    { label: 'Employees', value: company.employees_count.toLocaleString() },
    { label: 'Annual Revenue', value: fmt(company.annual_revenue) },
    { label: 'Risk Rating', value: company.risk_rating },
    { label: 'Segment', value: company.customer_segment },
    { label: 'CR Number', value: company.registration_number },
    { label: 'Tax ID', value: company.tax_id },
    { label: 'Relationship Manager', value: company.relationship_manager },
    { label: 'Client Since', value: new Date(company.relationship_since).getFullYear().toString() },
  ];

  const keyInsights: string[] = [];
  if (years >= 5) keyInsights.push(`Long-standing ${years}-year banking relationship indicating strong loyalty and trust.`);
  if (company.risk_rating === 'Low') keyInsights.push('Low risk classification reflects strong financial position and consistent repayment history.');
  if (activeProducts.length >= 3) keyInsights.push(`Multi-product relationship with ${activeProducts.length} active products demonstrates deep banking engagement.`);
  if (totalExposure > 0) keyInsights.push(`Total bank exposure of ${fmt(totalExposure)} represents a significant contribution to the portfolio.`);
  keyInsights.push(`The ${company.sector} sector aligns with Saudi Vision 2030 economic priorities, supporting relationship strategic importance.`);

  const expiringProducts = products.filter(p => {
    if (!p.expiry_date) return false;
    const days = (new Date(p.expiry_date).getTime() - Date.now()) / 86400000;
    return days <= 180 && days > 0;
  });
  if (expiringProducts.length > 0) {
    keyInsights.push(`${expiringProducts.length} product(s) approaching expiry — renewal planning should begin promptly.`);
  }

  const relationshipHighlights = timeline.slice(0, 4).map(e =>
    `${new Date(e.event_date).getFullYear()} — ${e.title}: ${e.description}`
  );

  return { executiveSummary, customerProfile, keyInsights, relationshipHighlights };
}

export function runFinancialAnalysisAgent(
  company: Company,
  statements: FinancialStatement[]
): FinancialAnalysisOutput {
  if (!statements.length) {
    return {
      narrativeSummary: 'No financial statements available for analysis.',
      strengths: [],
      weaknesses: ['No financial data available.'],
      observations: ['Please obtain and upload audited financial statements.'],
      healthScore: 0,
      healthLabel: 'Insufficient Data',
    };
  }

  const sorted = [...statements].sort((a, b) => b.year - a.year);
  const latest = sorted[0];
  const prior = sorted[1];

  const revenueGrowth = prior ? ((latest.total_revenue - prior.total_revenue) / prior.total_revenue * 100) : null;
  const netIncomeGrowth = prior ? ((latest.net_income - prior.net_income) / prior.net_income * 100) : null;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const observations: string[] = [];

  if (latest.current_ratio >= 1.5) strengths.push(`Strong liquidity with current ratio of ${latest.current_ratio.toFixed(2)}x, indicating solid short-term solvency.`);
  else if (latest.current_ratio < 1.2) weaknesses.push(`Current ratio of ${latest.current_ratio.toFixed(2)}x is below the 1.5x threshold, suggesting liquidity pressure.`);

  if (latest.net_margin >= 10) strengths.push(`Healthy net profit margin of ${latest.net_margin.toFixed(1)}%, demonstrating effective cost management.`);
  else if (latest.net_margin < 5) weaknesses.push(`Net profit margin of ${latest.net_margin.toFixed(1)}% is below benchmarks, indicating cost pressures.`);

  if (latest.return_on_equity >= 15) strengths.push(`Return on equity of ${latest.return_on_equity.toFixed(1)}% reflects strong shareholder value creation.`);
  if (latest.operating_cash_flow > 0) strengths.push(`Positive operating cash flow of ${fmt(latest.operating_cash_flow)} confirms strong internal cash generation.`);

  if (revenueGrowth !== null) {
    if (revenueGrowth >= 10) strengths.push(`Revenue grew ${revenueGrowth.toFixed(1)}% year-on-year, demonstrating strong business momentum.`);
    else if (revenueGrowth < 0) weaknesses.push(`Revenue declined ${Math.abs(revenueGrowth).toFixed(1)}% versus prior year — warrants further investigation.`);
    else observations.push(`Revenue grew ${revenueGrowth.toFixed(1)}% year-on-year, reflecting stable performance.`);
  }

  if (latest.debt_to_equity > 2.5) weaknesses.push(`Debt-to-equity of ${latest.debt_to_equity.toFixed(2)}x indicates high leverage, limiting future borrowing capacity.`);
  else if (latest.debt_to_equity <= 1.5) strengths.push(`Conservative leverage at ${latest.debt_to_equity.toFixed(2)}x debt-to-equity provides headroom for additional financing.`);

  observations.push(`Total assets: ${fmt(latest.total_assets)} | Equity: ${fmt(latest.total_equity)} | Gross margin: ${latest.gross_margin.toFixed(1)}%.`);
  if (netIncomeGrowth !== null) observations.push(`Net income ${netIncomeGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(netIncomeGrowth).toFixed(1)}% year-on-year.`);

  let score = 50;
  if (latest.current_ratio >= 1.5) score += 10;
  if (latest.net_margin >= 10) score += 10;
  if (latest.return_on_equity >= 15) score += 10;
  if (revenueGrowth !== null && revenueGrowth >= 5) score += 10;
  if (latest.debt_to_equity <= 2.0) score += 5;
  if (latest.operating_cash_flow > 0) score += 5;
  if (latest.current_ratio < 1.2) score -= 10;
  if (latest.net_margin < 5) score -= 10;
  if (latest.debt_to_equity > 2.5) score -= 10;
  if (revenueGrowth !== null && revenueGrowth < 0) score -= 10;
  score = Math.max(0, Math.min(100, score));

  const healthLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Attention';

  const narrativeSummary = `Based on ${latest.year} audited financials, ${company.name} demonstrates ${healthLabel.toLowerCase()} financial health (score: ${score}/100). Revenue stands at ${fmt(latest.total_revenue)} with net income of ${fmt(latest.net_income)} (${latest.net_margin.toFixed(1)}% net margin). Total assets are ${fmt(latest.total_assets)} against liabilities of ${fmt(latest.total_liabilities)}, with a debt-to-equity ratio of ${latest.debt_to_equity.toFixed(2)}x. ${strengths[0] ? `Key strength: ${strengths[0].toLowerCase()}` : ''} ${weaknesses[0] ? `Primary concern: ${weaknesses[0].toLowerCase()}` : ''}`;

  return { narrativeSummary, strengths, weaknesses, observations, healthScore: score, healthLabel };
}

export function runComplianceAgent(
  company: Company,
  documents: CompanyDocument[]
): ComplianceOutput {
  const explanations: Record<string, Record<string, string>> = {
    Complete: {
      default: 'Document is valid, current, and on file as required by internal policy.',
    },
    'Needs Update': {
      'Commercial Registration': 'Per internal document policy (BP-003), the Commercial Registration is expiring within 90 days and must be renewed before any credit facility renewal or account changes can proceed.',
      'Articles of Association': 'The Articles of Association require updating to reflect current ownership structure per internal onboarding requirements.',
      'National ID': 'One or more authorized signatory National IDs have expired. Per KYC policy, valid IDs must be provided before processing any new requests.',
      'KYC Form': 'Annual KYC refresh is overdue. Per AML policy (BP-002), KYC must be refreshed annually for all corporate customers.',
      default: 'Document requires renewal or update per internal policy before proceeding.',
    },
    Missing: {
      'UBO Declaration': 'UBO Declaration has not been submitted. Per AML/CFT policy (BP-004), all beneficial owners holding 25%+ must be disclosed before any banking relationship can proceed.',
      'Financial Statements': 'Audited financial statements are not on file. Per credit policy (BP-005), latest statements (not older than 18 months) are mandatory for all credit facilities.',
      'KYC Form': 'Corporate KYC form is missing. Per AML policy, this form is mandatory for all corporate customers before any facility processing.',
      default: 'Document is not on file. This is a mandatory requirement that must be fulfilled before proceeding.',
    },
  };

  const checklist = documents.map(doc => {
    let policyExplanation: string;
    if (doc.status === 'Complete') {
      policyExplanation = 'Document is valid, current, and on file per internal requirements.';
    } else {
      const statusMap = explanations[doc.status] || {};
      policyExplanation = doc.notes
        ? `According to internal ${doc.document_type.toLowerCase()} requirements: ${doc.notes}`
        : statusMap[doc.document_type] || statusMap.default;
    }
    return {
      documentName: doc.document_name,
      documentType: doc.document_type,
      status: doc.status,
      policyExplanation,
      requiredFor: doc.required_for || [],
      expiryDate: doc.expiry_date,
    };
  });

  const complete = checklist.filter(d => d.status === 'Complete').length;
  const missing = checklist.filter(d => d.status === 'Missing').length;
  const needsUpdate = checklist.filter(d => d.status === 'Needs Update').length;
  const score = checklist.length > 0 ? Math.round((complete / checklist.length) * 100) : 0;
  const overallStatus: ComplianceOutput['overallStatus'] = missing > 0 ? 'Non-Compliant' : needsUpdate > 0 ? 'Needs Attention' : 'Compliant';

  const summaryNarrative = `Document compliance review for ${company.name}: ${complete} of ${checklist.length} documents are complete (${score}% compliance). ${missing > 0 ? `${missing} critical document(s) are missing and must be obtained immediately per policy.` : ''} ${needsUpdate > 0 ? `${needsUpdate} document(s) require renewal or update before banking operations can continue.` : ''} ${overallStatus === 'Compliant' ? 'All documents are in order — the customer file is fully compliant.' : 'Immediate action is required to achieve full compliance.'}`;

  return { overallStatus, complianceScore: score, checklist, summaryNarrative };
}

export function runNextBestActionAgent(
  company: Company,
  ci: CompanyIntelligenceOutput,
  fa: FinancialAnalysisOutput,
  comp: ComplianceOutput,
  products: BankingProduct[]
): NextBestActionOutput {
  const actions: NextBestActionOutput['additionalActions'] = [];

  for (const doc of comp.checklist.filter(d => d.status === 'Missing')) {
    actions.push({
      action: `Obtain Missing ${doc.documentType}`,
      reason: doc.policyExplanation,
      priority: 'Critical',
      businessImpact: 'Regulatory compliance requirement. Failure to obtain may result in relationship suspension and regulatory exposure.',
    });
  }

  for (const doc of comp.checklist.filter(d => d.status === 'Needs Update')) {
    actions.push({
      action: `Request ${doc.documentType} Renewal`,
      reason: doc.policyExplanation,
      priority: 'High',
      businessImpact: 'Required to maintain operational continuity and prevent credit facility processing blockage.',
    });
  }

  for (const p of products.filter(p => {
    if (!p.expiry_date || !['Credit Facility', 'Term Loan', 'Letter of Guarantee'].includes(p.product_type)) return false;
    const days = (new Date(p.expiry_date).getTime() - Date.now()) / 86400000;
    return days <= 180 && days > 0;
  })) {
    const days = Math.ceil((new Date(p.expiry_date!).getTime() - Date.now()) / 86400000);
    actions.push({
      action: `Initiate ${p.product_name} Renewal`,
      reason: `${p.product_name} expires in ${days} days. Per procedure OP-002, renewal should begin at least 60 days before expiry.`,
      priority: days <= 60 ? 'High' : 'Medium',
      businessImpact: 'Prevents facility expiry and ensures uninterrupted financing availability for customer operations.',
    });
  }

  if (fa.healthScore >= 75 && comp.overallStatus === 'Compliant') {
    actions.push({
      action: 'Schedule Strategic Banking Review Meeting',
      reason: `${company.name} demonstrates ${fa.healthLabel} financial health and full document compliance — ideal conditions for relationship deepening.`,
      priority: 'Medium',
      businessImpact: 'Opportunity to expand banking products and increase wallet share with a high-quality customer.',
    });
  }

  if (fa.weaknesses.length > 0) {
    actions.push({
      action: 'Request Management Commentary on Financial Observations',
      reason: `Financial analysis identified concerns: ${fa.weaknesses[0]}`,
      priority: 'Medium',
      businessImpact: 'Proactive risk management — understanding challenges enables early intervention.',
    });
  }

  actions.push({
    action: 'Update Customer Profile and Relationship Notes',
    reason: 'Maintaining current customer records ensures informed decision-making and audit readiness.',
    priority: 'Low',
    businessImpact: 'Improves relationship quality, supports audit readiness, and ensures data accuracy.',
  });

  actions.sort((a, b) => ({ Critical: 0, High: 1, Medium: 2, Low: 3 }[a.priority] - { Critical: 0, High: 1, Medium: 2, Low: 3 }[b.priority]));

  const primary = actions[0] || {
    action: 'Continue Relationship Monitoring',
    reason: 'All requirements are met. Continue regular monitoring per relationship management guidelines.',
    priority: 'Low' as const,
    businessImpact: 'Maintain relationship health and proactively identify future opportunities.',
  };

  const overallAssessment = `Based on analysis of ${company.name}'s profile, financials, and document compliance, the primary recommended action is: ${primary.action}. ${comp.overallStatus !== 'Compliant' ? 'Document compliance issues must be resolved before processing any new requests.' : `Customer file is ${comp.overallStatus.toLowerCase()}.`} Financial health: ${fa.healthLabel} (${fa.healthScore}/100). Note: These recommendations are decision-support guidance only and do not constitute automatic approval or rejection of any banking request.`;

  return { primaryRecommendation: primary, additionalActions: actions.slice(1), overallAssessment };
}
