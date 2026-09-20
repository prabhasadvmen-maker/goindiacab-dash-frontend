import React, { useState } from 'react';
import { useUserAuthStore } from '../../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Lock, LogOut, ChevronRight, Moon } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserSettings() {
  const { userToken, logout } = useUserAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailAlerts: false,
    darkMode: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/user/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-8">
      
      <div>
         <h2 className="text-3xl font-black text-gray-900">Settings</h2>
         <p className="text-gray-500 font-medium mt-1">Manage app preferences and account security.</p>
      </div>

      <div className="space-y-6">
         
         {/* Preferences */}
         <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Preferences</h3>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               
               <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                     <Bell className="w-5 h-5 text-gray-400 mr-4" />
                     <div>
                        <p className="font-bold text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500 font-medium">Receive ride updates</p>
                     </div>
                  </div>
                  <button 
                     onClick={() => toggleSetting('pushNotifications')}
                     className={`w-12 h-6 rounded-full transition-colors relative ${settings.pushNotifications ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                     <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.pushNotifications ? 'left-7' : 'left-1'}`}></div>
                  </button>
               </div>

               <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                     <Moon className="w-5 h-5 text-gray-400 mr-4" />
                     <div>
                        <p className="font-bold text-gray-900">Dark Mode</p>
                        <p className="text-sm text-gray-500 font-medium">Coming soon</p>
                     </div>
                  </div>
                  <button 
                     disabled
                     className="w-12 h-6 rounded-full bg-gray-100 relative opacity-50 cursor-not-allowed"
                  >
                     <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
               </div>

            </div>
         </div>

         {/* Account */}
         <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Account</h3>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               
               <div className="p-6 border-b border-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                     <Lock className="w-5 h-5 text-gray-400 mr-4" />
                     <div>
                        <p className="font-bold text-gray-900">Privacy & Security</p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
               </div>

               <div 
                  onClick={handleLogout}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors group"
               >
                  <div className="flex items-center">
                     <LogOut className="w-5 h-5 text-red-400 mr-4 group-hover:text-red-500" />
                     <div>
                        <p className="font-bold text-red-500">Log Out</p>
                     </div>
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
}
