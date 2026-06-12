import { useMemo } from 'react';
import { Lead } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConversionTrackingPageProps {
  leads: Lead[];
}

export function ConversionTrackingPage({ leads }: ConversionTrackingPageProps) {
  const today = new Date();

  const totalConverted = leads.filter(l => l.status === 'Converted').length;
  const totalLost = leads.filter(l => l.status === 'Lost' || l.lost).length;
  const conversionRate = leads.length > 0 ? ((totalConverted / leads.length) * 100).toFixed(1) : '0';

  const pipelineData = useMemo(() => [
    { stage: 'New', count: leads.filter(l => l.status === 'New').length, color: '#a855f7' },
    { stage: 'Contacted', count: leads.filter(l => l.status === 'Contacted').length, color: '#6366f1' },
    { stage: 'Qualified', count: leads.filter(l => l.status === 'Qualified').length, color: '#f59e0b' },
    { stage: 'Converted', count: totalConverted, color: '#22c55e' },
    { stage: 'Lost', count: totalLost, color: '#ef4444' }
  ].filter(d => d.count > 0), [leads, totalConverted, totalLost]);

  const conversionBySource = useMemo(() => {
    const sources = ['Website', 'Referral', 'Instagram', 'LinkedIn', 'Other'];
    return sources.map(source => {
      const src = leads.filter(l => l.source === source);
      const conv = src.filter(l => l.status === 'Converted').length;
      return { source, total: src.length, converted: conv, rate: src.length > 0 ? ((conv / src.length) * 100).toFixed(1) : '0' };
    }).filter(s => s.total > 0);
  }, [leads]);

  const conversionTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subDays(today, i * 30);
      const monthLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      });
      const converted = monthLeads.filter(l => l.status === 'Converted').length;
      months.push({ name: format(d, 'MMM'), rate: monthLeads.length > 0 ? Number(((converted / monthLeads.length) * 100).toFixed(1)) : 0 });
    }
    return months;
  }, [leads, today]);

  const timeToConvert = useMemo(() => {
    const converted = leads.filter(l => l.status === 'Converted');
    if (converted.length === 0) return null;
    const days = converted.map(l => {
      const created = parseISO(l.created_at);
      const updated = parseISO(l.updated_at);
      return Math.max(1, Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    });
    return { avg: (days.reduce((a, b) => a + b, 0) / days.length).toFixed(0), min: Math.min(...days), max: Math.max(...days) };
  }, [leads]);

  const trendDirection = conversionTrend.length >= 2
    ? conversionTrend[conversionTrend.length - 1].rate > conversionTrend[conversionTrend.length - 2].rate ? 'up' : conversionTrend[conversionTrend.length - 1].rate < conversionTrend[conversionTrend.length - 2].rate ? 'down' : 'stable'
    : 'stable';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Conversion Tracking</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-sm text-gray-500">Overall Rate</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-purple-600">{totalConverted}</p>
          <p className="text-sm text-gray-500">Total Converted</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-red-600">{totalLost}</p>
          <p className="text-sm text-gray-500">Total Lost</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            {trendDirection === 'up' ? <TrendingUp className="w-6 h-6 text-green-600" /> :
             trendDirection === 'down' ? <TrendingDown className="w-6 h-6 text-red-600" /> :
             <Minus className="w-6 h-6 text-gray-400" />}
            <span className="text-sm text-gray-500">Trend</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 capitalize">{trendDirection}</p>
        </div>
      </div>

      {/* Conversion Pipeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Pipeline</h3>
        <div className="space-y-4">
          {pipelineData.map((stage) => {
            const maxWidth = Math.max(...pipelineData.map(s => s.count));
            return (
              <div key={stage.stage} className="flex items-center gap-4">
                <span className="text-sm text-gray-700 w-24">{stage.stage}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                  <div className="h-10 rounded-full flex items-center pl-3 transition-all duration-500"
                    style={{ width: `${maxWidth > 0 ? (stage.count / maxWidth) * 100 : 0}%`, backgroundColor: stage.color }}>
                    <span className="text-white text-sm font-medium">{stage.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Distribution</h3>
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion by Source</h3>
          {conversionBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
        </div>
      </div>

      {/* Conversion Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trend</h3>
        {conversionTrend.some(d => d.rate > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="h-[300px] flex items-center justify-center text-gray-400">No data</div>}
      </div>

      {/* Time to Convert */}
      {timeToConvert && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Time to Convert</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{timeToConvert.avg}</p>
              <p className="text-sm text-gray-500">Avg Days</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{timeToConvert.min}</p>
              <p className="text-sm text-gray-500">Fastest (Days)</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{timeToConvert.max}</p>
              <p className="text-sm text-gray-500">Slowest (Days)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
