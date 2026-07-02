
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  sector TEXT,
  registration_number TEXT,
  tax_id TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  country TEXT DEFAULT 'Saudi Arabia',
  employees_count INTEGER,
  annual_revenue NUMERIC,
  website TEXT,
  description TEXT,
  relationship_manager TEXT,
  relationship_since DATE,
  risk_rating TEXT DEFAULT 'Medium',
  customer_segment TEXT DEFAULT 'Corporate',
  status TEXT DEFAULT 'Active',
  logo_initials TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banking_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  account_number TEXT,
  limit_amount NUMERIC,
  outstanding_amount NUMERIC,
  currency TEXT DEFAULT 'SAR',
  start_date DATE,
  expiry_date DATE,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  period TEXT DEFAULT 'Annual',
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  total_equity NUMERIC,
  total_revenue NUMERIC,
  gross_profit NUMERIC,
  operating_income NUMERIC,
  net_income NUMERIC,
  operating_cash_flow NUMERIC,
  investing_cash_flow NUMERIC,
  financing_cash_flow NUMERIC,
  current_ratio NUMERIC,
  debt_to_equity NUMERIC,
  return_on_equity NUMERIC,
  return_on_assets NUMERIC,
  gross_margin NUMERIC,
  net_margin NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  status TEXT DEFAULT 'Missing',
  expiry_date DATE,
  upload_date DATE,
  issuing_authority TEXT,
  notes TEXT,
  required_for TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  priority TEXT DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE banking_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies (drop first to avoid conflicts)
DO $$ BEGIN
  DROP POLICY IF EXISTS "select_companies" ON companies;
  DROP POLICY IF EXISTS "insert_companies" ON companies;
  DROP POLICY IF EXISTS "update_companies" ON companies;
  DROP POLICY IF EXISTS "delete_companies" ON companies;
  DROP POLICY IF EXISTS "select_banking_products" ON banking_products;
  DROP POLICY IF EXISTS "insert_banking_products" ON banking_products;
  DROP POLICY IF EXISTS "update_banking_products" ON banking_products;
  DROP POLICY IF EXISTS "delete_banking_products" ON banking_products;
  DROP POLICY IF EXISTS "select_financial_statements" ON financial_statements;
  DROP POLICY IF EXISTS "insert_financial_statements" ON financial_statements;
  DROP POLICY IF EXISTS "update_financial_statements" ON financial_statements;
  DROP POLICY IF EXISTS "delete_financial_statements" ON financial_statements;
  DROP POLICY IF EXISTS "select_documents" ON documents;
  DROP POLICY IF EXISTS "insert_documents" ON documents;
  DROP POLICY IF EXISTS "update_documents" ON documents;
  DROP POLICY IF EXISTS "delete_documents" ON documents;
  DROP POLICY IF EXISTS "select_timeline_events" ON timeline_events;
  DROP POLICY IF EXISTS "insert_timeline_events" ON timeline_events;
  DROP POLICY IF EXISTS "update_timeline_events" ON timeline_events;
  DROP POLICY IF EXISTS "delete_timeline_events" ON timeline_events;
  DROP POLICY IF EXISTS "select_notifications" ON notifications;
  DROP POLICY IF EXISTS "insert_notifications" ON notifications;
  DROP POLICY IF EXISTS "update_notifications" ON notifications;
  DROP POLICY IF EXISTS "delete_notifications" ON notifications;
END $$;

CREATE POLICY "select_companies" ON companies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_companies" ON companies FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_companies" ON companies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_companies" ON companies FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_banking_products" ON banking_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_banking_products" ON banking_products FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_banking_products" ON banking_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_banking_products" ON banking_products FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_financial_statements" ON financial_statements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_financial_statements" ON financial_statements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_financial_statements" ON financial_statements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_financial_statements" ON financial_statements FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_documents" ON documents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_documents" ON documents FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_documents" ON documents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_documents" ON documents FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_timeline_events" ON timeline_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_timeline_events" ON timeline_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_timeline_events" ON timeline_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_timeline_events" ON timeline_events FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);
