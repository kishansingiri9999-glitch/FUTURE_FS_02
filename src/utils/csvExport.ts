import { Lead } from '../types';
import { format } from 'date-fns';

export function exportLeadsToCSV(leads: Lead[]): void {
  const headers = ['Name', 'Email', 'Phone', 'Company', 'Source', 'Status', 'Priority', 'Assigned To', 'Follow Up Date', 'Notes', 'Created At'];

  const rows = leads.map(lead => [
    lead.full_name,
    lead.email,
    lead.phone,
    lead.company_name || '',
    lead.source,
    lead.status,
    lead.priority,
    lead.assigned_to || '',
    lead.follow_up_date || '',
    lead.notes || '',
    format(new Date(lead.created_at), 'yyyy-MM-dd HH:mm:ss')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
