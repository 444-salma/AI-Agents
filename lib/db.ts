import {
  supabase, hasSupabaseCredentials,
  type Company, type BankingProduct, type FinancialStatement,
  type CompanyDocument, type TimelineEvent,
} from './supabase';
import {
  mockCompany, mockBankingProducts, mockFinancialStatements,
  mockDocuments, mockTimelineEvents, MOCK_COMPANY_ID,
} from './mock-data';

export type CompanyData = {
  company: Company;
  statements: FinancialStatement[];
  documents: CompanyDocument[];
  products: BankingProduct[];
  timelineEvents: TimelineEvent[];
};

async function fetchFromSupabase(companyId: string): Promise<CompanyData> {
  if (!supabase) throw new Error('Supabase client not initialised');

  const [c, s, d, p, t] = await Promise.all([
    supabase.from('companies').select('*').eq('id', companyId).single(),
    supabase.from('financial_statements').select('*').eq('company_id', companyId).order('year', { ascending: false }),
    supabase.from('documents').select('*').eq('company_id', companyId),
    supabase.from('banking_products').select('*').eq('company_id', companyId),
    supabase.from('timeline_events').select('*').eq('company_id', companyId).order('event_date', { ascending: false }),
  ]);

  if (!c.data) throw new Error('Company not found');

  return {
    company: c.data as Company,
    statements: (s.data ?? []) as FinancialStatement[],
    documents: (d.data ?? []) as CompanyDocument[],
    products: (p.data ?? []) as BankingProduct[],
    timelineEvents: (t.data ?? []) as TimelineEvent[],
  };
}

function fetchFromMock(_companyId: string): CompanyData {
  return {
    company: mockCompany,
    statements: mockFinancialStatements,
    documents: mockDocuments,
    products: mockBankingProducts,
    timelineEvents: mockTimelineEvents,
  };
}

export async function fetchCompanyData(companyId: string = MOCK_COMPANY_ID): Promise<CompanyData> {
  if (hasSupabaseCredentials) {
    try {
      return await fetchFromSupabase(companyId);
    } catch {
      return fetchFromMock(companyId);
    }
  }
  return fetchFromMock(companyId);
}
