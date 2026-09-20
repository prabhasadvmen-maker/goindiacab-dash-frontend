import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import {
  Download,
  Users,
  Car,
  Briefcase,
  CalendarDays,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Reports() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [days, setDays] = useState(7);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/reports/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { days }
      });
      if (data.success) {
        setChartData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [days]);

  const handleExport = async (type) => {
    setDownloading(type);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/reports/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.data.length > 0) {
        // Convert JSON to CSV
        const items = data.data;
        const replacer = (key, value) => value === null ? '' : value; 
        const header = Object.keys(items[0]);
        const csv = [
          header.join(','), // header row first
          ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
        ].join('\r\n');

        // Create Blob and Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `goindiacab_${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('No data available to export.');
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      alert('Failed to export data');
    } finally {
      setDownloading(null);
    }
  };

  const formatCurrency = (value) => `₹${value}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">Visualize platform growth and export raw data.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setDays(7)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              days === 7 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDays(30)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              days === 30 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Daily Gross Revenue</h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-gray-400 font-medium">Loading chart data...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                <p>No revenue data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth()+1}`;
                    }}
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tickFormatter={(val) => `₹${val}`}
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Completed Rides Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Daily Completed Rides</h3>
          <div className="h-72 w-full">
            {loading ? (
              <div className="w-full h-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-gray-400 font-medium">Loading chart data...</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                <Car className="w-8 h-8 mb-2 opacity-20" />
                <p>No ride data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth()+1}`;
                    }}
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [value, 'Rides']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Bar 
                    dataKey="rides" 
                    fill="#0F172A" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                    minPointSize={4}
                    background={{ fill: '#F8FAFC', radius: [4, 4, 0, 0] }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Data Export Hub */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center bg-gray-50/50">
          <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
          <h3 className="font-bold text-gray-800">Raw Data Export Hub (CSV)</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Customers Export */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors group">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Customers Data</h4>
            <p className="text-sm text-gray-500 mb-4">Export all registered users, their contact info, and status.</p>
            <button 
              onClick={() => handleExport('users')}
              disabled={downloading === 'users'}
              className="w-full flex items-center justify-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {downloading === 'users' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </button>
          </div>

          {/* Partners Export */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors group">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Partners Data</h4>
            <p className="text-sm text-gray-500 mb-4">Export all driver partners, vehicle details, and approval status.</p>
            <button 
              onClick={() => handleExport('partners')}
              disabled={downloading === 'partners'}
              className="w-full flex items-center justify-center text-sm font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {downloading === 'partners' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </button>
          </div>

          {/* Bookings Export */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors group">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Bookings Data</h4>
            <p className="text-sm text-gray-500 mb-4">Export lifetime ride history, fares, routes, and statuses.</p>
            <button 
              onClick={() => handleExport('bookings')}
              disabled={downloading === 'bookings'}
              className="w-full flex items-center justify-center text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {downloading === 'bookings' ? 'Generating...' : <><Download className="w-4 h-4 mr-2" /> Download CSV</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
