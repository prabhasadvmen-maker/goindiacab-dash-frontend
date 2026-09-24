import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { User, MapPin, Building2, FileText, ShieldCheck, CheckCircle2, Loader2, Camera, Edit2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('personal');

  // Form State
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(null); // stores the field name currently updating
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      // We can use the V2 Profile API
      const response = await axios.get(`${API_URL}/api/v2/partner/profile/me`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        const p = response.data.data;
        setPartner(p);
        
        // Initialize form data
        setFormData({
          name: p.name || '',
          email: p.email || '',
          dob: p.personalInfo?.dateOfBirth || '',
          gender: p.personalInfo?.gender || '',
          street: p.address?.street || p.address?.line1 || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          pincode: p.address?.pincode || '',
          accountName: p.bankDetails?.accountHolderName || p.bankAccount?.accountHolderName || '',
          accountNumber: p.bankDetails?.accountNumber || p.bankAccount?.accountNumber || '',
          ifsc: p.bankDetails?.ifscCode || p.bankAccount?.ifscCode || '',
          bankName: p.bankDetails?.bankName || p.bankAccount?.bankName || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (field, apiPath, payload) => {
    setUpdating(field);
    setSuccessMsg('');
    try {
      const res = await axios.patch(`${API_URL}${apiPath}`, payload, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        setSuccessMsg(`${field} updated successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
        // Update local state without full refetch for speed
        setPartner(res.data.data);
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
        <p className="font-bold">Loading your granular profile...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'address', label: 'Address Info', icon: MapPin },
    { id: 'bank', label: 'Bank Account', icon: Building2 },
    { id: 'kyc', label: 'KYC Documents', icon: FileText },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header Profile Summary */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
         <div className="relative group">
           <div className="w-32 h-32 rounded-[2rem] bg-orange-50 flex items-center justify-center text-orange-600 overflow-hidden shadow-lg border-4 border-white">
              {partner?.profilePhoto ? (
                 <img src={partner.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <User className="w-12 h-12" />
              )}
           </div>
           <button 
              onClick={() => handleUpdate('Profile Photo', '/api/v2/partner/profile/photo', { photoUrl: 'https://i.pravatar.cc/150?img=11' })}
              className="absolute -bottom-3 -right-3 w-10 h-10 bg-black text-white rounded-xl shadow-xl flex items-center justify-center hover:bg-gray-800 transition-transform active:scale-95 group-hover:-translate-y-1"
            >
             {updating === 'Profile Photo' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
           </button>
         </div>
         
         <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{partner?.name || 'Partner'}</h1>
            <p className="text-gray-500 font-bold text-lg mb-4">{partner?.phone}</p>
            <div className="inline-flex items-center px-4 py-2 rounded-xl font-bold bg-green-50 text-green-700 border border-green-200 shadow-sm">
               <ShieldCheck className="w-5 h-5 mr-2" /> Verified Partner
            </div>
         </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center border border-green-200 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-6 py-4 rounded-xl font-bold transition-all whitespace-nowrap",
                isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content - Granular V2 API Forms */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Personal Details Tab */}
        {activeTab === 'personal' && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Personal Details</h2>
              <p className="text-gray-500 mt-1 font-medium">Update your basic information using granular V2 APIs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GranularField 
                label="Full Name" value={formData.name}
                onChange={(v) => setFormData({...formData, name: v})}
                onSave={() => handleUpdate('Name', '/api/v2/partner/profile/name', { name: formData.name })}
                isLoading={updating === 'Name'}
              />
              <GranularField 
                label="Email Address" value={formData.email}
                onChange={(v) => setFormData({...formData, email: v})}
                onSave={() => handleUpdate('Email', '/api/v2/partner/profile/email', { email: formData.email })}
                isLoading={updating === 'Email'}
              />
              <GranularField 
                label="Date of Birth" value={formData.dob}
                onChange={(v) => setFormData({...formData, dob: v})}
                onSave={() => handleUpdate('DOB', '/api/v2/partner/profile/dob', { dob: formData.dob })}
                isLoading={updating === 'DOB'} type="date"
              />
              <GranularField 
                label="Gender" value={formData.gender}
                onChange={(v) => setFormData({...formData, gender: v})}
                onSave={() => handleUpdate('Gender', '/api/v2/partner/profile/gender', { gender: formData.gender })}
                isLoading={updating === 'Gender'}
              />
            </div>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Address Information</h2>
              <p className="text-gray-500 mt-1 font-medium">Manage your location details.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GranularField 
                label="Street Address" value={formData.street}
                onChange={(v) => setFormData({...formData, street: v})}
                onSave={() => handleUpdate('Street', '/api/v2/partner/profile/address/street', { street: formData.street })}
                isLoading={updating === 'Street'}
              />
              <GranularField 
                label="City" value={formData.city}
                onChange={(v) => setFormData({...formData, city: v})}
                onSave={() => handleUpdate('City', '/api/v2/partner/profile/address/city', { city: formData.city })}
                isLoading={updating === 'City'}
              />
              <GranularField 
                label="State" value={formData.state}
                onChange={(v) => setFormData({...formData, state: v})}
                onSave={() => handleUpdate('State', '/api/v2/partner/profile/address/state', { state: formData.state })}
                isLoading={updating === 'State'}
              />
              <GranularField 
                label="Pincode" value={formData.pincode}
                onChange={(v) => setFormData({...formData, pincode: v})}
                onSave={() => handleUpdate('Pincode', '/api/v2/partner/profile/address/pincode', { pincode: formData.pincode })}
                isLoading={updating === 'Pincode'}
              />
            </div>
          </div>
        )}

        {/* Bank Account Tab */}
        {activeTab === 'bank' && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Bank Account</h2>
              <p className="text-gray-500 mt-1 font-medium">Manage where you receive your weekly payouts.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GranularField 
                label="Account Holder Name" value={formData.accountName}
                onChange={(v) => setFormData({...formData, accountName: v})}
                onSave={() => handleUpdate('Account Name', '/api/v2/partner/profile/bank/account-name', { accountName: formData.accountName })}
                isLoading={updating === 'Account Name'}
              />
              <GranularField 
                label="Bank Name" value={formData.bankName}
                onChange={(v) => setFormData({...formData, bankName: v})}
                onSave={() => handleUpdate('Bank Name', '/api/v2/partner/profile/bank/bank-name', { bankName: formData.bankName })}
                isLoading={updating === 'Bank Name'}
              />
              <GranularField 
                label="Account Number" value={formData.accountNumber}
                onChange={(v) => setFormData({...formData, accountNumber: v})}
                onSave={() => handleUpdate('Account Number', '/api/v2/partner/profile/bank/account-number', { accountNumber: formData.accountNumber })}
                isLoading={updating === 'Account Number'}
              />
              <GranularField 
                label="IFSC Code" value={formData.ifsc}
                onChange={(v) => setFormData({...formData, ifsc: v})}
                onSave={() => handleUpdate('IFSC Code', '/api/v2/partner/profile/bank/ifsc', { ifsc: formData.ifsc })}
                isLoading={updating === 'IFSC Code'}
              />
            </div>
          </div>
        )}

        {/* KYC Documents Tab */}
        {activeTab === 'kyc' && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">KYC Documents</h2>
              <p className="text-gray-500 mt-1 font-medium">Upload granular documents directly using V2 APIs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocUploadCard title="Driving Licence (Front)" onUpload={() => handleUpdate('DL Front', '/api/v2/partner/profile/kyc/dl-front', { imageUrl: 'dl_front_uploaded.jpg' })} loading={updating === 'DL Front'} />
              <DocUploadCard title="Driving Licence (Back)" onUpload={() => handleUpdate('DL Back', '/api/v2/partner/profile/kyc/dl-back', { imageUrl: 'dl_back_uploaded.jpg' })} loading={updating === 'DL Back'} />
              <DocUploadCard title="Aadhaar Card (Front)" onUpload={() => handleUpdate('Aadhaar Front', '/api/v2/partner/profile/kyc/aadhaar-front', { imageUrl: 'aadhaar_f.jpg' })} loading={updating === 'Aadhaar Front'} />
              <DocUploadCard title="PAN Card" onUpload={() => handleUpdate('PAN Card', '/api/v2/partner/profile/kyc/pan', { imageUrl: 'pan.jpg' })} loading={updating === 'PAN Card'} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable UI Component for individual Granular Input Fields
function GranularField({ label, value, onChange, onSave, isLoading, type = "text" }) {
  return (
    <div className="space-y-2 group">
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="relative flex items-center">
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all pr-24"
        />
        <button 
          onClick={onSave}
          disabled={isLoading}
          className="absolute right-2 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
        </button>
      </div>
    </div>
  );
}

function DocUploadCard({ title, onUpload, loading }) {
  return (
    <div className="border-2 border-gray-100 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-8 h-8" />
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 font-medium mb-4">JPG, PNG or PDF (Max 5MB)</p>
      <button 
        onClick={onUpload}
        disabled={loading}
        className="w-full bg-black hover:bg-gray-800 text-white rounded-xl py-3 font-bold flex items-center justify-center transition-transform active:scale-95"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Camera className="w-5 h-5 mr-2" />}
        {loading ? 'Uploading...' : 'Upload Now'}
      </button>
    </div>
  );
}
