import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/profile?_t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setProfile(data.data);
        setFormData({ name: data.data.name || '', email: data.data.email || '', password: '' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updatePayload = {};
      if (formData.name !== profile.name) updatePayload.name = formData.name;
      if (formData.email !== profile.email) updatePayload.email = formData.email;
      if (formData.password) updatePayload.password = formData.password;

      if (Object.keys(updatePayload).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save.' });
        setSaving(false);
        return;
      }

      const { data } = await axios.put(`${API_URL}/api/admins/profile`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setProfile(data.data);
        setFormData(prev => ({ ...prev, password: '' }));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500 animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
          <p className="text-gray-500 mt-1">Manage your personal information and security.</p>
        </div>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <ShieldCheck className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-4 bg-gray-50/50">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-[#F59E0B] border-4 border-white shadow-sm">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{profile.name || 'Admin User'}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {profile.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {message.text && (
            <div className={cn(
              "p-4 rounded-lg flex items-center text-sm font-medium",
              message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : 
              message.type === 'error' ? "bg-red-50 text-red-700 border border-red-200" :
              "bg-blue-50 text-blue-700 border border-blue-200"
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Leave blank to keep current)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2.5 bg-[#F59E0B] hover:bg-orange-600 text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
