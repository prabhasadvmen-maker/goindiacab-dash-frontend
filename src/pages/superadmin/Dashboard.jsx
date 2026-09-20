import React from 'react';
import { Building2, Users, IndianRupee, Heart } from 'lucide-react';
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

export default function Dashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const stats = [
    {
      title: 'Total NGOs / Admins',
      value: '1',
      subtitle: 'registered organizations',
      icon: Building2,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Total Users',
      value: '2',
      subtitle: 'all system roles',
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Total Donations',
      value: '₹6.0L',
      subtitle: 'total collected',
      icon: IndianRupee,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      title: 'Active Volunteers',
      value: '8',
      subtitle: 'currently active',
      icon: Heart,
      color: 'bg-blue-100 text-blue-700',
    }
  ];

  // Dummy data for charts
  const userRegistrationData = [
    { month: 'Jan', users: 1 },
    { month: 'Feb', users: 2 },
    { month: 'Mar', users: 2 },
    { month: 'Apr', users: 3 },
    { month: 'May', users: 4 },
    { month: 'Jun', users: 5 },
  ];

  const financialData = [
    { name: 'Week 1', donations: 3, expenses: 1 },
    { name: 'Week 2', donations: 4.5, expenses: 2 },
    { name: 'Week 3', donations: 2.5, expenses: 1.5 },
    { name: 'Week 4', donations: 6, expenses: 3 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
          <span className="text-sm font-medium">System Live and Synchronized</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-700">{stat.title}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* User Registrations Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">User Registrations</h3>
              <p className="text-xs text-gray-400 font-medium uppercase mt-1">User Registrations (Last 6 Months)</p>
            </div>
            <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">Monthly</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userRegistrationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#fa9600" strokeWidth={3} dot={{r: 4, fill: '#fa9600'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Trends Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Monthly Financial Trends</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center text-xs text-gray-500 font-medium"><span className="w-2 h-2 rounded-full bg-[#fa9600] mr-1.5"></span> Donations</div>
                <div className="flex items-center text-xs text-gray-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Expenses</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">Live Trend</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `₹${value}L`} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="donations" fill="#fa9600" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
