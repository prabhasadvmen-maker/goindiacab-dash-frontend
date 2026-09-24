import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Settings as SettingsIcon, Bell, Navigation, Globe, Smartphone, CheckCircle2, Loader2, Save } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerSettings() {
  const { partnerToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  // V2 Settings State
  const [language, setLanguage] = useState('en');
  const [navigationApp, setNavigationApp] = useState('GMAP');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/partner/settings/preferences`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        const prefs = response.data.data;
        setLanguage(prefs.language || 'en');
        setNavigationApp(prefs.navigation || 'GMAP');
        setPushEnabled(prefs.pushEnabled ?? true);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, apiPath, payload, updateLocalState) => {
    setUpdating(field);
    setSuccessMsg('');
    try {
      const res = await axios.patch(`${API_URL}${apiPath}`, payload, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        setSuccessMsg(`${field} updated successfully!`);
        updateLocalState();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (error) {
      alert(`Failed to update ${field}.`);
    }
    setUpdating(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin w-8 h-8 mb-4 text-blue-500" />
        <p className="font-bold">Loading App Preferences...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
         <div className="w-20 h-20 rounded-[1.5rem] bg-gray-900 flex items-center justify-center text-white shadow-lg">
            <SettingsIcon className="w-10 h-10" />
         </div>
         <div>
            <h1 className="text-3xl font-black text-gray-900">App Preferences</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your experience using V2 granular APIs.</p>
         </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center border border-green-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Settings List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        
        {/* Language */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">App Language</h3>
               <p className="text-gray-500 text-sm font-medium">Choose between English and Hindi.</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <select 
               value={language}
               onChange={(e) => setLanguage(e.target.value)}
               className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500"
             >
               <option value="en">English</option>
               <option value="hi">Hindi</option>
             </select>
             <button 
               onClick={() => handleUpdate('Language', '/api/v2/partner/settings/language', { language }, () => {})}
               disabled={updating === 'Language'}
               className="bg-black text-white px-4 py-2.5 rounded-xl font-bold flex items-center hover:bg-gray-800 disabled:opacity-50"
             >
                {updating === 'Language' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                <Navigation className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">Default Navigation</h3>
               <p className="text-gray-500 text-sm font-medium">App to open when starting a trip.</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <select 
               value={navigationApp}
               onChange={(e) => setNavigationApp(e.target.value)}
               className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500"
             >
               <option value="GMAP">Google Maps</option>
               <option value="WAZE">Waze</option>
             </select>
             <button 
               onClick={() => handleUpdate('Navigation', '/api/v2/partner/settings/navigation', { appName: navigationApp }, () => {})}
               disabled={updating === 'Navigation'}
               className="bg-black text-white px-4 py-2.5 rounded-xl font-bold flex items-center hover:bg-gray-800 disabled:opacity-50"
             >
                {updating === 'Navigation' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             </button>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">Push Notifications</h3>
               <p className="text-gray-500 text-sm font-medium">Receive alerts for new rides and earnings.</p>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={() => {
                 const newVal = !pushEnabled;
                 handleUpdate('Notifications', '/api/v2/partner/settings/notifications', { enabled: newVal }, () => setPushEnabled(newVal));
               }}
               disabled={updating === 'Notifications'}
               className={cn(
                  "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
                  pushEnabled ? "bg-green-500" : "bg-gray-300"
               )}
             >
                <span className={cn(
                   "inline-block h-6 w-6 transform rounded-full bg-white transition-transform",
                   pushEnabled ? "translate-x-7" : "translate-x-1"
                )} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
