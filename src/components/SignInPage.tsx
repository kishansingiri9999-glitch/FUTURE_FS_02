import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, AlertCircle, Loader2, Users } from 'lucide-react';

export function SignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(identifier, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
            <Users className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LeadFlow CRM</h1>
          <p className="text-purple-100 text-sm mt-1">Client Lead Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-sm">Access your dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Username or Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter username or email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="pt-2 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign Up
              </a>
            </p>
          </div>

          <div className="text-center">
            <a href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              Back to Contact Form
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
