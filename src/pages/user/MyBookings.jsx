import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { MapPin, Navigation, Calendar, Clock, ChevronRight, Search, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyBookings() {
  const { userToken } = useUserAuthStore();
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, PAST

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/user/operations/bookings`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><RefreshCcw className="w-3 h-3 mr-1 animate-spin" /> Searching</span>;
      case 'ACCEPTED': 
      case 'ENROUTE':
      case 'ARRIVED':
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><Navigation className="w-3 h-3 mr-1" /> Active Trip</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default: return null;
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ACTIVE') return !['COMPLETED', 'CANCELLED'].includes(b.status);
    if (filter === 'PAST') return ['COMPLETED', 'CANCELLED'].includes(b.status);
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">My Rides</h2>
          <p className="text-gray-500 font-medium mt-1">Track your active rides and view past history.</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
          {['ALL', 'ACTIVE', 'PAST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
          <p className="font-bold">Loading rides...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
             <Search className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-gray-900 mb-2">No rides found</h3>
           <p className="text-gray-500 font-medium mb-8 max-w-md">You haven't taken any rides yet. Book a cab now to get started!</p>
           <button 
              onClick={() => navigate('/user/book')}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-colors"
           >
              Book a Cab
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-shadow flex flex-col h-full">
              
              <div className="flex items-center justify-between mb-6">
                 {getStatusBadge(booking.status)}
                 <div className="text-right">
                    <p className="font-black text-xl text-gray-900">₹{booking.fare.final || booking.fare.estimated}</p>
                    <p className="text-xs font-bold text-gray-400">{booking.paymentMethod}</p>
                 </div>
              </div>

              <div className="flex-1 space-y-4 relative">
                 <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-100 z-0"></div>
                 
                 <div className="flex items-start relative z-10">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 flex-shrink-0 border-2 border-white">
                       <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Pickup</p>
                       <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{booking.pickup.address}</p>
                    </div>
                 </div>

                 <div className="flex items-start relative z-10 pt-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 flex-shrink-0 border-2 border-white">
                       <MapPin className="w-3 h-3" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase mb-0.5">Dropoff</p>
                       <p className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{booking.dropoff.address}</p>
                    </div>
                 </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Date</p>
                    <div className="flex items-center font-bold text-gray-900 text-sm">
                       <Calendar className="w-4 h-4 mr-1.5 text-gray-400"/>
                       {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Vehicle</p>
                    <p className="font-bold text-gray-900 text-sm">{booking.vehicleType}</p>
                 </div>
              </div>

              {/* Action Button */}
              <button 
                 onClick={() => navigate(`/user/track?id=${booking._id}`)}
                 className={cn(
                    "w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-colors",
                    ['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status)
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                 )}
              >
                 {['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status)
                    ? "Track Ride" 
                    : "View Details"}
                 <ChevronRight className="w-4 h-4 ml-1" />
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
