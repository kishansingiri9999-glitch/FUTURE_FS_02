import { useMemo } from 'react';
import { Lead, FollowUp } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, UserCheck, Target, Award, Star, XCircle, CalendarCheck, ClipboardList, ArrowUpRight } from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfDay, parseISO } from 'date-fns';

interface DashboardProps {
  leads: Lead[];
  followUps: FollowUp[];
}

export function Dashboard({ leads, followUps }: DashboardProps) {
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const contactedLeads = leads.filter(l => l.status === 'Contacted').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const lostLeads = leads.filter(l => l.status === 'Lost' || l.lost).length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  const today = startOfDay(new Date());
  const activeFollowUps = followUps.filter(f => !f.completed && isAfter(parseISO(f.due_date), subDays(today, 1))).length;
  const pendingTasks = followUps.filter(f => !f.completed).length;

  // Monthly growth: compare current month leads to previous month
  const monthlyGrowth = useMemo(() => {
    const thisMonth = leads.filter(l => {
      const d = parseISO(l.created_at);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    const lastMonth = leads.filter(l => {
      const d = parseISO(l.created_at);
      const lm = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const ly = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      return d.getMonth() === lm && d.getFullYear() === ly;
    }).length;
    if (lastMonth === 0) return thisMonth > 0 ? '+100' : '0';
    return (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(0);
  }, [leads, today]);

  const statusData = [
    { name: 'New', value: newLeads, color: '#a855f7' },
    { name: 'Contacted', value: contactedLeads, color: '#6366f1' },
    { name: 'Qualified', value: qualifiedLeads, color: '#f59e0b' },
    { name: 'Converted', value: convertedLeads, color: '#22c55e' },
    { name: 'Lost', value: lostLeads, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const sourceData = leads.reduce((acc, lead) => {
    const existing = acc.find(d => d.name === lead.source);
    if (existing) existing.value++;
    else acc.push({ name: lead.source, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  // Monthly lead growth (last 6 months)
  const monthlyGrowthData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subDays(today, i * 30);
      const monthLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      }).length;
      months.push({ name: format(d, 'MMM'), leads: monthLeads });
    }
    return months;
  }, [leads, today]);

  // Conversion trend (last 6 months)
  const conversionTrendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subDays(today, i * 30);
      const monthLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
      });
      const converted = monthLeads.filter(l => l.status === 'Converted').length;
      const rate = monthLeads.length > 0 ? ((converted / monthLeads.length) * 100).toFixed(1) : 0;
      months.push({ name: format(d, 'MMM'), rate: Number(rate) });
    }
    return months;
  }, [leads, today]);

  // Weekly performance (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekEnd = subDays(today, i * 7);
      const weekStart = subDays(weekEnd, 7);
      const weekLeads = leads.filter(l => {
        const ld = parseISO(l.created_at);
        return isAfter(ld, weekStart) && isBefore(ld, weekEnd);
      }).length;
      weeks.push({ name: `W${8 - i}`, leads: weekLeads });
    }
    return weeks;
  }, [leads, today]);

  const stats = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'New Leads', value: newLeads, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Contacted', value: contactedLeads, icon: UserCheck, color: 'bg-violet-100 text-violet-600' },
    { label: 'Qualified', value: qualifiedLeads, icon: Star, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Converted', value: convertedLeads, icon: Target, color: 'bg-green-100 text-green-600' },
    { label: 'Lost Leads', value: lostLeads, icon: XCircle, color: 'bg-red-100 text-red-600' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Award, color: 'bg-rose-100 text-rose-600' },
    { label: 'Monthly Growth', value: `${monthlyGrowth}%`, icon: ArrowUpRight, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Active Follow Ups', value: activeFollowUps, icon: CalendarCheck, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pending Tasks', value: pendingTasks, icon: ClipboardList, color: 'bg-orange-100 text-orange-600' }
  ];

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h3>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {sourceData.map((_, index) => <Cell key={`cell-${index}`} fill={['#a855f7', '#6366f1', '#8b5cf6', '#c084fc', '#d946ef'][index % 5]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Lead Growth</h3>
          {monthlyGrowthData.some(d => d.leads > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#a855f7" fill="#e9d5ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Trend</h3>
          {conversionTrendData.some(d => d.rate > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={conversionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>}
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
        {weeklyData.some(d => d.leads > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <div className="h-[280px] flex items-center justify-center text-gray-400">No data available</div>}
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h3>
        {recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 hidden md:table-cell">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">{lead.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{lead.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{lead.company_name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        lead.status === 'New' ? 'bg-purple-100 text-purple-700' :
                        lead.status === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
                        lead.status === 'Qualified' ? 'bg-yellow-100 text-yellow-700' :
                        lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>{lead.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        lead.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        lead.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        lead.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{lead.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-center py-8">No leads yet</p>}
      </div>
    </div>
  );
}
