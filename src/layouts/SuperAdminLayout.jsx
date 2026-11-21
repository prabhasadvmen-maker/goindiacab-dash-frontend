import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Handshake,
  Car, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  Settings, 
  HelpCircle, 
  User, 
  LogOut,
  Menu,
  CalendarDays,
  Globe,
  Truck,
  Ticket,
  MessageSquareWarning,
  MessageSquare,
  BookOpen,
  X
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { superAdminUser: user, superAdminLogout: logout } = useAuthStore();
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const mainRef = useRef(null);
  const superAdminToken = useAuthStore((s) => s.superAdminToken);
  const [newInquiries, setNewInquiries] = useState(0);

  // Unread contact-inquiry count for the sidebar badge (refreshed every 60s and when the inquiries page changes data).
  useEffect(() => {
    if (!superAdminToken) return undefined;
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/contacts`, {
          headers: { Authorization: `Bearer ${superAdminToken}` },
          params: { limit: 1, status: 'new' },
        });
        if (!cancelled && data.success) setNewInquiries(data.stats?.new || 0);
      } catch { /* badge is best-effort */ }
    };
    load();
    const t = setInterval(load, 60000);
    window.addEventListener('contact-inquiries-changed', load);
    return () => { cancelled = true; clearInterval(t); window.removeEventListener('contact-inquiries-changed', load); };
  }, [superAdminToken]);

  // Below 768px the sidebar becomes an off-canvas drawer and always shows full labels.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => { setIsMobile(e.matches); if (!e.matches) setMobileOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Close drawer / profile menu on navigation, and reset scroll.
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    mainRef.current?.scrollTo?.(0, 0);
  }, [location.pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = isMobile && mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, mobileOpen]);

  // Tables turn into stacked cards on phones (see index.css): copy each column heading onto its cells as data-label.
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return undefined;
    const label = () => {
      root.querySelectorAll('table').forEach((table) => {
        const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim());
        if (!heads.length) return;
        table.querySelectorAll('tbody tr').forEach((tr) => {
          const cells = [...tr.children];
          if (cells.some((c) => c.colSpan > 1)) { tr.dataset.fullRow = '1'; return; }
          cells.forEach((c, i) => { if (c.dataset.label !== (heads[i] || '')) c.dataset.label = heads[i] || ''; });
        });
      });
    };
    label();
    let raf = 0;
    const observer = new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(label); });
    observer.observe(root, { childList: true, subtree: true });
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  const isSidebarOpen = isMobile ? true : isDesktopOpen;
  const toggleSidebar = () => (isMobile ? setMobileOpen((v) => !v) : setIsDesktopOpen((v) => !v));

  const handleLogout = () => {
    logout();
    navigate('/superadmin/login');
  };

  const topMenuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/superadmin/dashboard' },
    { name: 'Admin', icon: Building2, path: '/superadmin/admin' },
    { name: 'Users', icon: Users, path: '/superadmin/users' },
    { name: 'Partners', icon: Handshake, path: '/superadmin/partners' },
    { name: 'Vehicles', icon: Car, path: '/superadmin/vehicles' },
    { name: 'Bookings', icon: CalendarDays, path: '/superadmin/bookings' },
    { name: 'Fleet & Pricing', icon: Truck, path: '/superadmin/fleet' },
    { name: 'Coupons', icon: Ticket, path: '/superadmin/coupons' },
    { name: 'Complaints', icon: MessageSquareWarning, path: '/superadmin/complaints' },
    { name: 'Contact Inquiries', icon: MessageSquare, path: '/superadmin/contact-inquiries', badge: newInquiries },
    { name: 'Operations', icon: Briefcase, path: '/superadmin/operations' },
    { name: 'Finance', icon: IndianRupee, path: '/superadmin/finance' },
    { name: 'Reports', icon: FileText, path: '/superadmin/reports' },
    { name: 'Website', icon: Globe, path: '/superadmin/website' },
    { name: 'Blog', icon: BookOpen, path: '/superadmin/blog' },
  ];

  const bottomMenuItems = [
    { name: 'Profile', icon: User, path: '/superadmin/profile' },
    { name: 'Settings', icon: Settings, path: '/superadmin/settings' },
    { name: 'Help', icon: HelpCircle, path: '/superadmin/help' },
  ];

  const currentPage = [...topMenuItems, ...bottomMenuItems].find((item) =>
    location.pathname.startsWith(item.path)
  )?.name || 'Overview';

  const SidebarLink = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) => cn(
        "flex items-center px-4 py-3.5 md:py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-300 relative group overflow-hidden",
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
      {item.badge > 0 && (
        <span className={cn(
          "bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center",
          isSidebarOpen ? "ml-auto" : "absolute top-1.5 right-2"
        )}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="flex h-dvh bg-slate-50 overflow-hidden">
      {/* Mobile drawer backdrop */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out",
          isMobile
            ? cn("fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] shadow-2xl", mobileOpen ? "translate-x-0" : "-translate-x-full")
            : cn("z-20", isSidebarOpen ? "w-64" : "w-20")
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
              <p className="text-xs font-semibold text-[#F59E0B] mt-0.5">Super Admin</p>
            </div>
            {isMobile && (
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="ml-auto p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Content (Scrollable Top) */}
        <div className="flex-1 overflow-y-auto py-4 sidebar-scroll">
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
        <header className="h-16 md:h-20 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shadow-sm z-10 shrink-0">
          <div className="flex items-center min-w-0">
            <button 
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              className="p-2 mr-2 sm:mr-4 text-gray-500 hover:bg-orange-50 hover:text-[#fa9600] rounded-lg transition-colors shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{currentPage}</h2>
          </div>

          <div className="flex items-center shrink-0 ml-2">
            <div className="relative">
              <button onClick={() => setProfileOpen((v) => !v)} aria-label="Account menu" className="flex items-center space-x-3 bg-gray-50 hover:bg-orange-50 p-2 rounded-xl border border-gray-200 transition-colors">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">{user?.email || 'admin@goindiacab.com'}</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#fa9600]">
                  <User className="w-5 h-5" />
                </div>
              </button>

              {profileOpen && <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />}
              <div className={cn("absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-20 transition-all duration-200", profileOpen ? "opacity-100 visible" : "opacity-0 invisible")}>
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
        <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-3 sm:p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
