import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Car, FileText, Camera, CheckCircle2, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerVehicle() {
  const { partnerToken } = useAuthStore();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Form State
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchVehicleDetails();
    // eslint-disable-next-line
  }, []);

  const fetchVehicleDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/partner/profile/me`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        const v = response.data.data.vehicleDetails || {};
        setVehicle(v);
        
        setFormData({
          make: v.make || '',
          model: v.model || '',
          year: v.year || '',
          color: v.color || '',
          plateNumber: v.plateNumber || '',
        });
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
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
        <p className="font-bold">Loading Vehicle Profile...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Vehicle Info', icon: Car },
    { id: 'docs', label: 'Vehicle Documents', icon: FileText },
    { id: 'photos', label: 'Vehicle Photos', icon: Camera },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
         <div className="w-32 h-32 rounded-[2rem] bg-blue-50 flex items-center justify-center text-blue-600 shadow-lg border-4 border-white">
            <Car className="w-16 h-16" />
         </div>
         <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-4xl font-black text-gray-900 mb-2">{formData.make} {formData.model}</h1>
            <p className="text-gray-500 font-bold text-xl mb-4 font-mono tracking-widest">{formData.plateNumber || 'No Plate Number'}</p>
            <div className="inline-flex items-center px-4 py-2 rounded-xl font-bold bg-green-50 text-green-700 border border-green-200">
               <ShieldCheck className="w-5 h-5 mr-2" /> Vehicle Approved
            </div>
         </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center border border-green-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Tabs */}
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
                isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="p-8 space-y-8 animate-in fade-in">
            <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Vehicle Info</h2>
                <p className="text-gray-500 mt-1 font-medium">Update specific car details using V2 granular APIs.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GranularField 
                label="Make (e.g. Tata)" value={formData.make}
                onChange={(v) => setFormData({...formData, make: v})}
                onSave={() => handleUpdate('Make', '/api/v2/partner/vehicle/make', { make: formData.make })}
                isLoading={updating === 'Make'}
              />
              <GranularField 
                label="Model (e.g. Nexon)" value={formData.model}
                onChange={(v) => setFormData({...formData, model: v})}
                onSave={() => handleUpdate('Model', '/api/v2/partner/vehicle/model', { model: formData.model })}
                isLoading={updating === 'Model'}
              />
              <GranularField 
                label="Manufacturing Year" value={formData.year}
                onChange={(v) => setFormData({...formData, year: v})}
                onSave={() => handleUpdate('Year', '/api/v2/partner/vehicle/year', { year: formData.year })}
                isLoading={updating === 'Year'} type="number"
              />
              <GranularField 
                label="Color" value={formData.color}
                onChange={(v) => setFormData({...formData, color: v})}
                onSave={() => handleUpdate('Color', '/api/v2/partner/vehicle/color', { color: formData.color })}
                isLoading={updating === 'Color'}
              />
              <GranularField 
                label="Plate Number" value={formData.plateNumber}
                onChange={(v) => setFormData({...formData, plateNumber: v})}
                onSave={() => handleUpdate('Plate Number', '/api/v2/partner/vehicle/plate-number', { plateNumber: formData.plateNumber })}
                isLoading={updating === 'Plate Number'}
              />
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'docs' && (
          <div className="p-8 space-y-8 animate-in fade-in">
             <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Vehicle Documents</h2>
              <p className="text-gray-500 mt-1 font-medium">Upload granular documents for compliance.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocUploadCard title="Registration (RC) Book" onUpload={() => handleUpdate('RC Book', '/api/v2/partner/vehicle/docs/rc', { imageUrl: 'rc.jpg' })} loading={updating === 'RC Book'} />
              <DocUploadCard title="Commercial Insurance" onUpload={() => handleUpdate('Insurance', '/api/v2/partner/vehicle/docs/insurance', { imageUrl: 'ins.jpg' })} loading={updating === 'Insurance'} />
              <DocUploadCard title="Transport Permit" onUpload={() => handleUpdate('Permit', '/api/v2/partner/vehicle/docs/permit', { imageUrl: 'permit.jpg' })} loading={updating === 'Permit'} />
              <DocUploadCard title="Fitness Certificate" onUpload={() => handleUpdate('Fitness', '/api/v2/partner/vehicle/docs/fitness', { imageUrl: 'fit.jpg' })} loading={updating === 'Fitness'} />
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="p-8 space-y-8 animate-in fade-in">
             <div className="border-b border-gray-100 pb-6">
              <h2 className="text-2xl font-black text-gray-900">Vehicle Photos</h2>
              <p className="text-gray-500 mt-1 font-medium">Upload all 4 sides of the car.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DocUploadCard title="Exterior - Front" onUpload={() => handleUpdate('Front Photo', '/api/v2/partner/vehicle/photos/front', { imageUrl: 'front.jpg' })} loading={updating === 'Front Photo'} icon={<Car className="w-8 h-8"/>} />
              <DocUploadCard title="Exterior - Back" onUpload={() => handleUpdate('Back Photo', '/api/v2/partner/vehicle/photos/back', { imageUrl: 'back.jpg' })} loading={updating === 'Back Photo'} icon={<Car className="w-8 h-8"/>}/>
              <DocUploadCard title="Exterior - Left" onUpload={() => handleUpdate('Left Photo', '/api/v2/partner/vehicle/photos/left', { imageUrl: 'left.jpg' })} loading={updating === 'Left Photo'} icon={<Car className="w-8 h-8"/>}/>
              <DocUploadCard title="Exterior - Right" onUpload={() => handleUpdate('Right Photo', '/api/v2/partner/vehicle/photos/right', { imageUrl: 'right.jpg' })} loading={updating === 'Right Photo'} icon={<Car className="w-8 h-8"/>}/>
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

function DocUploadCard({ title, onUpload, loading, icon }) {
  return (
    <div className="border-2 border-gray-100 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-white hover:border-blue-200 transition-colors">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
        {icon || <Camera className="w-8 h-8" />}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 font-medium mb-4">Must be clear and readable</p>
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
