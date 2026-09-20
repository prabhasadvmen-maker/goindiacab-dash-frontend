import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Settings as SettingsIcon, Percent, Server, Phone, Mail, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Settings() {
  const { superAdminToken, adminToken, superAdminUser, adminUser } = useAuthStore();
  const token = superAdminToken || adminToken;
  const user = superAdminUser || adminUser;
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const [settings, setSettings] = useState({
    platformCommission: 20,
    maintenanceMode: false,
    supportEmail: '',
    supportPhone: '',
    minAndroidVersion: '1.0.0',
    forceUpdate: false,
    isWalletEnabled: true,
    isReferralEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/settings?_t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.data) {
        setSettings({
          platformCommission: data.data.platformCommission || 20,
          maintenanceMode: data.data.maintenanceMode || false,
          supportEmail: data.data.supportEmail || '',
          supportPhone: data.data.supportPhone || '',
          minAndroidVersion: data.data.minAndroidVersion || '1.0.0',
          forceUpdate: data.data.forceUpdate || false,
          isWalletEnabled: data.data.isWalletEnabled !== undefined ? data.data.isWalletEnabled : true,
          isReferralEnabled: data.data.isReferralEnabled !== undefined ? data.data.isReferralEnabled : true
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await axios.put(`${API_URL}/api/admins/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Platform settings updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500 animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
          <p className="text-gray-500 mt-1">Configure global application variables.</p>
        </div>
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
          <SettingsIcon className="w-8 h-8" />
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <p className="text-orange-700 font-medium text-sm">
              You are viewing in Read-Only mode. Only SuperAdmins can modify global settings.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        {message.text && (
          <div className={cn(
            "p-4 rounded-lg flex items-center text-sm font-medium",
            message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg">Financial Settings</h3>
            <p className="text-sm text-gray-500">Configure commissions and fee structures.</p>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform Commission Rate (%)</label>
            <div className="relative max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Percent className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                max="100"
                disabled={!isSuperAdmin}
                value={settings.platformCommission}
                onChange={(e) => setSettings({...settings, platformCommission: Number(e.target.value)})}
                className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-60"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">The percentage of each ride fare that GoIndiaCab retains.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg">Support Details</h3>
            <p className="text-sm text-gray-500">Contact information shown to Customers and Partners.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  disabled={!isSuperAdmin}
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-60"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                  className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">System Status</h3>
              <p className="text-sm text-gray-500">Manage application availability.</p>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-500 mt-1">If enabled, all users and drivers will see a "Under Maintenance" screen.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.maintenanceMode}
                disabled={!isSuperAdmin}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        {/* Mobile App Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">App Configuration</h3>
              <p className="text-sm text-gray-500">Manage Android app versions and features.</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Android Version</label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={settings.minAndroidVersion}
                onChange={(e) => setSettings({...settings, minAndroidVersion: e.target.value})}
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-60"
                placeholder="e.g. 1.0.5"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="font-medium text-gray-900">Force Update Required</p>
                  <p className="text-sm text-gray-500">Block old versions from opening</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.forceUpdate}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setSettings({...settings, forceUpdate: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 flex flex-col space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Wallet Feature</p>
                  <p className="text-sm text-gray-500">Show wallet in user & driver apps</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.isWalletEnabled}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setSettings({...settings, isWalletEnabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Referrals</p>
                  <p className="text-sm text-gray-500">Show referral programs</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.isReferralEnabled}
                    disabled={!isSuperAdmin}
                    onChange={(e) => setSettings({...settings, isReferralEnabled: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Global Settings</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
