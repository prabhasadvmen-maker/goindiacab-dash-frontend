import React from 'react';
import { useUserAuthStore } from '../../store/userAuthStore';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, ShieldCheck, Car, Star, Wallet, TrendingUp, CalendarCheck } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function UserDashboard() {
  const { user } = useUserAuthStore();
  const navigate = useNavigate();

  const recentTrips = [
    {
      id: 'TRP-9832',
      date: 'Today, 10:30 AM',
      from: 'Indira Gandhi International Airport',
      to: 'Connaught Place, New Delhi',
      amount: '₹450',
      status: 'Completed',
      car: 'Sedan',
      driver: 'Rahul S.',
    },
    {
      id: 'TRP-9711',
      date: 'Yesterday, 6:15 PM',
      from: 'Cyber Hub, Gurugram',
      to: 'Vasant Kunj, New Delhi',
      amount: '₹320',
      status: 'Completed',
      car: 'Mini',
      driver: 'Amit K.',
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header / Call to Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Hello, {user?.name || 'Traveler'}! 👋
          </h2>
          <p className="text-gray-500 mt-1">Where are we going today?</p>
        </div>
        
        <button 
          onClick={() => navigate('/user/book')}
          className="bg-[#fa9600] hover:bg-[#e68a00] text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/20 transition-all flex items-center space-x-2"
        >
          <Car className="w-5 h-5" />
          <span>Book a Ride Now</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Wallet Balance</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">₹0.00</h3>
          <p className="text-sm text-blue-600 mt-2 font-medium flex items-center cursor-pointer hover:underline">
            + Add Money to Wallet
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Total Rides</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">12</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Lifetime completed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-50 text-[#fa9600] rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Total Saved</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">₹450</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Using GoIndiaCab offers</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">Your Rating</p>
          </div>
          <h3 className="text-3xl font-extrabold text-gray-900">4.9</h3>
          <p className="text-sm text-gray-500 mt-2 font-medium">Top tier passenger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions & Recent Activity (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/user/book')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100"
              >
                <Car className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Ride</span>
              </button>
              <button 
                onClick={() => navigate('/user/book?type=rental')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-orange-50 text-[#fa9600] hover:bg-orange-100 transition-colors border border-orange-100"
              >
                <Clock className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Rentals</span>
              </button>
              <button 
                onClick={() => navigate('/user/book?type=outstation')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-100"
              >
                <Navigation className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Outstation</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-100"
              >
                <ShieldCheck className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Safety</span>
              </button>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Trips</h3>
              <button 
                onClick={() => navigate('/user/bookings')}
                className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors"
              >
                View All
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {recentTrips.map((trip) => (
                <div key={trip.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-500">{trip.date}</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        {trip.status}
                      </span>
                    </div>
                    
                    <div className="relative pl-6 space-y-4">
                      {/* Timeline line */}
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      
                      <div className="relative">
                        <div className="absolute left-[-24px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        <p className="text-sm font-semibold text-gray-900">{trip.from}</p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[-24px] top-1 w-3 h-3 bg-[#fa9600] rounded-full border-2 border-white shadow-sm"></div>
                        <p className="text-sm font-semibold text-gray-900">{trip.to}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">{trip.amount}</p>
                      <p className="text-xs text-gray-500 font-medium">Paid via UPI</p>
                    </div>
                    <div className="text-right sm:mt-4">
                      <p className="text-sm font-bold text-gray-800">{trip.car}</p>
                      <p className="text-xs text-gray-500 flex items-center justify-end">
                        {trip.driver} <Star className="w-3 h-3 text-yellow-400 ml-1 fill-yellow-400" /> 4.8
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map & Alerts (Right Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Map Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden relative h-64">
             <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 z-10"></div>
             
             {/* Fake map image background */}
             <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=New+Delhi&zoom=13&size=800x400&sensor=false&style=feature:all|element:labels|visibility:off&client=gme-googleinc')] bg-cover bg-center opacity-80"></div>
             
             {/* Map overlay content */}
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute"></div>
                <div className="bg-blue-600 p-3 rounded-full shadow-lg border-4 border-white relative z-10">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/95 backdrop-blur-sm px-4 py-2 mt-4 rounded-xl shadow-lg border border-gray-100">
                  <p className="font-bold text-gray-900 text-sm">Your Location</p>
                </div>
             </div>
          </div>

          {/* Action Required / Alerts */}
          <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Promotions</h3>
            <ul className="space-y-3">
              <li className="flex items-start bg-white p-3 rounded-xl border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-[#fa9600] mt-1.5 mr-3 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">50% Off your next ride</p>
                  <p className="text-xs text-gray-500 mt-0.5">Use code GOINDIA50</p>
                </div>
              </li>
              <li className="flex items-start bg-white p-3 rounded-xl border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3 shrink-0"></div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Refer & Earn</p>
                  <p className="text-xs text-gray-500 mt-0.5">Earn ₹100 for every friend</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
