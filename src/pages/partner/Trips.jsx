import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Calendar, MapPin, Clock, Navigation, CheckCircle2, Navigation2, FileText, IndianRupee } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerTrips() {
  const { partnerToken } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      // Only fetch completed trips for the logbook from V2 history
      const { data } = await axios.get(`${API_URL}/api/v2/partner/bookings/history`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (data.success) {
        const completedOnly = (data.data || []).filter(b => b.status === 'COMPLETED');
        setTrips(completedOnly);
      }
    } catch (error) {
      console.error('Error fetching partner trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group trips by date
  const groupTripsByDate = (tripsList) => {
    const groups = {};
    
    tripsList.forEach(trip => {
      const date = new Date(trip.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (!groups[date]) {
        groups[date] = {
          dateStr: date,
          rawDate: new Date(trip.createdAt).setHours(0,0,0,0),
          trips: [],
          totalDistance: 0,
          totalFare: 0,
          totalDurationSec: 0
        };
      }
      
      groups[date].trips.push(trip);
      groups[date].totalDistance += (trip.distance?.value || 0); // Assuming value in meters
      groups[date].totalDurationSec += (trip.duration?.value || 0); // Assuming value in seconds
      groups[date].totalFare += (trip.fare?.final || trip.fare?.estimated || 0);
    });

    // Sort groups by date descending
    return Object.values(groups).sort((a, b) => b.rawDate - a.rawDate);
  };

  const filteredTrips = trips.filter(t => {
    if (dateFilter === 'ALL') return true;
    const tripTime = new Date(t.createdAt).getTime();
    const now = new Date().getTime();
    const daysDiff = (now - tripTime) / (1000 * 3600 * 24);
    
    if (dateFilter === '7_DAYS') return daysDiff <= 7;
    if (dateFilter === '30_DAYS') return daysDiff <= 30;
    return true;
  });

  const groupedTrips = groupTripsByDate(filteredTrips);

  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-sm text-white">
        <div>
          <h2 className="text-3xl font-bold">Trip Logbook</h2>
          <p className="text-gray-300 mt-2">Your history of completed trips and daily performance.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none focus:ring-0 [&>option]:text-gray-900 border-none px-2 cursor-pointer"
          >
            <option value="ALL">All Time History</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading your logbook...</p>
        </div>
      ) : groupedTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <Navigation2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No trips logged yet</h3>
          <p className="text-gray-500 mt-1">Completed trips will appear here grouped by day.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTrips.map((group, index) => (
            <div key={index} className="space-y-4">
              
              {/* Date Header & Summary Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mr-4">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{group.dateStr}</h3>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Trips</p>
                    <p className="font-black text-gray-900 text-lg">{group.trips.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Distance</p>
                    <p className="font-black text-blue-600 text-lg">{formatDistance(group.totalDistance)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Earnings</p>
                    <p className="font-black text-green-600 text-lg">₹{group.totalFare}</p>
                  </div>
                </div>
              </div>

              {/* Trips List for the Date */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                {group.trips.map((trip) => (
                  <div key={trip._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex flex-col items-center mt-1">
                           <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                           <div className="w-0.5 h-8 bg-gray-200 my-1"></div>
                           <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-0.5 flex items-center">
                              <Clock className="w-3 h-3 mr-1" /> {new Date(trip.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{trip.pickup.address}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-0.5 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> Dropped
                            </p>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{trip.dropoff.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        <div className="text-left md:text-right">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fare Earned</p>
                          <p className="text-xl font-black text-gray-900">₹{trip.fare?.final || trip.fare?.estimated}</p>
                        </div>
                        <Link 
                          to={`/partner/bookings/${trip._id}`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors mt-0 md:mt-4"
                        >
                          View Details
                        </Link>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
