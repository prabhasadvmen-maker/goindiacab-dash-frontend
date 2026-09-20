import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowLeft, MapPin, Calendar, Clock, Phone, User, 
  CreditCard, CheckCircle2, XCircle, Navigation, Save, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { partnerToken } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Status update
  const [status, setStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/partner/bookings/${id}`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (data.success) {
        setBooking(data.data);
        setStatus(data.data.status);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { data } = await axios.put(`${API_URL}/api/partner/bookings/${id}/status`, {
        status, cancelReason
      }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });

      if (data.success) {
        setBooking(data.data);
        setMessage({ type: 'success', text: 'Booking status updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update booking status.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Trip Not Found</h2>
          <Link to="/partner/bookings" className="mt-6 text-blue-600 font-bold hover:underline">
            ← Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (s) => {
    switch (s) {
      case 'PENDING':
      case 'ACCEPTED':
      case 'ENROUTE':
      case 'ARRIVED':
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100 flex items-center w-fit"><Navigation className="w-4 h-4 mr-1.5" /> {s.replace('_', ' ')}</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-bold border border-green-100 flex items-center w-fit"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100 flex items-center w-fit"><XCircle className="w-4 h-4 mr-1.5" /> Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <button onClick={() => navigate('/partner/bookings')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Trip #{booking._id.slice(-8).toUpperCase()}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trip Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Route</h3>
                <p className="text-sm text-gray-500 font-medium flex items-center space-x-4">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5"/> {new Date(booking.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5"/> {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"></div>
                  <div className="w-0.5 h-16 bg-gray-200 my-2"></div>
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]"></div>
                </div>
                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pickup Location</p>
                    <p className="text-gray-900 font-medium text-lg leading-snug">{booking.pickup.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Dropoff Location</p>
                    <p className="text-gray-900 font-medium text-lg leading-snug">{booking.dropoff.address}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50/50 p-6 border-t border-orange-100 flex justify-between items-center">
               <div className="flex items-center text-orange-800">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  <span className="font-bold">Total Distance: {booking.distance?.text || 'N/A'}</span>
               </div>
               <div className="flex items-center text-orange-800">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  <span className="font-bold">Est. Time: {booking.duration?.text || 'N/A'}</span>
               </div>
            </div>
          </div>

          {/* Action Form */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-900 text-lg">Update Trip Status</h3>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {message.text && (
                  <div className={cn(
                    "p-4 rounded-lg flex items-center text-sm font-medium",
                    message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                  )}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Change Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all outline-none"
                  >
                    <option value={booking.status} disabled>Current: {booking.status}</option>
                    {booking.status === 'ACCEPTED' && <option value="ENROUTE">Enroute to Pickup</option>}
                    {booking.status === 'ENROUTE' && <option value="ARRIVED">Arrived at Pickup</option>}
                    {booking.status === 'ARRIVED' && <option value="IN_PROGRESS">Start Trip (In Progress)</option>}
                    {booking.status === 'IN_PROGRESS' && <option value="COMPLETED">Complete Trip</option>}
                    <option value="CANCELLED">Cancel Trip</option>
                  </select>
                </div>

                {status === 'CANCELLED' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Cancellation</label>
                    <textarea
                      required
                      rows="3"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Why are you cancelling this trip?"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none"
                    ></textarea>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving || status === booking.status}
                    className="flex items-center px-8 py-3 bg-[#F59E0B] hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : <><Save className="w-5 h-5 mr-2" /> Update Status</>}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Sidebar Info (Right Col) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center">
                <User className="w-5 h-5 text-gray-500 mr-2" /> Customer Info
              </h3>
            </div>
            <div className="p-5">
              {booking.user ? (
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden text-gray-600 border-2 border-white shadow-sm">
                    {booking.user.profilePic ? (
                       <img src={booking.user.profilePic} alt="User" className="w-full h-full object-cover" />
                    ) : (
                       <span>{booking.user.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 text-lg truncate">{booking.user.name}</p>
                    <p className="text-sm text-gray-500 flex items-center mt-0.5">
                      <Phone className="w-3.5 h-3.5 mr-1" /> {booking.user.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Customer details unavailable.</p>
              )}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                 <span className="text-sm font-bold text-gray-500">OTP to start ride:</span>
                 <span className="px-3 py-1 bg-gray-900 text-white font-mono font-bold tracking-widest rounded-lg">{booking.otp}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 text-gray-500 mr-2" /> Fare Details
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Estimated Fare</span>
                <span className="font-bold text-gray-900">₹{booking.fare.estimated}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Final Fare</span>
                <span className="font-bold text-gray-900">{booking.fare.final ? `₹${booking.fare.final}` : 'To be calculated'}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-xs">Payment Method</span>
                <span className="px-2 py-1 bg-green-50 text-green-700 font-bold rounded text-xs">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold uppercase text-xs">Payment Status</span>
                <span className={cn(
                  "px-2 py-1 font-bold rounded text-xs",
                  booking.paymentStatus === 'COMPLETED' ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                )}>{booking.paymentStatus}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
