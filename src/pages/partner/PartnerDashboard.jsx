import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { 
  Wallet, 
  TrendingUp, 
  Car, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Power
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PartnerDashboard() {
  const { partnerUser } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header / Status Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {partnerUser?.name || 'Partner'}!
          </h2>
          <p className="text-gray-500 mt-1 flex items-center">
            Vehicle: <span className="font-semibold text-gray-800 ml-1">DL 1ZC 9988</span> (Mini)
          </p>
        </div>
        
        {/* Go Online Toggle */}
        <div className="flex items-center space-x-4 bg-gray-50 p-2 pr-6 rounded-full border border-gray-200">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm",
              isOnline ? "bg-green-500 text-white shadow-green-500/30" : "bg-gray-300 text-gray-600 hover:bg-gray-400"
            )}
          >
            <Power className="w-6 h-6" />
          </button>
          <div>
            <p className={cn("font-bold text-lg", isOnline ? "text-green-600" : "text-gray-500")}>
              {isOnline ? "You're Online" : "You're Offline"}
            </p>
            <p className="text-xs text-gray-500">
              {isOnline ? "Searching for rides..." : "Go online to start earning"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Today's Earnings</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">₹1,240</h3>
          <p className="text-sm text-green-600 mt-2 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" /> +12% vs yesterday
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Trips Completed</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">4</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Out of 5 requests</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-50 text-[#fa9600] rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Online Hours</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">3h 45m</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Since 8:00 AM</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Your Rating</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">4.9</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Based on 142 trips</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active/Incoming Ride (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {isOnline ? (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Searching for rides...</h3>
                    <p className="text-gray-500 text-sm mt-1">Keep the app open and stay in the active zone.</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                </div>
                
                {/* Fake Map */}
                <div className="bg-gray-100 h-64 rounded-xl overflow-hidden relative border border-gray-200">
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+Delhi&zoom=14&size=800x400&sensor=false&style=feature:all|element:labels|visibility:off&client=gme-googleinc')] bg-cover bg-center opacity-80"></div>
                  
                  {/* Radar animation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute top-0 left-0"></div>
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-lg">
                      <Car className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full">
               <Power className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-500">You are Offline</h3>
               <p className="text-gray-400 mt-2 max-w-sm">Tap the go online button at the top to start receiving ride requests in your area.</p>
            </div>
          )}
        </div>

        {/* Performance & Alerts (Right Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Performance</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-gray-700">Acceptance Rate</span>
                  <span className="text-sm font-bold text-green-600">92%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-gray-700">Cancellation Rate</span>
                  <span className="text-sm font-bold text-gray-900">4%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-[#fa9600] h-2 rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Required / Alerts */}
          <div className="bg-orange-50 rounded-2xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[#fa9600]" />
              <h3 className="text-lg font-bold text-gray-900">Action Required</h3>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fa9600] mt-2 mr-2"></div>
                <p className="text-sm text-gray-700">Your Vehicle Insurance is expiring in 14 days. Please upload the renewed document.</p>
              </li>
            </ul>
            
            <button className="mt-4 w-full bg-white border border-orange-200 text-[#fa9600] py-2 rounded-xl font-bold hover:bg-orange-100 transition-colors text-sm">
              Update Documents
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
