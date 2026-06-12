import { useMemo, useState } from 'react';
import { Lead } from '../types';
import { exportLeadsToCSV } from '../utils/csvExport';
import { format, subDays, parseISO, startOfMonth } from 'date-fns';
import { Download, FileText, BarChart3, Calendar } from 'lucide-react';

interface ReportsPageProps {
  leads: Lead[];
}

export function ReportsPage({ leads }: ReportsPageProps) {
  const [reportType, setReportType] = useState<'lead' | 'conversion' | 'monthly'>('lead');
  const today = new Date();

  const leadReport = useMemo(() => ({
    total: leads.length,
    byStatus: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(status => ({
      status,
      count: leads.filter(l => l.status === status).length,
      percentage: leads.length > 0 ? ((leads.filter(l => l.status === status).length / leads.length) * 100).toFixed(1) : '0'
    })),
    bySource: ['Website', 'Referral', 'Instagram', 'LinkedIn', 'Other'].map(source => ({
      source,
      count: leads.filter(l => l.source === source).length,
      percentage: leads.length > 0 ? ((leads.filter(l => l.source === source).length / leads.length) * 100).toFixed(1) : '0'
    })),
    byPriority: ['Low', 'Medium', 'High', 'Critical'].map(priority => ({
      priority,
      count: leads.filter(l => l.priority === priority).length
    }))
  }), [leads]);

  const conversionReport = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter(l => l.status === 'Converted').length;
    const lost = leads.filter(l => l.status === 'Lost' || l.lost).length;
    const inProgress = total - converted - lost;
    return {
      total,
      converted,
      lost,
      inProgress,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : '0',
      lossRate: total > 0 ? ((lost / total) * 100).toFixed(1) : '0',
      avgDaysToConvert: converted > 0 ? 'N/A (calculated server-side)' : 'N/A'
    };
  }, [leads]);

  const monthlyReport = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subDays(today, i * 30);
      const monthStart = startOfMonth(d);
      const monthLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return ld >= monthStart;
      });
      const newL = monthLeads.filter(l => l.status === 'New').length;
      const converted = monthLeads.filter(l => l.status === 'Converted').length;
      months.push({
        month: format(d, 'MMMM yyyy'),
        total: monthLeads.length,
        new: newL,
        converted,
        rate: monthLeads.length > 0 ? ((converted / monthLeads.length) * 100).toFixed(1) : '0'
      });
    }
    return months;
  }, [leads, today]);

  const handleExportPDF = () => {
    const content = reportType === 'lead' ? leadReport : reportType === 'conversion' ? conversionReport : monthlyReport;
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leadflow_${reportType}_report_${format(today, 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportTabs = [
    { id: 'lead' as const, label: 'Lead Report', icon: FileText },
    { id: 'conversion' as const, label: 'Conversion Report', icon: BarChart3 },
    { id: 'monthly' as const, label: 'Monthly Report', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <div className="flex gap-2">
          <button onClick={() => exportLeadsToCSV(leads)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />Export CSV
          </button>
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />Export JSON
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 flex-wrap">
        {reportTabs.map(t => (
          <button key={t.id} onClick={() => setReportType(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === t.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Lead Report */}
      {reportType === 'lead' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{leadReport.total}</p>
                <p className="text-sm text-gray-600">Total Leads</p>
              </div>
              {leadReport.byStatus.map(s => (
                <div key={s.status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{s.count}</p>
                  <p className="text-sm text-gray-600">{s.status}</p>
                  <p className="text-xs text-gray-400">{s.percentage}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By Source</h3>
              <div className="space-y-3">
                {leadReport.bySource.map(s => (
                  <div key={s.source} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{s.source}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Number(s.percentage)}%` }} />
                      </div>
                      <span className="text-sm text-gray-600 w-16 text-right">{s.count} ({s.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h3>
              <div className="space-y-3">
                {leadReport.byPriority.map(p => (
                  <div key={p.priority} className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      p.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      p.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      p.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{p.priority}</span>
                    <span className="text-sm text-gray-600">{p.count} leads</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Report */}
      {reportType === 'conversion' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">{conversionReport.conversionRate}%</p>
              <p className="text-sm text-gray-500">Conversion Rate</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-green-600">{conversionReport.converted}</p>
              <p className="text-sm text-gray-500">Converted</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-red-600">{conversionReport.lossRate}%</p>
              <p className="text-sm text-gray-500">Loss Rate</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-3xl font-bold text-indigo-600">{conversionReport.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Leads', count: conversionReport.total, color: 'bg-purple-500' },
                { label: 'Contacted', count: leads.filter(l => ['Contacted', 'Qualified', 'Converted'].includes(l.status)).length, color: 'bg-indigo-500' },
                { label: 'Qualified', count: leads.filter(l => ['Qualified', 'Converted'].includes(l.status)).length, color: 'bg-yellow-500' },
                { label: 'Converted', count: conversionReport.converted, color: 'bg-green-500' }
              ].map((step) => (
                <div key={step.label} className="flex items-center gap-4">
                  <span className="text-sm text-gray-700 w-24">{step.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div className={`${step.color} h-8 rounded-full flex items-center pl-3 transition-all`}
                      style={{ width: `${conversionReport.total > 0 ? (step.count / conversionReport.total) * 100 : 0}%` }}>
                      <span className="text-white text-sm font-medium">{step.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {reportType === 'monthly' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Month</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">New</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Converted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyReport.map(m => (
                  <tr key={m.month} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{m.month}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{m.total}</td>
                    <td className="py-3 px-4 text-sm text-purple-600">{m.new}</td>
                    <td className="py-3 px-4 text-sm text-green-600">{m.converted}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(Number(m.rate), 100)}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{m.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
