import React from 'react';
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
  MoreVertical 
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AdminDashboard() {
  const { adminUser } = useAuthStore();
  const navigate = useNavigate();

  const recentApplications = [
    { id: 'APP-1029', name: 'Rakesh Sharma', vehicle: 'Swift Dzire (DL 1Z 9999)', status: 'Pending Review', date: '2 hours ago' },
    { id: 'APP-1028', name: 'Mukesh Kumar', vehicle: 'Toyota Innova (HR 26 8888)', status: 'Pending Review', date: '5 hours ago' },
    { id: 'APP-1027', name: 'Anil Singh', vehicle: 'Hyundai Aura (UP 14 7777)', status: 'Action Required', date: '1 day ago' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {adminUser?.name || 'Administrator'}!
          </h2>
          <p className="text-gray-500 mt-1">Here is the regional operations overview for today.</p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/admin/partners')}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center border border-purple-100"
          >
            <Users className="w-4 h-4 mr-2" />
            Review Partners
          </button>
          <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-colors flex items-center">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Active Vehicles</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">142</h3>
          <p className="text-sm text-green-600 mt-2 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +12 this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Pending Approvals</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">28</h3>
          <p className="text-sm text-[#fa9600] mt-2 font-medium flex items-center cursor-pointer hover:underline" onClick={() => navigate('/admin/partners')}>
            Needs immediate review
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Completed Trips</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">1,204</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Across all zones today</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Active Complaints</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">5</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">3 resolved since morning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Feed (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Partner Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pending Partner Applications</h3>
                <p className="text-sm text-gray-500">Drivers waiting for KYC and Vehicle verification.</p>
              </div>
              <button 
                onClick={() => navigate('/admin/partners')}
                className="text-purple-600 text-sm font-semibold hover:text-purple-800 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-start space-x-4">
                     <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
                       {app.name.charAt(0)}
                     </div>
                     <div>
                       <p className="font-bold text-gray-900">{app.name}</p>
                       <p className="text-sm text-gray-500">{app.vehicle} • {app.id}</p>
                     </div>
                  </div>
                  <div className="flex items-center justify-between sm:w-auto w-full sm:space-x-4">
                    <div className="text-right">
                       <span className={cn(
                         "px-3 py-1 rounded-full text-xs font-bold",
                         app.status === 'Pending Review' ? "bg-orange-100 text-[#fa9600]" : "bg-red-100 text-red-600"
                       )}>
                         {app.status}
                       </span>
                       <p className="text-xs text-gray-400 mt-1">{app.date}</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors hidden sm:block">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Tracking / Alerts (Right Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Operational Map */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative h-[340px]">
             <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 z-10"></div>
             
             {/* Fake map image background */}
             <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+Delhi&zoom=11&size=400x400&sensor=false&style=feature:all|element:labels|visibility:off&client=gme-googleinc')] bg-cover bg-center opacity-70 grayscale"></div>
             
             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 z-10 flex items-center">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
               <span className="text-xs font-bold text-gray-700">142 Drivers Live</span>
             </div>

             {/* Simulated Vehicles on map */}
             <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-md"></div>
             <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-md"></div>
             <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-600 rounded-full border-2 border-white shadow-md"></div>
             
             <div className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">High Demand Zone</p>
                    <p className="text-xs text-gray-500">Connaught Place, Central</p>
                  </div>
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
             </div>
          </div>

          {/* Quick Support Tickets */}
          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
               <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
               SOS / Escalations
            </h3>
            <ul className="space-y-3">
              <li className="flex flex-col bg-white p-3 rounded-xl border border-red-100 hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-gray-800">Payment Dispute</p>
                  <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded">High</span>
                </div>
                <p className="text-xs text-gray-500">Trip TRP-8822 • User raised an issue.</p>
              </li>
              <li className="flex flex-col bg-white p-3 rounded-xl border border-red-100 hover:shadow-md cursor-pointer transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-gray-800">Vehicle Breakdown</p>
                  <span className="text-[10px] bg-orange-100 text-[#fa9600] font-bold px-2 py-0.5 rounded">Medium</span>
                </div>
                <p className="text-xs text-gray-500">Partner reported breakdown on NH-48.</p>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
