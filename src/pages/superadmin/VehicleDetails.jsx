import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Car,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  ShieldBan
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admins/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setVehicle(data.data);
        }
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, token]);

  const handleToggleEligibility = async () => {
    const action = vehicle.isVehicleEligible ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this vehicle?`)) return;

    setActionLoading(true);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/vehicles/${id}/eligibility`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setVehicle({ ...vehicle, isVehicleEligible: data.isVehicleEligible });
      }
    } catch (error) {
      console.error('Error updating vehicle eligibility:', error);
      alert('Failed to update vehicle status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPlate = (plate) => {
    if (!plate) return 'N/A';
    return plate.toUpperCase().replace(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/, '$1 $2 $3 $4') || plate.toUpperCase();
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div className="p-6 text-center text-red-500">Vehicle not found.</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Profile</h2>
            <p className="text-sm font-semibold text-gray-500 tracking-wider uppercase mt-1">{formatPlate(vehicle.vehicleNumber)}</p>
          </div>
        </div>
        
        <button
          onClick={handleToggleEligibility}
          disabled={actionLoading}
          className={cn(
            "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center disabled:opacity-50",
            vehicle.isVehicleEligible 
              ? "bg-white border border-red-200 text-red-600 hover:bg-red-50" 
              : "bg-green-600 text-white hover:bg-green-700"
          )}
        >
          {vehicle.isVehicleEligible ? (
            <><ShieldBan className="w-4 h-4 mr-2" /> Suspend Vehicle</>
          ) : (
            <><CheckCircle className="w-4 h-4 mr-2" /> Activate Vehicle</>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-8">
        
        {/* Partner Info & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Owner / Partner Details</h4>
              <div className="bg-slate-50 p-5 rounded-2xl space-y-3">
                 <p className="text-sm flex"><span className="text-gray-500 w-24 shrink-0">Name:</span> <span className="font-semibold text-gray-900">{vehicle.name || 'N/A'}</span></p>
                 <p className="text-sm flex"><span className="text-gray-500 w-24 shrink-0">Phone:</span> <span className="font-semibold text-gray-900">+91 {vehicle.phone}</span></p>
                 <p className="text-sm flex"><span className="text-gray-500 w-24 shrink-0">Email:</span> <span className="font-semibold text-gray-900">{vehicle.email || 'N/A'}</span></p>
                 <p className="text-sm flex items-center mt-2 pt-3 border-t border-gray-200"><span className="text-gray-500 w-24 shrink-0">Status:</span> 
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", vehicle.isVehicleEligible ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200")}>
                       {vehicle.isVehicleEligible ? 'Eligible to Drive' : 'Suspended'}
                    </span>
                 </p>
              </div>
           </div>
           <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Vehicle Specifications</h4>
              <div className="bg-slate-50 p-5 rounded-2xl grid grid-cols-2 gap-4">
                 <p className="text-sm col-span-2 flex"><span className="text-gray-500 w-24 shrink-0">Make/Model:</span> <span className="font-semibold text-gray-900">{vehicle.vehicleDetails?.make} {vehicle.vehicleDetails?.model}</span></p>
                 <p className="text-sm"><span className="text-gray-500 block text-xs mb-1">Category</span> <span className="font-medium text-gray-900">{vehicle.vehicleDetails?.category || 'N/A'}</span></p>
                 <p className="text-sm"><span className="text-gray-500 block text-xs mb-1">Color</span> <span className="font-medium text-gray-900">{vehicle.vehicleDetails?.color || 'N/A'}</span></p>
                 <p className="text-sm"><span className="text-gray-500 block text-xs mb-1">Fuel Type</span> <span className="font-medium text-gray-900">{vehicle.vehicleDetails?.fuelType || 'N/A'}</span></p>
                 <p className="text-sm"><span className="text-gray-500 block text-xs mb-1">Seats</span> <span className="font-medium text-gray-900">{vehicle.vehicleDetails?.seatingCapacity || 'N/A'}</span></p>
              </div>
           </div>
        </div>

        {/* Photos */}
        <div>
           <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-blue-500" /> Live Vehicle Photos
           </h4>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {['front', 'back', 'left', 'right', 'interior'].map(angle => (
                 <div key={angle} className="space-y-2 group">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative">
                       {vehicle.vehiclePhotos?.[angle] ? (
                          <a href={vehicle.vehiclePhotos[angle]} target="_blank" rel="noreferrer" className="block w-full h-full">
                             <img src={vehicle.vehiclePhotos[angle]} alt={angle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </a>
                       ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                             <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                             <span className="text-xs font-medium">No Image</span>
                          </div>
                       )}
                    </div>
                    <p className="text-xs text-center font-bold text-gray-600 capitalize">{angle}</p>
                 </div>
              ))}
           </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        {/* Documents */}
        <div>
           <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" /> Legal Documents
           </h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['rc', 'insurance', 'puc', 'permit'].map(doc => {
                 const docData = vehicle.vehicleDocuments?.[doc];
                 const docLabels = {
                    rc: 'RC Book',
                    insurance: 'Insurance',
                    puc: 'PUC',
                    permit: 'Permit'
                 };
                 return (
                    <div key={doc} className="border border-gray-200 rounded-2xl p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                       <div className="aspect-video bg-gray-50 rounded-xl border border-gray-200 overflow-hidden mb-3 relative group">
                          {docData?.image ? (
                             <a href={docData.image} target="_blank" rel="noreferrer" className="block w-full h-full">
                                <img src={docData.image} alt={doc} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <span className="text-white text-xs font-semibold px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm">View Document</span>
                                </div>
                             </a>
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FileText className="w-6 h-6 opacity-30" />
                             </div>
                          )}
                       </div>
                       <h5 className="font-bold text-gray-900 text-sm mb-2">{docLabels[doc]}</h5>
                       <div className="space-y-1">
                          <p className="text-xs flex justify-between"><span className="text-gray-500">Number:</span> <span className="font-medium text-gray-900 truncate ml-2">{docData?.number || docData?.policyNumber || docData?.certificateNumber || 'N/A'}</span></p>
                          <p className="text-xs flex justify-between"><span className="text-gray-500">Expiry:</span> <span className="font-medium text-gray-900">{docData?.expiryDate ? new Date(docData.expiryDate).toLocaleDateString() : 'N/A'}</span></p>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

      </div>
    </div>
  );
}
