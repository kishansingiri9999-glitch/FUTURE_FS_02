import { useMemo } from 'react';
import { Lead } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { format, subDays, parseISO, startOfMonth } from 'date-fns';

interface AnalyticsPageProps {
  leads: Lead[];
}

export function AnalyticsPage({ leads }: AnalyticsPageProps) {
  const today = new Date();

  const sourcePerformance = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const existing = acc.find(d => d.source === lead.source);
      if (existing) {
        existing.total++;
        if (lead.status === 'Converted') existing.converted++;
        if (lead.status === 'Lost' || lead.lost) existing.lost++;
      } else {
        acc.push({ source: lead.source, total: 1, converted: lead.status === 'Converted' ? 1 : 0, lost: (lead.status === 'Lost' || lead.lost) ? 1 : 0 });
      }
      return acc;
    }, [] as { source: string; total: number; converted: number; lost: number }[]).map(s => ({
      ...s,
      conversionRate: s.total > 0 ? ((s.converted / s.total) * 100).toFixed(1) : '0'
    }));
  }, [leads]);

  const bestSource = useMemo(() => {
    if (sourcePerformance.length === 0) return null;
    return sourcePerformance.reduce((best, curr) => Number(curr.conversionRate) > Number(best.conversionRate) ? curr : best);
  }, [sourcePerformance]);

  const monthlyComparison = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subDays(today, i * 30);
      const monthStart = startOfMonth(d);
      const monthLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return ld >= monthStart && ld <= d;
      });
      const converted = monthLeads.filter(l => l.status === 'Converted').length;
      const lost = monthLeads.filter(l => l.status === 'Lost' || l.lost).length;
      months.push({
        name: format(d, 'MMM yyyy'),
        total: monthLeads.length,
        converted,
        lost,
        rate: monthLeads.length > 0 ? ((converted / monthLeads.length) * 100).toFixed(1) : '0'
      });
    }
    return months;
  }, [leads, today]);

  const growthTrend = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i);
      const dayLeads = leads.filter(l => format(parseISO(l.created_at), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).length;
      days.push({ name: format(d, 'MMM d'), leads: dayLeads });
    }
    return days;
  }, [leads, today]);

  const conversionBySource = useMemo(() => {
    return sourcePerformance.map(s => ({
      name: s.source,
      rate: Number(s.conversionRate),
      total: s.total
    }));
  }, [sourcePerformance]);

  const overallConversion = leads.length > 0
    ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Overall Conversion</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">{overallConversion}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Best Performing Source</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{bestSource?.source || 'N/A'}</p>
          {bestSource && <p className="text-sm text-gray-400 mt-1">{bestSource.conversionRate}% conversion rate</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Leads Analyzed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{leads.length}</p>
        </div>
      </div>

      {/* Source Performance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Source Performance</h3>
        {sourcePerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Leads</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Converted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lost</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {sourcePerformance.map((s) => (
                  <tr key={s.source} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{s.source}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{s.total}</td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">{s.converted}</td>
                    <td className="py-3 px-4 text-sm text-red-600 font-medium">{s.lost}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(Number(s.conversionRate), 100)}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{s.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-center py-8">No data available</p>}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion by Source</h3>
          {conversionBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
          {monthlyComparison.some(m => m.total > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#a855f7" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="converted" fill="#22c55e" name="Converted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" fill="#ef4444" name="Lost" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Growth Trend (Last 30 Days)</h3>
        {growthTrend.some(d => d.leads > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="leads" stroke="#a855f7" fill="#e9d5ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
      </div>
    </div>
  );
}
