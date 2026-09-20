import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { User, MapPin, Building2, Phone, Mail, ShieldCheck, CreditCard } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerProfile() {
  const { partnerToken } = useAuthStore();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partner/profile`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        setPartner(response.data.partner);
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6">
         <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 overflow-hidden border-4 border-white shadow-md">
            {partner?.profilePhoto ? (
               <img src={partner.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <User className="w-10 h-10" />
            )}
         </div>
         <div>
            <h2 className="text-2xl font-bold text-gray-900">{partner?.name || 'Partner'}</h2>
            <div className="flex items-center text-sm font-medium text-gray-500 mt-1 space-x-4">
               <span className="flex items-center"><Phone className="w-4 h-4 mr-1"/> {partner?.phone}</span>
               <span className="flex items-center"><Mail className="w-4 h-4 mr-1"/> {partner?.email || 'N/A'}</span>
            </div>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
               <ShieldCheck className="w-3 h-3 mr-1" /> Active Partner
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Personal Details */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3">
               <User className="w-5 h-5 text-gray-400 mr-2" /> Personal Details
            </h3>
            <div className="space-y-4">
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Date of Birth</p>
                  <p className="font-bold text-gray-900">{partner?.dateOfBirth || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Gender</p>
                  <p className="font-bold text-gray-900">{partner?.gender || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Aadhaar Number</p>
                  <p className="font-bold text-gray-900 font-mono tracking-wider">{partner?.aadhaar?.number || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">PAN Number</p>
                  <p className="font-bold text-gray-900 font-mono tracking-wider uppercase">{partner?.pan?.number || 'N/A'}</p>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {/* Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
               <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" /> Address
               </h3>
               <div>
                  <p className="font-medium text-gray-900">{partner?.address?.line1}</p>
                  {partner?.address?.line2 && <p className="font-medium text-gray-900">{partner?.address?.line2}</p>}
                  <p className="font-medium text-gray-900">{partner?.address?.city}, {partner?.address?.state} {partner?.address?.pincode}</p>
               </div>
            </div>

            {/* Bank Account */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
               <h3 className="text-lg font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3">
                  <Building2 className="w-5 h-5 text-gray-400 mr-2" /> Bank Account
               </h3>
               <div className="space-y-4">
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">Bank Name</p>
                     <p className="font-bold text-gray-900">{partner?.bankAccount?.bankName || 'N/A'}</p>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">Account Number</p>
                     <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="font-bold text-gray-900 font-mono tracking-wider">{partner?.bankAccount?.accountNumber || 'N/A'}</p>
                     </div>
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-500 uppercase">IFSC Code</p>
                     <p className="font-bold text-gray-900 font-mono tracking-wider uppercase">{partner?.bankAccount?.ifscCode || 'N/A'}</p>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
