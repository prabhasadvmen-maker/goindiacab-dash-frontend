import React, { useState, useEffect } from 'react';
import { useUserAuthStore } from '../../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, ChevronRight, Car, History, CreditCard, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserDashboard() {
  const { user } = useUserAuthStore();
  const navigate = useNavigate();
  const [recentBooking, setRecentBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBooking();
  }, []);

  const fetchRecentBooking = async () => {
    try {
      const { userToken } = useUserAuthStore.getState();
      const response = await axios.get(`${API_URL}/api/v1/user/operations/bookings`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        // Find first active booking, or most recent completed
        const active = response.data.data.find(b => !['COMPLETED', 'CANCELLED'].includes(b.status));
        if (active) setRecentBooking(active);
        else setRecentBooking(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Car className="w-48 h-48" />
         </div>
         <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2">{greeting()}, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-gray-400 font-medium text-lg">Where are we heading today?</p>
            
            <button 
               onClick={() => navigate('/user/book')}
               className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
            >
               Book a Ride Now <ChevronRight className="w-5 h-5 ml-2" />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         {/* Quick Links */}
         <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div 
                  onClick={() => navigate('/user/bookings')}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
               >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <History className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">My Rides</h3>
                  <p className="text-sm font-medium text-gray-500">View trip history</p>
               </div>
               
               <div 
                  onClick={() => navigate('/user/payments')}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group"
               >
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">Payments</h3>
                  <p className="text-sm font-medium text-gray-500">Wallet & methods</p>
               </div>
            </div>

            {/* Active / Recent Ride Widget */}
            {!loading && recentBooking && (
               <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="font-black text-gray-900 text-xl flex items-center">
                           {['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(recentBooking.status) 
                              ? <span className="flex items-center"><Navigation className="w-5 h-5 mr-2 text-orange-500"/> Active Ride</span> 
                              : <span className="flex items-center"><Clock className="w-5 h-5 mr-2 text-gray-400"/> Last Ride</span>
                           }
                        </h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase">
                           {new Date(recentBooking.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                     <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        ['COMPLETED'].includes(recentBooking.status) ? "bg-green-100 text-green-700" :
                        ['CANCELLED'].includes(recentBooking.status) ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                     )}>
                        {recentBooking.status}
                     </span>
                  </div>

                  <div className="space-y-4 mb-6">
                     <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 mt-0.5">
                           <div className="w-2 h-2 rounded-full bg-green-600"></div>
                        </div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{recentBooking.pickup.address}</p>
                     </div>
                     <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-3 mt-0.5">
                           <MapPin className="w-3 h-3" />
                        </div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{recentBooking.dropoff.address}</p>
                     </div>
                  </div>

                  <button 
                     onClick={() => navigate(['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(recentBooking.status) ? `/user/track?id=${recentBooking._id}` : '/user/bookings')}
                     className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-sm transition-colors"
                  >
                     {['PENDING', 'ACCEPTED', 'ENROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(recentBooking.status) ? 'Track Live' : 'View Details'}
                  </button>
               </div>
            )}
         </div>

         {/* Sidebar Widgets */}
         <div className="space-y-6">
            <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 text-orange-500 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
               </div>
               <h3 className="font-black text-gray-900 text-lg mb-2">Safety First</h3>
               <p className="text-sm font-medium text-gray-600 mb-4">Your safety is our priority. All drivers are verified and rides are tracked 24/7.</p>
               <button onClick={() => navigate('/user/support')} className="text-orange-600 font-bold text-sm hover:underline">Learn more</button>
            </div>

            <div className="bg-gray-900 rounded-3xl p-6 text-white text-center">
               <h3 className="font-black text-xl mb-2">Refer & Earn</h3>
               <p className="text-gray-400 text-sm font-medium mb-4">Share your code with friends and earn wallet balance.</p>
               <div className="bg-white/10 px-4 py-3 rounded-xl border border-white/20 font-mono font-bold tracking-widest text-lg">
                  {user?.referralCode || 'GOINDIA50'}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
