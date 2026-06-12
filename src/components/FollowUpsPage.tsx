import { useState, useMemo } from 'react';
import { FollowUp, Lead } from '../types';
import { supabase } from '../lib/supabase';
import { format, isAfter, isToday, isBefore, parseISO, startOfDay } from 'date-fns';
import { Calendar, Clock, CheckCircle2, AlertCircle, Plus, X, Loader2, ArrowRight } from 'lucide-react';

interface FollowUpsPageProps {
  followUps: FollowUp[];
  leads: Lead[];
  onUpdate: () => void;
}

export function FollowUpsPage({ followUps, leads, onUpdate }: FollowUpsPageProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ lead_id: '', title: '', description: '', due_date: '' });
  const [tab, setTab] = useState<'upcoming' | 'overdue' | 'today' | 'completed'>('upcoming');

  const today = startOfDay(new Date());

  const categorized = useMemo(() => {
    const upcoming = followUps.filter(f => !f.completed && isAfter(parseISO(f.due_date), today));
    const overdue = followUps.filter(f => !f.completed && isBefore(parseISO(f.due_date), today));
    const todays = followUps.filter(f => !f.completed && isToday(parseISO(f.due_date)));
    const completed = followUps.filter(f => f.completed);
    return { upcoming, overdue, today: todays, completed };
  }, [followUps, today]);

  const activeList = categorized[tab];

  const handleAdd = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('follow_ups').insert({
        lead_id: formData.lead_id,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date
      });
      if (error) throw error;
      setShowAdd(false);
      setFormData({ lead_id: '', title: '', description: '', due_date: '' });
      onUpdate();
    } catch { alert('Failed to add follow up'); } finally { setSaving(false); }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from('follow_ups').update({ completed: !completed, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch { alert('Failed to update'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this follow up?')) return;
    try {
      const { error } = await supabase.from('follow_ups').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch { alert('Failed to delete'); }
  };

  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.full_name : 'Unknown';
  };

  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: categorized.upcoming.length, icon: Clock, color: 'text-purple-600' },
    { id: 'overdue' as const, label: 'Overdue', count: categorized.overdue.length, icon: AlertCircle, color: 'text-red-600' },
    { id: 'today' as const, label: "Today", count: categorized.today.length, icon: Calendar, color: 'text-blue-600' },
    { id: 'completed' as const, label: 'Completed', count: categorized.completed.length, icon: CheckCircle2, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Follow Ups</h2>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />Add Follow Up
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <t.icon className={`w-4 h-4 ${t.color}`} />
            {t.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              tab === t.id ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {activeList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-400">No {tab} follow ups</p>
          </div>
        ) : activeList.map(fu => (
          <div key={fu.id} className={`bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4 transition-all hover:shadow-md ${fu.completed ? 'opacity-60' : ''} ${
            tab === 'overdue' ? 'border-red-200' : tab === 'today' ? 'border-blue-200' : 'border-gray-100'
          }`}>
            <button onClick={() => handleToggleComplete(fu.id, fu.completed)}
              className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                fu.completed ? 'bg-green-100 border-green-400' : 'border-gray-300 hover:border-purple-400'
              }`}>
              {fu.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-gray-900 ${fu.completed ? 'line-through' : ''}`}>{fu.title}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" />{getLeadName(fu.lead_id)}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(fu.due_date), 'MMM d, yyyy')}</span>
              </div>
              {fu.description && <p className="text-sm text-gray-400 mt-1 truncate">{fu.description}</p>}
            </div>
            <button onClick={() => handleDelete(fu.id)}
              className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add Follow Up</h3>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
                <select value={formData.lead_id} onChange={(e) => setFormData({ ...formData, lead_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                  <option value="">Select a lead</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.full_name} - {l.company_name || l.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Follow up title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !formData.lead_id || !formData.title || !formData.due_date}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
