import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  name: string;
  industry: string;
  sector: string;
  registration_number: string;
  tax_id: string;
  founded_year: number;
  headquarters: string;
  country: string;
  employees_count: number;
  annual_revenue: number;
  website: string;
  description: string;
  relationship_manager: string;
  relationship_since: string;
  risk_rating: string;
  customer_segment: string;
  status: string;
  logo_initials: string;
};

export type BankingProduct = {
  id: string;
  company_id: string;
  product_type: string;
  product_name: string;
  account_number: string;
  limit_amount: number | null;
  outstanding_amount: number;
  currency: string;
  start_date: string;
  expiry_date: string | null;
  status: string;
};

export type FinancialStatement = {
  id: string;
  company_id: string;
  year: number;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_revenue: number;
  gross_profit: number;
  operating_income: number;
  net_income: number;
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  current_ratio: number;
  debt_to_equity: number;
  return_on_equity: number;
  return_on_assets: number;
  gross_margin: number;
  net_margin: number;
};

export type CompanyDocument = {
  id: string;
  company_id: string;
  document_type: string;
  document_name: string;
  status: "Complete" | "Needs Update" | "Missing";
  expiry_date: string | null;
  upload_date: string | null;
  issuing_authority: string | null;
  notes: string | null;
  required_for: string[];
};

export type TimelineEvent = {
  id: string;
  company_id: string;
  event_type: string;
  title: string;
  description: string;
  event_date: string;
  created_by: string;
};

export type Notification = {
  id: string;
  company_id: string | null;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  created_at: string;
};
