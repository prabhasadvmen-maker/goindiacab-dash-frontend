import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Settings as SettingsIcon, LogOut, Bell, Shield, Smartphone } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PartnerSettings() {
  const { logoutPartner } = useAuthStore();
  const navigate = useNavigate();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const handleLogout = () => {
    logoutPartner();
    navigate('/partner/login');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
          <p className="text-gray-500 mt-1">Manage your app preferences and account security.</p>
        </div>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          <SettingsIcon className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Preferences */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3">
               <Bell className="w-5 h-5 text-gray-400 mr-2" /> Notification Preferences
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="font-bold text-gray-900 text-sm">Push Notifications</p>
                     <p className="text-xs text-gray-500">Receive alerts for new rides on your phone.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                  </label>
               </div>
               <div className="flex items-center justify-between">
                  <div>
                     <p className="font-bold text-gray-900 text-sm">SMS Alerts</p>
                     <p className="text-xs text-gray-500">Receive text messages for payouts and OTPs.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F59E0B]"></div>
                  </label>
               </div>
            </div>
         </div>

         {/* Security & Account */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
               <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3">
                  <Shield className="w-5 h-5 text-gray-400 mr-2" /> Security
               </h3>
               <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-900 transition-colors">
                     Change Password
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-900 transition-colors">
                     Manage Trusted Devices
                  </button>
               </div>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
               <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3 mb-4">
                  <Smartphone className="w-5 h-5 text-gray-400 mr-2" /> Account Actions
               </h3>
               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors"
               >
                  <LogOut className="w-4 h-4 mr-2" /> Logout from this device
               </button>
            </div>
         </div>

      </div>
    </div>
  );
}
