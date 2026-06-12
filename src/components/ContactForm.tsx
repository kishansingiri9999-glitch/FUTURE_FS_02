import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LeadSource } from '../types';
import { Send, User, Mail, Phone, Building, Globe, CheckCircle, Loader2, Users } from 'lucide-react';

const sources: LeadSource[] = ['Website', 'Referral', 'Instagram', 'LinkedIn', 'Other'];

export function ContactForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    source: 'Website' as LeadSource
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('leads').insert({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name || null,
        source: formData.source,
        status: 'New'
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        source: 'Website'
      });
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your message has been submitted successfully. Our team will get back to you shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">LeadFlow CRM</h1>
              <p className="text-purple-200 text-xs">Client Lead Management System</p>
            </div>
          </div>
          <a
            href="/signin"
            className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Sign In
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Get in Touch
        </h2>
        <p className="text-purple-200 text-lg max-w-2xl mx-auto">
          We're here to help your business grow. Fill out the form below and our team will reach out to discuss how we can work together.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto p-6 pb-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="text-purple-100 text-sm mt-1">Tell us about your project</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </div>

            {/* Lead Source */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">How did you hear about us? *</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none appearance-none bg-white cursor-pointer"
                >
                  {sources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
