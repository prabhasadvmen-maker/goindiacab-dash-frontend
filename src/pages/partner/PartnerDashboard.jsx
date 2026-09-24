import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Wallet, TrendingUp, Car, MapPin, Star, Clock,
  AlertTriangle, Power, Navigation, Phone, CheckCircle2, DollarSign
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerDashboard() {
  const { partnerUser, partnerToken } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ todayEarnings: 0, tripsCompleted: 0, rating: 5.0, onlineHours: '0h' });
  const [socket, setSocket] = useState(null);

  // Real-time states
  const [incomingBooking, setIncomingBooking] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [otpInput, setOtpInput] = useState('');

  // 1. Fetch Stats on Mount
  useEffect(() => {
    fetchStats();
    fetchActiveBooking();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async () => {
    try {
      // V2 Granular APIs
      const headers = { Authorization: `Bearer ${partnerToken}` };
      const [earningsRes, metricsRes, ratingsRes] = await Promise.all([
         axios.get(`${API_URL}/api/v2/partner/finance/earnings/today`, { headers }),
         axios.get(`${API_URL}/api/v2/partner/performance/metrics`, { headers }),
         axios.get(`${API_URL}/api/v2/partner/performance/ratings`, { headers })
      ]);
      
      setStats({
         todayEarnings: earningsRes.data?.data?.today || 0,
         tripsCompleted: earningsRes.data?.data?.trips || 0,
         rating: ratingsRes.data?.data?.averageRating || 5.0,
         onlineHours: metricsRes.data?.data?.onlineHours || '0h'
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleToggleOnline = async () => {
    if (activeBooking) return;

    const newStatus = !isOnline;

    try {
      // 1. Get real location if going online
      let lat = 28.7041;
      let lng = 77.1025;

      if (newStatus && 'geolocation' in navigator) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (err) {
          console.warn('Geolocation failed, using default Delhi location', err);
        }
      }

      // 2. Update DB via Granular V2 APIs
      const response = await axios.put(`${API_URL}/api/v2/partner/activity/status`, {
        isOnline: newStatus
      }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });

      if (response.data.success) {
        setIsOnline(newStatus);
        
        // Also ping location for V2
        if (newStatus) {
           await axios.patch(`${API_URL}/api/v2/partner/activity/location`, { lat, lng }, {
              headers: { Authorization: `Bearer ${partnerToken}` }
           }).catch(() => {});
        }

        // Ensure Socket connection uses the accurate coordinates
        if (newStatus && socket) {
          socket.emit('update_location', { driverId: partnerUser._id || partnerUser.id, lat, lng });
        }
      }
    } catch (error) {
      console.error('Failed to update status in DB:', error);
      alert('Failed to go online. Check your connection.');
    }
  };

  const fetchActiveBooking = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/partner/bookings/active`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success && response.data.data) {
        setActiveBooking(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch active booking:', error);
    }
  };

  // 2. Manage Socket Connection based on Online Status
  useEffect(() => {
    if (isOnline) {
      const newSocket = io(API_URL, {
        auth: { token: partnerToken, role: 'partner' }
      });

      newSocket.on('connect', () => {
        // We will emit location when we get it in handleToggleOnline or default here
        newSocket.emit('driver_connect', {
          driverId: partnerUser._id || partnerUser.id,
          name: partnerUser.name || 'Partner',
          vehicleNumber: partnerUser.vehicleNumber || 'UP14CD1234',
          lat: 28.7041,
          lng: 77.1025
        });
      });

      newSocket.on('newBookingRequest', (booking) => {
        // Only show if we don't have an active trip and matches our vehicle type
        // For demo, we accept any type or add filter if needed
        if (!activeBooking) {
          setIncomingBooking(booking);
          // Auto dismiss after 30 seconds
          setTimeout(() => setIncomingBooking(null), 30000);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIncomingBooking(null);
    }
    // eslint-disable-next-line
  }, [isOnline, activeBooking]);

  const handleAcceptRide = async () => {
    if (!incomingBooking) return;
    setAccepting(true);
    try {
      const bookingId = incomingBooking._id || incomingBooking.id;
      const response = await axios.post(`${API_URL}/api/v2/partner/bookings/${bookingId}/accept`, {}, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        setActiveBooking(response.data.data);
        setIncomingBooking(null);
      }
    } catch (error) {
      console.error('Failed to accept:', error);
      alert('Failed to accept booking. It may have been taken by another driver or cancelled.');
      setIncomingBooking(null);
    } finally {
      setAccepting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeBooking) return;

    // OTP Check before starting trip
    if (newStatus === 'IN_PROGRESS') {
      if (otpInput !== activeBooking.otp) {
        alert('Invalid OTP. Please ask the user for the correct 4-digit PIN.');
        return;
      }
    }

    setUpdating(true);
    try {
      const bookingId = activeBooking._id || activeBooking.id;
      let endpoint = '';
      
      if (newStatus === 'ENROUTE') {
         setActiveBooking({...activeBooking, status: 'ENROUTE'});
         setUpdating(false);
         return;
      } else if (newStatus === 'ARRIVED') {
         endpoint = `/api/v2/partner/bookings/${bookingId}/arrive`;
      } else if (newStatus === 'IN_PROGRESS') {
         endpoint = `/api/v2/partner/bookings/${bookingId}/start`;
      } else if (newStatus === 'COMPLETED') {
         endpoint = `/api/v2/partner/bookings/${bookingId}/complete`;
      }

      const response = await axios.patch(`${API_URL}${endpoint}`, { otp: otpInput }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });

      if (response.data.success) {
        if (newStatus === 'COMPLETED') {
          setActiveBooking(null);
          fetchStats(); // Refresh earnings
        } else {
          setActiveBooking({...activeBooking, status: newStatus});
        }
        setOtpInput(''); // Reset OTP input
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-[calc(100vh-80px)] overflow-y-auto relative">

      {/* Top Header / Status Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900">
            Welcome back, {partnerUser?.name?.split(' ')[0] || 'Partner'}!
          </h2>
          <p className="text-gray-500 font-medium mt-1 flex items-center">
            Vehicle: <span className="font-bold text-gray-800 ml-1">{partnerUser?.vehicleNumber || 'DL 1ZC 9988'}</span>
          </p>
        </div>

        {/* Go Online Toggle */}
        <div className="flex items-center space-x-4 bg-gray-50 p-2 pr-6 rounded-full border border-gray-200">
          <button
            onClick={handleToggleOnline}
            disabled={activeBooking !== null}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm",
              isOnline ? "bg-green-500 text-white shadow-green-500/30" : "bg-gray-300 text-gray-600 hover:bg-gray-400",
              activeBooking && "opacity-50 cursor-not-allowed"
            )}
          >
            <Power className="w-6 h-6" />
          </button>
          <div>
            <p className={cn("font-bold text-lg", isOnline ? "text-green-600" : "text-gray-500")}>
              {isOnline ? "You're Online" : "You're Offline"}
            </p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {activeBooking ? "Trip in progress" : isOnline ? "Searching for rides..." : "Go online to earn"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Today's Earnings</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900">₹{stats.todayEarnings}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Car className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Trips Completed</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900">{stats.tripsCompleted}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Online Hours</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900">{stats.onlineHours}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">Your Rating</p>
          </div>
          <h3 className="text-4xl font-black text-gray-900">{stats.rating.toFixed(1)}</h3>
        </div>
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Radar / Active Trip */}
        <div className="lg:col-span-2 space-y-6 h-full">
          {activeBooking ? (
            <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-100 overflow-hidden relative flex flex-col h-full min-h-[400px]">
              <div className="bg-blue-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-2xl">Active Trip</h3>
                    <p className="font-medium text-blue-200 mt-1">Status: {activeBooking.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-3xl">₹{activeBooking.fare.estimated}</p>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">{activeBooking.paymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                      <p className="font-bold text-gray-900">{activeBooking.pickup.address}</p>
                    </div>
                  </div>
                  <div className="ml-3 w-0.5 h-6 bg-gray-200"></div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff</p>
                      <p className="font-bold text-gray-900">{activeBooking.dropoff.address}</p>
                    </div>
                  </div>
                </div>

                {activeBooking.status === 'ARRIVED' && (
                  <div className="bg-gray-900 p-6 rounded-2xl text-white">
                    <p className="font-bold text-gray-400 uppercase text-xs mb-2">Ask Customer for OTP</p>
                    <input
                      type="text"
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-xl px-4 py-3 text-center text-3xl tracking-widest font-black outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  {activeBooking.status === 'ACCEPTED' && (
                    <button onClick={() => handleUpdateStatus('ENROUTE')} disabled={updating} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors">Start Moving to Pickup</button>
                  )}
                  {activeBooking.status === 'ENROUTE' && (
                    <button onClick={() => handleUpdateStatus('ARRIVED')} disabled={updating} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-colors">I Have Arrived</button>
                  )}
                  {activeBooking.status === 'ARRIVED' && (
                    <button onClick={() => handleUpdateStatus('IN_PROGRESS')} disabled={updating || otpInput.length !== 4} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Start Trip</button>
                  )}
                  {activeBooking.status === 'IN_PROGRESS' && (
                    <button onClick={() => handleUpdateStatus('COMPLETED')} disabled={updating} className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 mr-2" /> Complete Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : isOnline ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col h-full min-h-[400px]">
              <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900">Radar is Active</h3>
                <p className="text-gray-500 font-medium mt-1">Keep the app open to receive rides.</p>
              </div>

              <div className="flex-1 bg-[#e5e3df] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                {/* Radar animation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-48 bg-blue-500/10 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-ping absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '0.5s' }}></div>
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-xl">
                    <Navigation className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <Power className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-400">You are Offline</h3>
              <p className="text-gray-400 font-medium mt-2 max-w-sm">Tap the go online button at the top to connect to the network and receive rides.</p>
            </div>
          )}
        </div>

        {/* Alerts & Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-orange-50 rounded-3xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-black text-gray-900">Action Required</h3>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 mr-3 flex-shrink-0"></div>
                <p className="text-sm font-medium text-gray-700 leading-snug">Your Vehicle Insurance is expiring in 14 days. Please upload the renewed document in Settings.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Incoming Ride Modal Overlay */}
      {incomingBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            <div className="bg-blue-600 text-white p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black mb-1">New Ride Request!</h2>
                <p className="font-medium text-blue-200 text-sm uppercase tracking-wider">Accept quickly before it expires</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Fare</p>
                  <p className="text-4xl font-black text-gray-900">₹{incomingBooking.fare.estimated}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Distance</p>
                  <p className="text-xl font-black text-gray-900">{incomingBooking.distance.text}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</p>
                    <p className="font-bold text-gray-900 leading-snug">{incomingBooking.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                    <MapPin className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff</p>
                    <p className="font-bold text-gray-900 leading-snug">{incomingBooking.dropoff.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setIncomingBooking(null)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-gray-900 transition-colors">Decline</button>
                <button onClick={handleAcceptRide} disabled={accepting} className="flex-[2] py-4 bg-black hover:bg-gray-800 text-white rounded-2xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 shadow-xl shadow-black/20">
                  {accepting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Accept Ride'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
