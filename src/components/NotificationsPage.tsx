import { useEffect, useState } from 'react';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { Bell, UserPlus, Calendar, CheckCircle, AlertTriangle, Trash2, Check, Loader2 } from 'lucide-react';

const typeConfig = {
  new_lead: { icon: UserPlus, color: 'text-purple-600', bg: 'bg-purple-100', label: 'New Lead' },
  follow_up_reminder: { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Follow Up' },
  lead_converted: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Converted' },
  missed_follow_up: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Missed' }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch { console.error('Failed to fetch notifications'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { console.error('Failed to mark as read'); }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;
      const { error } = await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { console.error('Failed to mark all as read'); }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { console.error('Failed to delete'); }
  };

  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium">
            <Check className="w-4 h-4" />Mark all read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[{ id: 'all' as const, label: 'All' }, { id: 'unread' as const, label: 'Unread' }, { id: 'read' as const, label: 'Read' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{f.label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => {
            const config = typeConfig[n.type];
            return (
              <div key={n.id} className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-4 transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-l-purple-500' : 'border-gray-100'}`}>
                <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium text-gray-900 ${!n.read ? '' : 'opacity-70'}`}>{n.title}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${config.bg} ${config.color}`}>{config.label}</span>
                  </div>
                  {n.message && <p className="text-sm text-gray-500 mt-1">{n.message}</p>}
                  <p className="text-xs text-gray-400 mt-1">{format(parseISO(n.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Mark as read">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
