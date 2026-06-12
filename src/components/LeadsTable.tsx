import { useState, useMemo } from 'react';
import { Lead, LeadSource, LeadStatus, LeadPriority } from '../types';
import { exportLeadsToCSV } from '../utils/csvExport';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Search, Download, Trash2, Edit2, X, Save, FileText, Eye, Loader2 } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onLeadsUpdate: () => void;
}

const statusOptions: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const sourceOptions: LeadSource[] = ['Website', 'Referral', 'Instagram', 'LinkedIn', 'Other'];
const priorityOptions: LeadPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export function LeadsTable({ leads, onLeadsUpdate }: LeadsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = search === '' ||
        lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        (lead.company_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        lead.phone.includes(search);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
  }, [leads, search, statusFilter, sourceFilter, priorityFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      onLeadsUpdate();
    } catch { alert('Failed to delete lead'); } finally { setDeleting(null); }
  };

  const handleEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setEditData({ ...lead });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('leads').update({ ...editData, updated_at: new Date().toISOString() }).eq('id', editingId);
      if (error) throw error;
      setEditingId(null);
      setEditData({});
      onLeadsUpdate();
    } catch { alert('Failed to update lead'); } finally { setSaving(false); }
  };

  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'Lost') update.lost = true;
      const { error } = await supabase.from('leads').update(update).eq('id', id);
      if (error) throw error;
      onLeadsUpdate();
    } catch { alert('Failed to update status'); }
  };

  const handleUpdateNotes = async (id: string) => {
    try {
      const { error } = await supabase.from('leads').update({ notes: notesValue, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setShowNotes(null);
      onLeadsUpdate();
    } catch { alert('Failed to update notes'); }
  };

  const openNotesModal = (lead: Lead) => {
    setShowNotes(lead.id);
    setNotesValue(lead.notes || '');
  };

  const priorityBadge = (priority: LeadPriority) => {
    const cls = priority === 'Critical' ? 'bg-red-100 text-red-700' :
      priority === 'High' ? 'bg-orange-100 text-orange-700' :
      priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
      'bg-gray-100 text-gray-700';
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cls}`}>{priority}</span>;
  };

  const statusBadge = (status: LeadStatus) => {
    const cls = status === 'New' ? 'bg-purple-100 text-purple-700' :
      status === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
      status === 'Qualified' ? 'bg-yellow-100 text-yellow-700' :
      status === 'Converted' ? 'bg-green-100 text-green-700' :
      'bg-red-100 text-red-700';
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${cls}`}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
        <button onClick={() => exportLeadsToCSV(filteredLeads)} disabled={filteredLeads.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
          <Download className="w-4 h-4" />Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search leads..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer text-sm">
          <option value="all">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer text-sm">
          <option value="all">All Sources</option>
          {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white cursor-pointer text-sm">
          <option value="all">All Priority</option>
          {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-500">Showing {filteredLeads.length} of {leads.length} leads</p>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Phone</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Company</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Assigned To</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Follow Up</th>
                <th className="text-right py-4 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No leads found</td></tr>
              ) : filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    {editingId === lead.id ? (
                      <input type="text" value={editData.full_name || ''} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : <span className="font-medium text-gray-900 text-sm">{lead.full_name}</span>}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {editingId === lead.id ? (
                      <input type="email" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : lead.email}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden lg:table-cell">
                    {editingId === lead.id ? (
                      <input type="tel" value={editData.phone || ''} onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : lead.phone}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden md:table-cell">
                    {editingId === lead.id ? (
                      <input type="text" value={editData.company_name || ''} onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : lead.company_name || '-'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {editingId === lead.id ? (
                      <select value={editData.source || ''} onChange={(e) => setEditData({ ...editData, source: e.target.value as LeadSource })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none">
                        {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : lead.source}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === lead.id ? (
                      <select value={editData.status || ''} onChange={(e) => setEditData({ ...editData, status: e.target.value as LeadStatus })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <select value={lead.status} onChange={(e) => handleUpdateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer font-medium ${
                          lead.status === 'New' ? 'bg-purple-100 text-purple-700' :
                          lead.status === 'Contacted' ? 'bg-indigo-100 text-indigo-700' :
                          lead.status === 'Qualified' ? 'bg-yellow-100 text-yellow-700' :
                          lead.status === 'Converted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingId === lead.id ? (
                      <select value={editData.priority || ''} onChange={(e) => setEditData({ ...editData, priority: e.target.value as LeadPriority })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm outline-none">
                        {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : priorityBadge(lead.priority)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden xl:table-cell">
                    {editingId === lead.id ? (
                      <input type="text" value={editData.assigned_to || ''} onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : lead.assigned_to || '-'}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 hidden xl:table-cell">
                    {editingId === lead.id ? (
                      <input type="date" value={editData.follow_up_date || ''} onChange={(e) => setEditData({ ...editData, follow_up_date: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
                    ) : lead.follow_up_date ? format(new Date(lead.follow_up_date), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === lead.id ? (
                        <>
                          <button onClick={handleSave} disabled={saving}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={() => { setEditingId(null); setEditData({}); }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setViewLead(lead)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openNotesModal(lead)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Notes">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(lead)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(lead.id)} disabled={deleting === lead.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                            {deleting === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Lead Notes</h3>
              <button onClick={() => setShowNotes(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-6">
              <textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} rows={4}
                placeholder="Add notes about this lead..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none" />
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowNotes(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleUpdateNotes(showNotes)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Save Notes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Lead Details Modal */}
      {viewLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-scale-in">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium text-gray-900">{viewLead.full_name}</p></div>
                <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-900">{viewLead.email}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-900">{viewLead.phone}</p></div>
                <div><p className="text-xs text-gray-500">Company</p><p className="font-medium text-gray-900">{viewLead.company_name || '-'}</p></div>
                <div><p className="text-xs text-gray-500">Source</p><p className="font-medium text-gray-900">{viewLead.source}</p></div>
                <div><p className="text-xs text-gray-500">Status</p>{statusBadge(viewLead.status)}</div>
                <div><p className="text-xs text-gray-500">Priority</p>{priorityBadge(viewLead.priority)}</div>
                <div><p className="text-xs text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{viewLead.assigned_to || 'Unassigned'}</p></div>
                <div><p className="text-xs text-gray-500">Follow Up</p><p className="font-medium text-gray-900">{viewLead.follow_up_date ? format(new Date(viewLead.follow_up_date), 'MMM d, yyyy') : 'Not set'}</p></div>
                <div><p className="text-xs text-gray-500">Created</p><p className="font-medium text-gray-900">{format(new Date(viewLead.created_at), 'MMM d, yyyy HH:mm')}</p></div>
              </div>
              {viewLead.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{viewLead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
