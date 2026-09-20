import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Car, CheckCircle2, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerVehicle() {
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
        <p>Loading vehicle details...</p>
      </div>
    );
  }

  const vehicle = partner?.vehicleDetails;
  const docs = partner?.vehicleDocuments;
  const photos = partner?.vehiclePhotos;

  const getDocStatusBadge = (doc) => {
    if (!doc || (!doc.number && !doc.policyNumber && !doc.certificateNumber)) {
      return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600 flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Missing</span>;
    }
    // Simple mock verification based on existence
    return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-50 text-green-600 flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Valid</span>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Profile</h2>
          <p className="text-gray-500 mt-1">Manage your active vehicle and compliance documents.</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Car className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b border-gray-100 pb-4">
              <Car className="w-5 h-5 text-gray-400 mr-2" /> Vehicle Specifications
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Registration No.</p>
                <p className="font-black text-gray-900 text-lg uppercase">{partner?.vehicleNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Category</p>
                <p className="font-bold text-gray-900 text-base">{vehicle?.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Make & Model</p>
                <p className="font-bold text-gray-900 text-base">{vehicle?.make} {vehicle?.model}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fuel Type</p>
                <p className="font-bold text-gray-900 text-base">{vehicle?.fuelType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Color</p>
                <p className="font-bold text-gray-900 text-base">{vehicle?.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Reg. Year</p>
                <p className="font-bold text-gray-900 text-base">{partner?.vehicleRegistrationYear || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Photos Gallery */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                <ImageIcon className="w-5 h-5 text-gray-400 mr-2" /> Live Photos
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Front', src: photos?.front },
                  { label: 'Back', src: photos?.back },
                  { label: 'Left', src: photos?.left },
                  { label: 'Interior', src: photos?.interior },
                ].map((photo, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] border border-gray-200">
                    {photo.src ? (
                      <img src={photo.src} alt={photo.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-medium">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-xs font-bold shadow-sm">{photo.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Documents Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-2" /> Compliance Documents
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              
              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Registration (RC)</h4>
                  {getDocStatusBadge(docs?.rc)}
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">{docs?.rc?.number || '---'}</p>
                <p className="text-xs text-gray-400">Exp: {docs?.rc?.expiryDate || 'N/A'}</p>
              </div>

              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Insurance Policy</h4>
                  {getDocStatusBadge(docs?.insurance)}
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">{docs?.insurance?.policyNumber || '---'}</p>
                <p className="text-xs text-gray-400">Exp: {docs?.insurance?.expiryDate || 'N/A'}</p>
              </div>

              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">PUC Certificate</h4>
                  {getDocStatusBadge(docs?.puc)}
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">{docs?.puc?.certificateNumber || '---'}</p>
                <p className="text-xs text-gray-400">Exp: {docs?.puc?.expiryDate || 'N/A'}</p>
              </div>

              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Commercial Permit</h4>
                  {getDocStatusBadge(docs?.permit)}
                </div>
                <p className="text-xs text-gray-500 font-mono mb-1">{docs?.permit?.number || '---'}</p>
                <p className="text-xs text-gray-400">Exp: {docs?.permit?.expiryDate || 'N/A'}</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
