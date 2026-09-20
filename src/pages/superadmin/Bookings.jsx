import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Search,
  CalendarDays,
  MapPin,
  Car,
  User,
  Clock,
  Settings,
  Eye,
  RefreshCw,
  Navigation
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Bookings() {
  const navigate = useNavigate();
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/operations/bookings?_t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, status: statusFilter }
      });
      if (data.success) {
        setBookings(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalBookings(data.total);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [page, statusFilter]);

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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarDays className="w-6 h-6 mr-3 text-blue-600" />
            Booking Management
          </h2>
          <p className="text-gray-500 mt-1">Monitor and manage all {totalBookings} trips in the system.</p>
        </div>
        <button 
          onClick={() => fetchBookings()} 
          className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-gray-200/50">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg capitalize whitespace-nowrap transition-all",
                statusFilter === status 
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200/60 ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Booking Info</th>
                <th scope="col" className="px-6 py-4 font-bold">Passenger</th>
                <th scope="col" className="px-6 py-4 font-bold">Driver / Partner</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold">Fare</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded-lg w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Navigation className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No bookings found</p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 font-mono text-xs mb-1">
                        {b._id.toString().substring(18).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {formatDate(b.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{b.user?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.partner ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{b.partner.personalInfo?.fullName || 'Driver'}</p>
                            <p className="text-xs text-gray-500 font-mono">{b.partner.vehicleDetails?.vehicleNumber || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider", getStatusColor(b.status))}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{b.fare?.estimated || 0}</p>
                      <p className="text-xs text-gray-500">{b.paymentMethod}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === b._id ? null : b._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <Settings className={cn("w-5 h-5 transition-transform duration-300", activeDropdown === b._id && "rotate-90 text-blue-600")} />
                        </button>
                        
                        {activeDropdown === b._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1.5 overflow-hidden transform origin-top-right transition-all">
                              <button 
                                onClick={() => { setActiveDropdown(null); navigate(b._id); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors font-medium"
                              >
                                <Eye className="w-4 h-4 mr-2.5 text-gray-400" /> Manage
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
