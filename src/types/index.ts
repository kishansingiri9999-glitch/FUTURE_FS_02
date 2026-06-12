export type LeadSource = 'Website' | 'Referral' | 'Instagram' | 'LinkedIn' | 'Other';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type NotificationType = 'new_lead' | 'follow_up_reminder' | 'lead_converted' | 'missed_follow_up';

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string;
  follow_up_date: string | null;
  notes: string;
  lost: boolean;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  lead_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  created_at: string;
}
