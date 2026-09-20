import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Handshake, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut,
  Menu
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const { superAdminUser: user, superAdminLogout: logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/superadmin/login');
  };

  const topMenuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { name: 'Admin', icon: Building2, path: '/superadmin/admin' },
    { name: 'Users', icon: Users, path: '/superadmin/users' },
    { name: 'Partners', icon: Handshake, path: '/superadmin/partners' },
    { name: 'Operations', icon: Briefcase, path: '/superadmin/operations' },
    { name: 'Finance', icon: IndianRupee, path: '/superadmin/finance' },
    { name: 'Reports', icon: FileText, path: '/superadmin/reports' },
  ];

  const bottomMenuItems = [
    { name: 'Profile', icon: User, path: '/superadmin/profile' },
    { name: 'Settings', icon: Settings, path: '/superadmin/settings' },
    { name: 'Help', icon: HelpCircle, path: '/superadmin/help' },
  ];

  const SidebarLink = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => cn(
        "flex items-center px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-300 relative group overflow-hidden",
        isActive 
          ? "bg-blue-100 text-[#fa9600] font-bold" 
          : "text-gray-600 hover:bg-blue-100 hover:text-[#fa9600]"
      )}
      title={!isSidebarOpen ? item.name : ""}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
        <item.icon className="w-5 h-5" />
      </div>
      <span 
        className={cn(
          "whitespace-nowrap transition-all duration-300 ease-in-out",
          isSidebarOpen ? "ml-3 opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 m-0"
        )}
      >
        {item.name}
      </span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-[#f7f9fc] overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-blue-50 border-r border-blue-100 flex flex-col z-20 transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-4 border-b border-blue-100">
          <div className="flex items-center w-full">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 border border-gray-100 shadow-sm overflow-hidden p-1">
              <img src="/Goindaicab%20logo.png" alt="Logo" className="object-contain w-full h-full" />
            </div>
            
            <div 
              className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isSidebarOpen ? "opacity-100 ml-3 w-auto translate-x-0" : "opacity-0 w-0 m-0 -translate-x-4"
              )}
            >
              <h1 className="font-bold text-sm uppercase text-gray-800 tracking-wider">Goindiacab</h1>
              <p className="text-xs font-semibold text-[#fa9600] mt-0.5">Super Admin</p>
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
        <div className="shrink-0 border-t border-blue-100 py-4 bg-blue-50">
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
            <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Overview</h2>
          </div>

          <div className="flex items-center">
            <div className="group relative">
              <button className="flex items-center space-x-3 bg-gray-50 hover:bg-orange-50 p-2 rounded-xl border border-gray-200 transition-colors">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.email || 'admin@goindiacab.com'}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#fa9600]">
                  <User className="w-5 h-5" />
                </div>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">Super Admin</p>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f7f9fc] p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
