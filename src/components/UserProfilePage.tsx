import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { User, Mail, Calendar, Shield, Activity } from 'lucide-react';

export function UserProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const accountAge = Math.max(1, Math.round((Date.now() - parseISO(user.created_at).getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
              <span className="text-3xl font-bold text-white">{user.full_name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{user.full_name}</h3>
              <p className="text-purple-200">@{user.username}</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900">{user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="font-medium text-gray-900">{format(parseISO(user.created_at), 'MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium text-gray-900">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{accountAge}</p>
            <p className="text-sm text-gray-500">Days Active</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-indigo-600">Active</p>
            <p className="text-sm text-gray-500">Account Status</p>
          </div>
        </div>
      </div>
    </div>
  );
}
