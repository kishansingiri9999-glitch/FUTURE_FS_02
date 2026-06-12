import { useMemo } from 'react';
import { Lead, LeadSource } from '../types';
import { Globe, UserPlus, Instagram, Linkedin, HelpCircle, TrendingUp } from 'lucide-react';

interface LeadSourcesPageProps {
  leads: Lead[];
}

const sourceConfig: Record<LeadSource, { icon: typeof Globe; color: string; bg: string }> = {
  Website: { icon: Globe, color: 'text-purple-600', bg: 'bg-purple-100' },
  Referral: { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100' },
  Instagram: { icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-100' },
  LinkedIn: { icon: Linkedin, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  Other: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-100' }
};

export function LeadSourcesPage({ leads }: LeadSourcesPageProps) {
  const sourceStats = useMemo(() => {
    return (Object.keys(sourceConfig) as LeadSource[]).map(source => {
      const sourceLeads = leads.filter(l => l.source === source);
      const converted = sourceLeads.filter(l => l.status === 'Converted').length;
      const lost = sourceLeads.filter(l => l.status === 'Lost' || l.lost).length;
      return {
        source,
        total: sourceLeads.length,
        converted,
        lost,
        inProgress: sourceLeads.length - converted - lost,
        conversionRate: sourceLeads.length > 0 ? ((converted / sourceLeads.length) * 100).toFixed(1) : '0',
        newLeads: sourceLeads.filter(l => l.status === 'New').length
      };
    });
  }, [leads]);

  const bestSource = useMemo(() => {
    return sourceStats.reduce((best, curr) => Number(curr.conversionRate) > Number(best.conversionRate) ? curr : best, sourceStats[0]);
  }, [sourceStats]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Lead Sources</h2>

      {/* Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Source Performance Overview</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {sourceStats.map(stat => {
            const config = sourceConfig[stat.source];
            return (
              <div key={stat.source} className={`p-4 rounded-xl border ${stat.source === bestSource.source ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center`}>
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{stat.source}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.total}</p>
                <p className="text-xs text-gray-500">leads</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(Number(stat.conversionRate), 100)}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{stat.conversionRate}%</span>
                </div>
                {stat.source === bestSource.source && (
                  <p className="text-xs text-purple-600 font-medium mt-2">Best performer</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Source</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Leads</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">New</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">In Progress</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Converted</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Lost</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {sourceStats.map(stat => {
                const config = sourceConfig[stat.source];
                return (
                  <tr key={stat.source} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 ${config.bg} rounded-lg flex items-center justify-center`}>
                          <config.icon className={`w-3.5 h-3.5 ${config.color}`} />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{stat.source}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{stat.total}</td>
                    <td className="py-3 px-4 text-sm text-purple-600">{stat.newLeads}</td>
                    <td className="py-3 px-4 text-sm text-indigo-600">{stat.inProgress}</td>
                    <td className="py-3 px-4 text-sm text-green-600 font-medium">{stat.converted}</td>
                    <td className="py-3 px-4 text-sm text-red-600">{stat.lost}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(Number(stat.conversionRate), 100)}%` }} />
                        </div>
                        <span className="text-sm text-gray-600">{stat.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
