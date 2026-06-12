import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Lock, Bell, Palette, Save, Loader2, Check } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'theme'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  // Password
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new_password: '',
    confirm: ''
  });

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    new_lead: true,
    follow_up: true,
    converted: true,
    missed: true
  });

  // Theme
  const [theme, setTheme] = useState('light');

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({
        full_name: profileForm.full_name,
        email: profileForm.email
      }).eq('id', user?.id);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Failed to update profile'); } finally { setSaving(false); }
  };

  const handleSavePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const { data } = await supabase.from('users').select('password_hash').eq('id', user?.id).single();
      if (!data || data.password_hash !== passwordForm.current) {
        alert('Current password is incorrect');
        return;
      }
      const { error } = await supabase.from('users').update({ password_hash: passwordForm.new_password }).eq('id', user?.id);
      if (error) throw error;
      setPasswordForm({ current: '', new_password: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('Failed to update password'); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'theme' as const, label: 'Theme', icon: Palette }
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSaved(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={user?.username || ''} disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Username cannot be changed</p>
          </div>
          <button onClick={handleSaveProfile} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Password Settings */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <button onClick={handleSavePassword} disabled={saving || !passwordForm.current || !passwordForm.new_password}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {saved ? 'Password Updated!' : 'Update Password'}
          </button>
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          {[
            { key: 'new_lead' as const, label: 'New Lead Added', desc: 'Get notified when a new lead is submitted' },
            { key: 'follow_up' as const, label: 'Follow Up Reminders', desc: 'Reminders for upcoming follow ups' },
            { key: 'converted' as const, label: 'Lead Converted', desc: 'When a lead is converted to a customer' },
            { key: 'missed' as const, label: 'Missed Follow Up', desc: 'Alert when a follow up is missed' }
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-900 text-sm">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.desc}</p>
              </div>
              <button onClick={() => setNotifPrefs({ ...notifPrefs, [pref.key]: !notifPrefs[pref.key] })}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifPrefs[pref.key] ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifPrefs[pref.key] ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Theme Settings */}
      {activeTab === 'theme' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'light', label: 'Light', bg: 'bg-white border-gray-300' },
              { id: 'dark', label: 'Dark', bg: 'bg-gray-900 border-gray-700' },
              { id: 'system', label: 'System', bg: 'bg-gradient-to-r from-white to-gray-900 border-gray-400' }
            ].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={`p-4 rounded-xl border-2 transition-all ${t.bg} ${theme === t.id ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}>
                <p className={`text-sm font-medium ${t.id === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Theme settings are saved locally</p>
        </div>
      )}
    </div>
  );
}
