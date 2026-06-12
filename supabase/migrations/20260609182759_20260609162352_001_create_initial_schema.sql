-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead sources table
CREATE TABLE IF NOT EXISTS lead_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversions table
CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  value NUMERIC(10, 2),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default lead sources
INSERT INTO lead_sources (name, description) VALUES
  ('Website', 'Leads from website contact form'),
  ('Referral', 'Leads from customer referrals'),
  ('Social Media', 'Leads from social media platforms'),
  ('Email Campaign', 'Leads from email marketing campaigns'),
  ('Direct', 'Direct leads from sales team')
ON CONFLICT DO NOTHING;

-- Insert sample leads
INSERT INTO leads (full_name, email, phone, company_name, source, status, notes) VALUES
  ('John Smith', 'john@example.com', '555-0101', 'Acme Corp', 'Website', 'new', 'Interested in enterprise plan'),
  ('Sarah Johnson', 'sarah@example.com', '555-0102', 'TechStart Inc', 'Referral', 'contacted', 'Follow up next week'),
  ('Mike Brown', 'mike@example.com', '555-0103', 'Global Solutions', 'Social Media', 'qualified', 'Ready for demo'),
  ('Emily Davis', 'emily@example.com', '555-0104', 'Innovation Labs', 'Email Campaign', 'new', 'Requested pricing info'),
  ('Chris Wilson', 'chris@example.com', '555-0105', 'Future Systems', 'Direct', 'contacted', 'Meeting scheduled for Friday')
ON CONFLICT DO NOTHING;
