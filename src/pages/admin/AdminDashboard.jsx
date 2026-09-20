import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertCircle, 
  Car, 
  Clock, 
  CheckCircle, 
  MoreVertical,
  RefreshCcw,
  Navigation
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';

// Fix for default Leaflet icon not showing up in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for drivers
const driverIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3206/3206001.png', // Simple car icon or dot
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const { adminUser, adminToken } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeDrivers: 0,
    ongoingRides: 0,
    pendingBookings: 0,
    completedToday: 0,
    activeComplaints: 0,
    pendingApprovals: 0,
    recentApplications: [],
    recentComplaints: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Live drivers from socket
  const [liveDrivers, setLiveDrivers] = useState([]);

  useEffect(() => {
    fetchStats();

    // Setup Socket.IO connection for live tracking
    const newSocket = io(API_URL, {
      auth: { token: adminToken, role: 'admin' }
    });

    newSocket.on('connect', () => {
      newSocket.emit('admin_connect');
    });

    newSocket.on('admin_driver_update', (driversArray) => {
      setLiveDrivers(driversArray);
      // We also update the total count of active drivers in stats for real-time feel
      setStats(prev => ({
         ...prev,
         activeDrivers: driversArray.length
      }));
    });

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line
  }, [adminToken]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admins/operations/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Top Header / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminUser?.name || 'Administrator'}!
          </h2>
          <p className="text-gray-500 mt-1">Here is the real-time operations overview for today.</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/admin/partners')}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center border border-purple-100"
          >
            <Users className="w-4 h-4 mr-2" />
            Review Partners
            {stats.pendingApprovals > 0 && (
               <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingApprovals}</span>
            )}
          </button>
          <button 
            onClick={fetchStats}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
          {loadingStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-purple-600"/></div>}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl relative">
              <Car className="w-6 h-6" />
              {liveDrivers.length > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>}
            </div>
            <p className="text-gray-500 font-medium">Active Vehicles Live</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.activeDrivers}</h3>
          <p className="text-sm text-blue-600 mt-2 font-medium flex items-center">
            Tracking in real-time
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
          {loadingStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-purple-600"/></div>}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Pending Approvals</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.pendingApprovals}</h3>
          <p className="text-sm text-[#fa9600] mt-2 font-medium flex items-center cursor-pointer hover:underline" onClick={() => navigate('/admin/partners')}>
            Needs immediate review
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
          {loadingStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-purple-600"/></div>}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Completed Trips Today</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.completedToday}</h3>
          <p className="text-sm text-green-600 mt-2 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> Successful rides
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden">
          {loadingStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-purple-600"/></div>}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Active Complaints</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">{stats.activeComplaints}</h3>
          <p className="text-sm text-red-500 mt-2 font-medium">Unresolved tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Partner Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative min-h-[200px]">
             {loadingStats && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-purple-600"/></div>}
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Partner Applications</h3>
                <p className="text-sm text-gray-500">Drivers waiting for KYC and verification.</p>
              </div>
              <button 
                onClick={() => navigate('/admin/partners')}
                className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
               {stats.recentApplications && stats.recentApplications.length > 0 ? (
                  stats.recentApplications.map((app) => (
                     <div key={app._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-start space-x-4">
                           <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0 uppercase">
                           {app.personalInfo?.fullName?.charAt(0) || 'D'}
                           </div>
                           <div>
                           <p className="font-bold text-gray-900">{app.personalInfo?.fullName || 'Unknown'}</p>
                           <p className="text-sm text-gray-500">{app.vehicleDetails?.vehicleNumber || 'No Vehicle'} • ID: {app._id.slice(-6).toUpperCase()}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between sm:w-auto w-full sm:space-x-4">
                           <div className="text-right">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-[#fa9600]">
                                 Pending
                              </span>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(app.createdAt)}</p>
                           </div>
                           <button onClick={() => navigate('/admin/partners')} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors hidden sm:block">
                           <MoreVertical className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="p-8 text-center text-gray-500 font-medium">No pending applications found.</div>
               )}
            </div>
          </div>
        </div>

        {/* Live Tracking / Alerts (Right Column) */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
          
          {/* Real-time Leaflet Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative flex-1 min-h-[340px]">
             <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 z-[1000]"></div>
             
             <MapContainer 
               center={[28.7041, 77.1025]} 
               zoom={11} 
               style={{ height: '100%', width: '100%', zIndex: 10 }}
               zoomControl={false}
             >
               <TileLayer
                 url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               />
               
               {liveDrivers.map(driver => (
                  <Marker 
                     key={driver.driverId} 
                     position={[driver.location.lat, driver.location.lng]}
                     icon={driverIcon}
                  >
                     <Popup>
                        <div className="text-sm">
                           <p className="font-bold">{driver.name}</p>
                           <p className="text-xs text-gray-500">{driver.vehicleNumber}</p>
                        </div>
                     </Popup>
                  </Marker>
               ))}
             </MapContainer>
             
             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-100 z-[1000] flex items-center">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
               <span className="text-xs font-bold text-gray-700">{liveDrivers.length} Drivers Live</span>
             </div>

             <div className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg border border-gray-100 z-[1000] flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <Navigation className="w-5 h-5 text-purple-600" />
             </div>
          </div>

          {/* Real SOS / Escalations */}
          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6 relative">
             {loadingStats && <div className="absolute inset-0 bg-red-50/50 backdrop-blur-sm z-10 flex items-center justify-center"><RefreshCcw className="w-5 h-5 animate-spin text-red-600"/></div>}
            
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
               <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
               Recent Complaints
            </h3>
            
            <ul className="space-y-3">
               {stats.recentComplaints && stats.recentComplaints.length > 0 ? (
                  stats.recentComplaints.map(complaint => (
                     <li key={complaint._id} className="flex flex-col bg-white p-3 rounded-xl border border-red-100 hover:shadow-md cursor-pointer transition-shadow">
                        <div className="flex justify-between items-start mb-1">
                           <p className="text-sm font-bold text-gray-800 line-clamp-1">{complaint.subject || 'Support Ticket'}</p>
                           <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded ml-2",
                              complaint.priority === 'HIGH' ? "bg-red-100 text-red-600" : 
                              complaint.priority === 'MEDIUM' ? "bg-orange-100 text-[#fa9600]" : 
                              "bg-blue-100 text-blue-600"
                           )}>
                              {complaint.priority || 'LOW'}
                           </span>
                        </div>
                        <p className="text-xs text-gray-500">Raised by: {complaint.raisedBy?.name || 'User'} • {formatDate(complaint.createdAt)}</p>
                     </li>
                  ))
               ) : (
                  <li className="text-sm text-gray-500 font-medium text-center py-4 bg-white/50 rounded-xl border border-dashed border-red-200">
                     No active complaints! 🎉
                  </li>
               )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
