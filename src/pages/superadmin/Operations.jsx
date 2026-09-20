import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  MapPin,
  Car,
  Clock,
  Navigation,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Operations() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [stats, setStats] = useState({
    activeDrivers: 0,
    ongoingRides: 0,
    pendingBookings: 0,
    completedToday: 0
  });
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOverview = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/operations/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching operations overview:', error);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/operations/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, status: statusFilter }
      });
      if (data.success) {
        setBookings(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchBookings();
    
    // Auto refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchOverview();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [page, statusFilter]);

  const handleRefresh = () => {
    fetchOverview();
    fetchBookings();
  };

  const handleCancelRide = async (bookingId) => {
    if (!window.confirm("Are you sure you want to forcefully cancel this ride?")) return;
    
    try {
      const { data } = await axios.patch(
        `${API_URL}/api/admins/operations/bookings/${bookingId}/status`,
        { status: 'CANCELLED', cancelReason: 'Force cancelled by Operations team.' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        alert('Ride cancelled successfully');
        handleRefresh();
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      alert('Failed to cancel ride');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENROUTE': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ARRIVED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IN_PROGRESS': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations Control Center</h2>
          <p className="text-gray-500 mt-1">Live monitoring and dispatch management.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Live Sync
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Drivers', value: stats.activeDrivers, icon: Car, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Ongoing Rides', value: stats.ongoingRides, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Completed Today', value: stats.completedToday, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
            </div>
            <div className={cn("p-4 rounded-full", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Map Placeholder */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-blue-600" />
            Live Dispatch Map
          </div>
          <div className="flex-1 min-h-[400px] bg-slate-100 relative">
            {/* Fake Map Background using CSS pattern */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <MapPin className="w-12 h-12 text-gray-400 mb-4 drop-shadow-md" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Map Integration Pending</h3>
              <p className="text-sm text-gray-500">
                Google Maps or Mapbox API integration will be required here to show real-time vehicle clustering and locations.
              </p>
            </div>

            {/* Fake Cabs Blinking */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-ping" style={{ animationDelay: '1s'}}></div>
          </div>
        </div>

        {/* Live Bookings Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="font-bold text-gray-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Live Bookings Feed
            </div>
            {/* Status Filter */}
            <div className="flex items-center space-x-2 text-sm bg-gray-50 p-1 rounded-lg">
              {['all', 'pending', 'ongoing', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (status === 'ongoing') setStatusFilter('in_progress');
                    else setStatusFilter(status);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-md capitalize font-medium transition-colors",
                    (statusFilter === status || (statusFilter === 'in_progress' && status === 'ongoing'))
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Route Info</th>
                  <th className="px-6 py-4">Customer & Driver</th>
                  <th className="px-6 py-4">Status & Fare</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-full"></div></td>
                      <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-10 bg-gray-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                      No bookings found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2 max-w-[250px]">
                          <div className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-2 shrink-0"></div>
                            <p className="text-xs text-gray-900 font-medium truncate" title={booking.pickup.address}>{booking.pickup.address}</p>
                          </div>
                          <div className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2 shrink-0"></div>
                            <p className="text-xs text-gray-900 font-medium truncate" title={booking.dropoff.address}>{booking.dropoff.address}</p>
                          </div>
                          <div className="text-xs text-gray-400 pl-4">{new Date(booking.createdAt).toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-bold text-gray-900">👤 {booking.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{booking.user?.phone}</p>
                          </div>
                          {booking.partner ? (
                            <div>
                              <p className="text-xs font-bold text-blue-600">🚕 {booking.partner.personalInfo?.fullName || 'Assigned'}</p>
                              <p className="text-xs text-gray-500">{booking.partner.vehicleDetails?.vehicleNumber}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-orange-500 font-medium mt-1">⏳ Waiting for Driver...</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={cn(
                            "px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border inline-block",
                            getStatusBadge(booking.status)
                          )}>
                            {booking.status}
                          </span>
                          <p className="font-bold text-gray-900">₹{booking.fare.estimated}</p>
                          <p className="text-xs text-gray-500 capitalize">{booking.vehicleType}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* If ride is not completed/cancelled, allow cancel */}
                        {!['COMPLETED', 'CANCELLED'].includes(booking.status) ? (
                          <button
                            onClick={() => handleCancelRide(booking._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Force Cancel Ride"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <span className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
