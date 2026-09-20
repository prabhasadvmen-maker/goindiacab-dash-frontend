import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Phone, ShieldAlert, Star, CreditCard, ChevronLeft, RefreshCcw } from 'lucide-react';
import { io } from 'socket.io-client';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TrackTrip() {
  const { userToken } = useUserAuthStore();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('id');
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      navigate('/user/bookings');
      return;
    }
    fetchBooking();
    
    // Connect to Socket.io for live updates
    const newSocket = io(API_URL, {
      auth: { token: userToken, role: 'user' }
    });

    newSocket.on('connect', () => {
      newSocket.emit('joinTracking', bookingId);
    });

    newSocket.on('driverLocationUpdate', (data) => {
       if (data.bookingId === bookingId) {
          setDriverLocation({ lat: data.lat, lng: data.lng });
       }
    });

    newSocket.on('bookingStatusUpdate', (data) => {
       if (data.bookingId === bookingId) {
          setBooking(prev => prev ? { ...prev, status: data.status } : null);
       }
    });

    return () => newSocket.disconnect();
    // eslint-disable-next-line
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/user/operations/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      alert('Failed to load ride details.');
      navigate('/user/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride? Cancellation charges may apply.')) return;
    setCancelling(true);
    try {
      const response = await axios.post(`${API_URL}/api/v1/user/operations/bookings/${bookingId}/cancel`, 
      { cancelReason: 'User requested cancellation' },
      { headers: { Authorization: `Bearer ${userToken}` }});
      
      if (response.data.success) {
         setBooking(response.data.data);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500 mb-4"></div>
        <p className="font-bold text-lg">Locating your ride...</p>
      </div>
    );
  }

  if (!booking) return null;

  const isActive = ['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(booking.status);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-100 relative">
      
      {/* Top Bar overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
         <button 
           onClick={() => navigate('/user/bookings')}
           className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-900 pointer-events-auto hover:bg-gray-50 transition-colors"
         >
           <ChevronLeft className="w-6 h-6" />
         </button>
         
         <div className="bg-white px-6 py-3 rounded-full shadow-lg font-black text-gray-900 pointer-events-auto flex items-center">
            {booking.status === 'PENDING' && <><RefreshCcw className="w-4 h-4 mr-2 animate-spin text-orange-500"/> Finding Driver</>}
            {booking.status === 'ACCEPTED' && 'Driver Assigned'}
            {booking.status === 'ENROUTE' && 'Driver is arriving'}
            {booking.status === 'ARRIVED' && 'Driver has arrived!'}
            {booking.status === 'IN_PROGRESS' && 'Trip in progress'}
            {booking.status === 'COMPLETED' && 'Trip Completed'}
            {booking.status === 'CANCELLED' && 'Trip Cancelled'}
         </div>

         <button className="w-12 h-12 bg-red-50 text-red-600 rounded-full shadow-lg flex items-center justify-center pointer-events-auto hover:bg-red-100 transition-colors">
           <ShieldAlert className="w-6 h-6" />
         </button>
      </div>

      {/* Map Area (Mock) */}
      <div className="flex-1 bg-[#e5e3df] relative overflow-hidden flex items-center justify-center">
         {/* Google Maps would go here. We'll show a styled placeholder */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
         
         <div className="text-center z-10">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-xl border-4 border-white animate-bounce">
               <Navigation className="w-8 h-8" />
            </div>
            {driverLocation ? (
               <p className="font-bold text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">Live Location Active</p>
            ) : (
               <p className="font-bold text-gray-700 bg-white px-4 py-2 rounded-full shadow-sm">Map View (GPS Active)</p>
            )}
         </div>
      </div>

      {/* Bottom Sheet UI */}
      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 overflow-hidden flex flex-col">
         <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
         
         <div className="p-6 md:p-8 overflow-y-auto max-h-[50vh]">
            
            {/* Driver Details (if assigned) */}
            {booking.partner ? (
               <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                  <div className="flex items-center space-x-4">
                     <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                        {booking.partner.profilePhoto ? (
                           <img src={booking.partner.profilePhoto} alt="Driver" className="w-full h-full object-cover"/>
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                              {booking.partner.name?.[0] || 'D'}
                           </div>
                        )}
                     </div>
                     <div>
                        <h3 className="font-black text-lg text-gray-900">{booking.partner.name || 'Driver'}</h3>
                        <div className="flex items-center text-sm font-bold text-gray-500 mt-1">
                           <Star className="w-4 h-4 text-[#F59E0B] mr-1" fill="currentColor" /> 4.8 
                           <span className="mx-2">•</span> 
                           {booking.vehicleType}
                        </div>
                     </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                     <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm mb-2">
                        <p className="font-black text-gray-900 text-lg uppercase">{booking.partner.vehicleNumber || 'UP16AB1234'}</p>
                     </div>
                     <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors">
                        <Phone className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ) : (
               isActive && (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-6 text-center">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 mx-auto mb-3 shadow-sm">
                        <RefreshCcw className="w-6 h-6 animate-spin" />
                     </div>
                     <h3 className="font-bold text-orange-900">Locating nearest driver</h3>
                     <p className="text-sm text-orange-700 mt-1">Please wait while we connect you to the best driver.</p>
                  </div>
               )
            )}

            {/* OTP Section (Show when ENROUTE or ARRIVED) */}
            {['ENROUTE', 'ARRIVED'].includes(booking.status) && (
               <div className="bg-gray-900 rounded-2xl p-6 text-white mb-6 flex justify-between items-center shadow-lg">
                  <div>
                     <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-1">Start Ride PIN</p>
                     <p className="text-sm text-gray-300">Share this with the driver</p>
                  </div>
                  <div className="bg-white text-gray-900 px-6 py-2 rounded-xl font-black text-3xl tracking-[0.2em] shadow-inner">
                     {booking.otp}
                  </div>
               </div>
            )}

            {/* Trip Details */}
            <div className="space-y-4 mb-6">
               <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">{booking.pickup.address}</p>
                  </div>
               </div>
               <div className="ml-3 w-0.5 h-6 bg-gray-200"></div>
               <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                     <MapPin className="w-3 h-3" />
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">{booking.dropoff.address}</p>
                  </div>
               </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
               <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mr-3">
                     <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-gray-500 uppercase">{booking.paymentMethod}</p>
                     <p className="font-black text-xl text-gray-900">₹{booking.fare.final || booking.fare.estimated}</p>
                  </div>
               </div>
               
               {['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED'].includes(booking.status) && (
                  <button 
                     onClick={handleCancel}
                     disabled={cancelling}
                     className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                  >
                     {cancelling ? 'Cancelling...' : 'Cancel Ride'}
                  </button>
               )}
            </div>

         </div>
      </div>
    </div>
  );
}
