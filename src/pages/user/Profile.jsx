import React, { useState } from 'react';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { User, Phone, Mail, Edit3, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserProfile() {
  const { user, userToken, setUser } = useUserAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/v1/user/operations/profile`, formData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Profile</h2>
          <p className="text-gray-500 font-medium mt-1">Manage your personal information.</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center transition-colors disabled:opacity-50"
        >
          {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save</> : <><Edit3 className="w-4 h-4 mr-2" /> Edit</>}
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
         <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 pb-8 border-b border-gray-100">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 border-4 border-white shadow-lg overflow-hidden relative group">
               {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover"/>
               ) : (
                  <User className="w-16 h-16" />
               )}
               {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                     <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                  </div>
               )}
            </div>
            
            <div className="text-center md:text-left flex-1 space-y-4 w-full">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                  {isEditing ? (
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-bold text-gray-900 outline-none focus:border-orange-500"
                     />
                  ) : (
                     <p className="text-2xl font-black text-gray-900">{user?.name || 'Add your name'}</p>
                  )}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <div className="flex items-center mb-2">
                  <Phone className="w-5 h-5 text-gray-400 mr-2" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
               </div>
               <p className="font-bold text-gray-900 text-lg ml-7">{user?.phone}</p>
               <p className="text-xs font-bold text-green-600 ml-7 mt-1">Verified</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <div className="flex items-center mb-2">
                  <Mail className="w-5 h-5 text-gray-400 mr-2" />
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
               </div>
               {isEditing ? (
                  <div className="ml-7">
                     <input 
                       type="email" 
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className="w-full bg-white border border-gray-200 p-2.5 rounded-lg font-bold text-gray-900 outline-none focus:border-orange-500 text-sm"
                       placeholder="Enter your email"
                     />
                  </div>
               ) : (
                  <p className="font-bold text-gray-900 text-lg ml-7">{user?.email || 'Not provided'}</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
