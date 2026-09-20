import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Building, Car, User } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function LoginSelector() {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'superadmin',
      name: 'SuperAdmin Portal',
      description: 'Full system control and platform oversight.',
      icon: ShieldAlert,
      color: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-800 hover:text-white',
      hoverBg: 'bg-gray-800',
      path: '/superadmin/login'
    },
    {
      id: 'admin',
      name: 'Admin Portal',
      description: 'Manage specific operations and regional data.',
      icon: Building,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white',
      hoverBg: 'bg-purple-600',
      path: '/admin/login'
    },
    {
      id: 'partner',
      name: 'Partner Portal',
      description: 'Accept rides, view earnings & manage documents.',
      icon: Car,
      color: 'bg-orange-50 text-[#fa9600] border-orange-200 hover:bg-[#fa9600] hover:text-white',
      hoverBg: 'bg-[#fa9600]',
      path: '/partner/login'
    },
    {
      id: 'customer',
      name: 'Customer Portal',
      description: 'Book rides, track trips & manage your account.',
      icon: User,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-600 hover:text-white',
      hoverBg: 'bg-blue-600',
      path: '/user/login'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600 rounded-b-[40%] shadow-lg blur-[2px] z-0"></div>

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10 text-white space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl p-2 mb-2">
             <img src="/Goindaicab%20logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight drop-shadow-md">
            Welcome to GoIndiaCab
          </h2>
          <p className="text-blue-100 text-lg font-medium drop-shadow-md">
            Please select a portal to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {portals.map((portal) => (
            <button
              key={portal.id}
              onClick={() => navigate(portal.path)}
              className={cn(
                "group relative bg-white flex flex-col p-8 rounded-2xl shadow-xl shadow-blue-900/5 border-2 border-transparent transition-all duration-300 text-left overflow-hidden",
                "hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              )}
            >
              {/* Background hover effect layer */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0",
                portal.hoverBg
              )}></div>

              <div className="relative z-10 flex items-start space-x-5">
                <div className={cn(
                  "p-4 rounded-xl border transition-colors duration-300",
                  portal.color.replace(/hover:[^\s]+/g, ''),
                  "group-hover:bg-white/20 group-hover:border-white/30 group-hover:text-white"
                )}>
                  <portal.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {portal.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 group-hover:text-white/80 transition-colors duration-300 leading-relaxed">
                    {portal.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} GoIndiaCab. All rights reserved.
        </div>
      </div>
    </div>
  );
}
