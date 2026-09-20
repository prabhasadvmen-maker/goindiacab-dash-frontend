import React, { useState, useEffect } from 'react';
import { Users, Car, IndianRupee, MapPin, RefreshCcw, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { adminToken } = useAuthStore();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    totalAdmins: 0,
    totalTrips: 0,
    totalRevenue: 0
  });
  
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch macro stats
      const statsRes = await axios.get(`${API_URL}/api/admins/dashboard-stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      // Fetch chart analytics (last 7 days)
      const analyticsRes = await axios.get(`${API_URL}/api/admins/reports/analytics?days=7`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      
      if (analyticsRes.data.success) {
        // Format dates for charts
        const formattedData = analyticsRes.data.data.map(item => {
           const d = new Date(item.date);
           return {
              ...item,
              formattedDate: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`
           };
        });
        setAnalytics(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'lifetime completed trips',
      icon: IndianRupee,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtitle: 'registered riders',
      icon: Users,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Partners',
      value: stats.totalPartners.toLocaleString(),
      subtitle: 'registered drivers',
      icon: Car,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Total Trips',
      value: stats.totalTrips.toLocaleString(),
      subtitle: 'all bookings',
      icon: MapPin,
      color: 'bg-orange-100 text-orange-700',
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-80px)] overflow-y-auto pb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Super Admin Overview</h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-sm font-medium">Platform Online</span>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
            {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10"></div>}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-700">{stat.title}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10"></div>}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                 <IndianRupee className="w-5 h-5 mr-1 text-green-600"/> Revenue Trend
              </h3>
              <p className="text-xs text-gray-400 font-medium uppercase mt-1">Daily Revenue (Last 7 Days)</p>
            </div>
            <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-semibold rounded-full flex items-center">
               <TrendingUp className="w-3 h-3 mr-1" /> Live
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{r: 4, fill: '#16a34a'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ride Volume Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
          {loading && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10"></div>}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                 <Car className="w-5 h-5 mr-1 text-blue-600"/> Ride Volume
              </h3>
              <p className="text-xs text-gray-400 font-medium uppercase mt-1">Completed Trips (Last 7 Days)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="formattedDate" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [value, 'Completed Rides']}
                />
                <Bar dataKey="rides" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
