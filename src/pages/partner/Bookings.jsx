import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Search, MapPin, Navigation, Calendar, Clock, CheckCircle2, XCircle, FileText, Car } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerBookings() {
  const { partnerToken } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/partner/bookings?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error fetching partner bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
      case 'ACCEPTED':
      case 'ENROUTE':
      case 'ARRIVED':
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center w-fit"><Navigation className="w-3 h-3 mr-1" /> Active</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(b => 
    b._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.user && b.user.name && b.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    b.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.dropoff.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-500 mt-1">Track your past, active, and upcoming trips.</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#F59E0B]">
          <Car className="w-6 h-6" />
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center justify-between p-2">
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar p-2 space-x-2">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {tab === 'ALL' ? 'All Trips' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="flex w-full md:w-auto items-center p-2">
          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID, Customer, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p>Loading your trips...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
            <p className="text-gray-500 mt-1">You don't have any trips matching the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trip Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fare</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-bold">
                          <span className="font-mono">#{booking._id.slice(-8).toUpperCase()}</span>
                          <span>•</span>
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(booking.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            <div className="w-0.5 h-6 bg-gray-200 ml-1 my-0.5"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          </div>
                          <div className="space-y-3 flex-1 overflow-hidden min-w-[200px] max-w-[300px]">
                            <p className="text-sm text-gray-900 truncate" title={booking.pickup.address}>{booking.pickup.address}</p>
                            <p className="text-sm text-gray-900 truncate" title={booking.dropoff.address}>{booking.dropoff.address}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-3 shrink-0 overflow-hidden">
                          {booking.user?.profilePic ? (
                            <img src={booking.user.profilePic} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">{booking.user?.name?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{booking.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{booking.user?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">₹{booking.fare.final || booking.fare.estimated}</div>
                      <div className="text-xs font-medium text-gray-500">{booking.paymentMethod} • {booking.paymentStatus}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(booking.status)}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">{booking.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/partner/bookings/${booking._id}`}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
