import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Clock,
  CalendarDays,
  User,
  Car,
  CreditCard,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Save,
  Route
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // For manual assignment
  const [availablePartners, setAvailablePartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchBooking = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/operations/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      // Just fetching top approved partners for the demo assignment UI
      // In production, this would filter by location/status
      const { data } = await axios.get(`${API_URL}/api/admins/users?role=partner&status=approved&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setAvailablePartners(data.data.filter(p => p.applicationStatus === 'approved' && p.isVehicleEligible));
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line
  }, [id, token]);

  const handleUpdateStatus = async (newStatus, reason = null) => {
    if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;
    setActionLoading(true);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/operations/bookings/${id}/status`, {
        status: newStatus,
        cancelReason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartner) return alert('Please select a partner');
    setActionLoading(true);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/operations/bookings/${id}/assign`, {
        partnerId: selectedPartner
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        // Refetch fully populated booking
        fetchBooking();
        setShowAssignModal(false);
      }
    } catch (error) {
      console.error('Error assigning partner:', error);
      alert('Failed to assign partner');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENROUTE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ARRIVED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'IN_PROGRESS': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading booking details...</div>;
  if (!booking) return <div className="p-6 text-center text-red-500">Booking not found.</div>;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Booking Info
              <span className={cn("px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider", getStatusColor(booking.status))}>
                {booking.status}
              </span>
            </h2>
            <p className="text-sm font-mono text-gray-500 mt-1">ID: {booking._id}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <>
              <button
                onClick={() => { setShowAssignModal(true); fetchPartners(); }}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-sm"
              >
                Assign / Reassign Driver
              </button>
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Force Complete
              </button>
              <button
                onClick={() => handleUpdateStatus('CANCELLED', 'Cancelled forcefully by Admin')}
                disabled={actionLoading}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                Cancel Booking
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Trip & Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-blue-500" /> Trip Details
            </h3>
            
            <div className="relative pl-6 space-y-8">
              {/* Timeline Line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gray-200 rounded-full"></div>
              
              {/* Pickup */}
              <div className="relative">
                <div className="absolute -left-6 w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup Location</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {booking.pickup?.address || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Dropoff */}
              <div className="relative">
                <div className="absolute -left-6 w-6 h-6 rounded-full bg-red-100 border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff Location</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {booking.dropoff?.address || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Distance</p>
                <p className="font-bold text-gray-900 mt-1">{booking.distance?.text || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Est. Time</p>
                <p className="font-bold text-gray-900 mt-1">{booking.duration?.text || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Vehicle Type</p>
                <p className="font-bold text-gray-900 mt-1">{booking.vehicleType || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Trip OTP</p>
                <p className="font-bold text-blue-600 font-mono tracking-widest mt-1 bg-blue-50 inline-block px-2 py-0.5 rounded">{booking.otp || '----'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: People & Payment */}
        <div className="space-y-6">
          
          {/* Passenger */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Passenger</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{booking.user?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{booking.user?.phone || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{booking.user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Driver / Partner</h3>
            {booking.partner ? (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{booking.partner?.personalInfo?.fullName || 'Driver'}</p>
                  <p className="text-sm text-gray-500">+91 {booking.partner?.phone || 'N/A'}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                      {booking.partner?.vehicleDetails?.vehicleNumber || 'NO-PLATE'}
                    </span>
                    <span className={cn("w-2 h-2 rounded-full", booking.partner?.isOnline ? "bg-green-500" : "bg-red-500")}></span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">No driver assigned yet.</p>
                <button 
                  onClick={() => { setShowAssignModal(true); fetchPartners(); }}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Assign manually
                </button>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Payment Summary</h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Payment Method</span>
                 <span className="font-semibold text-gray-900">{booking.paymentMethod}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-500">Payment Status</span>
                 <span className={cn("font-bold text-xs px-2 py-0.5 rounded-full", 
                    booking.paymentStatus === 'COMPLETED' ? "bg-green-100 text-green-700" : 
                    booking.paymentStatus === 'FAILED' ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                 )}>
                    {booking.paymentStatus}
                 </span>
               </div>
               <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-gray-900 font-bold">Estimated Fare</span>
                 <span className="text-xl font-bold text-blue-600">₹{booking.fare?.estimated || 0}</span>
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-gray-100">
                 <h3 className="text-lg font-bold text-gray-900">Assign Driver Manually</h3>
                 <p className="text-sm text-gray-500 mt-1">Select an approved driver from the list.</p>
              </div>
              <div className="p-6">
                 <select 
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-sm"
                 >
                    <option value="">-- Select Driver --</option>
                    {availablePartners.map(p => (
                       <option key={p._id} value={p._id}>
                          {p.personalInfo?.fullName} ({p.vehicleDetails?.vehicleNumber || 'N/A'}) - {p.isOnline ? 'Online' : 'Offline'}
                       </option>
                    ))}
                 </select>
                 
                 <div className="flex space-x-3 justify-end">
                    <button 
                       onClick={() => setShowAssignModal(false)}
                       className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                    >
                       Cancel
                    </button>
                    <button 
                       onClick={handleAssignPartner}
                       disabled={actionLoading || !selectedPartner}
                       className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center"
                    >
                       <CheckCircle className="w-4 h-4 mr-2" />
                       Confirm Assignment
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
