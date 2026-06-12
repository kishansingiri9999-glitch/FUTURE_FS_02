-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  source TEXT NOT NULL CHECK (source IN ('Website', 'Referral', 'Instagram', 'LinkedIn', 'Other')),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table for authentication
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user (password: admin123 - in production, use proper bcrypt)
INSERT INTO admin_users (username, password_hash) VALUES ('admin', 'admin123');

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- For public lead submission, we need to allow inserts from anyone
CREATE POLICY "allow_public_insert" ON leads FOR INSERT
  WITH CHECK (true);

-- For reading leads, only authenticated admin can access
-- We'll handle auth at the app level since this is a simple demo
CREATE POLICY "allow_all_select" ON leads FOR SELECT
  USING (true);

CREATE POLICY "allow_all_update" ON leads FOR UPDATE
  USING (true);

CREATE POLICY "allow_all_delete" ON leads FOR DELETE
  USING (true);

-- Admin users policies
CREATE POLICY "allow_admin_select" ON admin_users FOR SELECT
  USING (true);

-- Create index for faster searches
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at);