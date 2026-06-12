import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Lead, FollowUp } from '../types';
import { Dashboard } from './Dashboard';
import { LeadsTable } from './LeadsTable';
import { FollowUpsPage } from './FollowUpsPage';
import { AnalyticsPage } from './AnalyticsPage';
import { ReportsPage } from './ReportsPage';
import { LeadSourcesPage } from './LeadSourcesPage';
import { ConversionTrackingPage } from './ConversionTrackingPage';
import { NotificationsPage } from './NotificationsPage';
import { UserProfilePage } from './UserProfilePage';
import { SettingsPage } from './SettingsPage';
import {
  LayoutDashboard, Users, Calendar, BarChart3, FileText,
  Globe, Target, Bell, UserCircle, Settings, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react';

type ActiveView = 'dashboard' | 'leads' | 'followups' | 'analytics' | 'reports' | 'sources' | 'conversion' | 'notifications' | 'profile' | 'settings';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, followUpsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('follow_ups').select('*').order('due_date', { ascending: true }).limit(500)
      ]);
      if (leadsRes.error) throw leadsRes.error;
      if (followUpsRes.error) throw followUpsRes.error;
      setLeads(leadsRes.data || []);
      setFollowUps(followUpsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const navItems: { id: ActiveView; label: string; icon: typeof LayoutDashboard; section?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Main' },
    { id: 'leads', label: 'Leads', icon: Users, section: 'Main' },
    { id: 'followups', label: 'Follow Ups', icon: Calendar, section: 'Main' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'Insights' },
    { id: 'reports', label: 'Reports', icon: FileText, section: 'Insights' },
    { id: 'sources', label: 'Lead Sources', icon: Globe, section: 'Insights' },
    { id: 'conversion', label: 'Conversion Tracking', icon: Target, section: 'Insights' },
    { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Account' },
    { id: 'profile', label: 'User Profile', icon: UserCircle, section: 'Account' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'Account' }
  ];

  const sections = ['Main', 'Insights', 'Account'];

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': return <Dashboard leads={leads} followUps={followUps} />;
      case 'leads': return <LeadsTable leads={leads} onLeadsUpdate={fetchData} />;
      case 'followups': return <FollowUpsPage followUps={followUps} leads={leads} onUpdate={fetchData} />;
      case 'analytics': return <AnalyticsPage leads={leads} />;
      case 'reports': return <ReportsPage leads={leads} />;
      case 'sources': return <LeadSourcesPage leads={leads} />;
      case 'conversion': return <ConversionTrackingPage leads={leads} />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <UserProfilePage />;
      case 'settings': return <SettingsPage />;
    }
  };

  const viewTitles: Record<ActiveView, { title: string; desc: string }> = {
    dashboard: { title: 'Dashboard', desc: 'Overview of your leads and performance' },
    leads: { title: 'Lead Management', desc: 'Manage and track all your leads' },
    followups: { title: 'Follow Ups', desc: 'Track and manage follow-up activities' },
    analytics: { title: 'Analytics', desc: 'Deep insights into your lead pipeline' },
    reports: { title: 'Reports', desc: 'Generate and export reports' },
    sources: { title: 'Lead Sources', desc: 'Analyze performance by lead source' },
    conversion: { title: 'Conversion Tracking', desc: 'Monitor your conversion pipeline' },
    notifications: { title: 'Notifications', desc: 'Stay updated on lead activity' },
    profile: { title: 'User Profile', desc: 'Your account details' },
    settings: { title: 'Settings', desc: 'Manage your preferences' }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 to-indigo-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} overflow-y-auto`}>
        <div className="flex flex-col min-h-screen">
          {/* Logo */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">LeadFlow CRM</h1>
                  <p className="text-purple-200 text-xs">Client Lead Management</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {sections.map(section => (
              <div key={section}>
                <p className="text-purple-300/60 text-[10px] font-semibold uppercase tracking-wider px-3 py-2 mt-2">{section}</p>
                {navItems.filter(n => n.section === section).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      activeView === item.id
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-purple-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {activeView === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">{user?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user?.full_name}</p>
                <p className="text-purple-200 text-xs truncate">@{user?.username}</p>
              </div>
              <button onClick={logout} className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{viewTitles[activeView].title}</h2>
                <p className="text-gray-500 text-sm">{viewTitles[activeView].desc}</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={fetchData} className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
                Refresh
              </button>
              <button onClick={() => handleNavClick('notifications')} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
