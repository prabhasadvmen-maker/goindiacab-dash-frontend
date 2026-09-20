import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Handshake, 
  Users, 
  Car, 
  CalendarCheck, 
  IndianRupee, 
  MapPin,
  Bell,
  MessageSquareWarning,
  FileText,
  User,
  Headset,
  Settings,
  LogOut,
  Menu
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { adminUser: user, adminLogout: logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const topMenuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Partner Management', icon: Handshake, path: '/admin/partners' },
    { name: 'Customer Management', icon: Users, path: '/admin/customers' },
    { name: 'Vehicle Management', icon: Car, path: '/admin/vehicles' },
    { name: 'Booking Management', icon: CalendarCheck, path: '/admin/bookings' },
    { name: 'Payment Management', icon: IndianRupee, path: '/admin/payments' },
    { name: 'Online / Location', icon: MapPin, path: '/admin/location' },
    { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { name: 'Complaints', icon: MessageSquareWarning, path: '/admin/complaints' },
    { name: 'Reports', icon: FileText, path: '/admin/reports' },
  ];

  const bottomMenuItems = [
    { name: 'Profile', icon: User, path: '/admin/profile' },
    { name: 'Support', icon: Headset, path: '/admin/support' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const SidebarLink = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => cn(
        "flex items-center px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-300 relative group overflow-hidden",
        isActive 
          ? "bg-[#F59E0B] text-white font-bold shadow-md" 
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      )}
      title={!isSidebarOpen ? item.name : ""}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
        <item.icon className="w-5 h-5" />
      </div>
      <span 
        className={cn(
          "whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden",
          isSidebarOpen ? "ml-3 opacity-100 translate-x-0 max-w-[200px]" : "opacity-0 -translate-x-4 max-w-0 m-0"
        )}
      >
        {item.name}
      </span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 border-r border-slate-800 flex flex-col z-20 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center w-full">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden p-1">
              <img src="/Goindaicab%20logo.png" alt="Logo" className="object-contain w-full h-full" />
            </div>
            
            <div 
              className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isSidebarOpen ? "opacity-100 ml-3 max-w-[200px] translate-x-0" : "opacity-0 max-w-0 m-0 -translate-x-4"
              )}
            >
              <h1 className="font-bold text-sm uppercase text-white tracking-wider">Goindiacab</h1>
              <p className="text-xs font-semibold text-[#F59E0B] mt-0.5">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Sidebar Content (Scrollable Top) */}
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <nav className="space-y-1">
            {topMenuItems.map((item) => (
              <SidebarLink key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Sticky Bottom Settings */}
        <div className="shrink-0 border-t border-slate-800 py-4 bg-slate-900">
          <nav className="space-y-1">
            {bottomMenuItems.map((item) => (
              <SidebarLink key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 mr-4 text-gray-500 hover:bg-orange-50 hover:text-[#fa9600] rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Admin Dashboard</h2>
          </div>

          <div className="flex items-center">
            <div className="group relative">
              <button className="flex items-center space-x-3 bg-gray-50 hover:bg-orange-50 p-2 rounded-xl border border-gray-200 transition-colors">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Admin'}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#fa9600]">
                  <User className="w-5 h-5" />
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
