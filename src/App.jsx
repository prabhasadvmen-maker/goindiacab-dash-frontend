import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUserAuthStore } from './store/userAuthStore';

// SuperAdmin Pages
import Login from './pages/superadmin/Login';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import Dashboard from './pages/superadmin/Dashboard';
import Admin from './pages/superadmin/Admin';
import PartnerApplications from './pages/superadmin/PartnerApplications';
import PartnerApplicationReview from './pages/superadmin/PartnerApplicationReview';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

// Partner Pages
import PartnerLogin from './pages/partner/Login';
import PartnerOnboarding from './pages/partner/Onboarding';
import PartnerLayout from './layouts/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';

// User Pages
import UserLayout from './layouts/UserLayout';
import UserLogin from './pages/user/UserLogin';
import UserDashboard from './pages/user/UserDashboard';
import BookCab from './pages/user/BookCab';
import MyBookings from './pages/user/MyBookings';
import TrackTrip from './pages/user/TrackTrip';
import Profile from './pages/user/Profile';

// Shared Pages
import LoginSelector from './pages/LoginSelector';

// Protected Route Wrapper for SuperAdmin
const ProtectedSuperAdminRoute = ({ children }) => {
  const token = useAuthStore((state) => state.superAdminToken);
  const user = useAuthStore((state) => state.superAdminUser);
  
  const role = user?.role || 'SuperAdmin';
  
  if (!token || role !== 'SuperAdmin') {
    return <Navigate to="/superadmin/login" replace />;
  }
  return children;
};

// Protected Route Wrapper for Admin
const ProtectedAdminRoute = ({ children }) => {
  const token = useAuthStore((state) => state.adminToken);
  const user = useAuthStore((state) => state.adminUser);
  // Allow Admin or NGO roles
  if (!token || (user?.role !== 'Admin' && user?.role !== 'NGO')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protected Route Wrapper for Partner
const ProtectedPartnerRoute = ({ children }) => {
  const token = useAuthStore((state) => state.partnerToken);
  const user = useAuthStore((state) => state.partnerUser);
  
  if (!token || user?.role !== 'partner') {
    return <Navigate to="/partner/login" replace />;
  }
  
  // If partner is not fully approved, they should only see onboarding
  // Note: we can handle onboarding vs dashboard routing inside the components or here.
  return children;
};

// Root Redirect Logic
const RootRedirect = () => {
  const superUser = useAuthStore((state) => state.superAdminUser);
  const adminUser = useAuthStore((state) => state.adminUser);
  const partnerUser = useAuthStore((state) => state.partnerUser);
  
  if (superUser?.role === 'SuperAdmin' || (superUser && !superUser.role)) {
    return <Navigate to="/superadmin/dashboard" replace />;
  }
  
  if (adminUser?.role === 'Admin' || adminUser?.role === 'NGO') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (partnerUser?.role === 'partner') {
    return <Navigate to={partnerUser.applicationStatus === 'approved' ? '/partner/dashboard' : '/partner/onboarding'} replace />;
  }
  
  return <Navigate to="/superadmin/login" replace />; // Default fallback
};

const ProtectedUserRoute = ({ children }) => {
  const token = useUserAuthStore((state) => state.userToken);
  if (!token) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* User Protected Routes */}
        <Route
          path="/user"
          element={
            <ProtectedUserRoute>
              <UserLayout />
            </ProtectedUserRoute>
          }
        >
          <Route index element={<Navigate to="/user/home" replace />} />
          <Route path="home" element={<UserDashboard />} />
          <Route path="book" element={<BookCab />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="track" element={<TrackTrip />} />
          <Route path="profile" element={<Profile />} />
          {/* Menu Items Placeholders */}
          <Route path="payments" element={<div className="p-6">Payments Page</div>} />
          <Route path="notifications" element={<div className="p-6">Notifications Page</div>} />
          <Route path="support" element={<div className="p-6">Support Page</div>} />
          <Route path="settings" element={<div className="p-6">Settings Page</div>} />
        </Route>

        {/* Smart Redirect Root based on role */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<LoginSelector />} />
        <Route path="/superadmin/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/user/login" element={<UserLogin />} />

        {/* Protected SuperAdmin Routes */}
        <Route 
          path="/superadmin" 
          element={
            <ProtectedSuperAdminRoute>
              <SuperAdminLayout />
            </ProtectedSuperAdminRoute>
          }
        >
          {/* Default dashboard when going to /superadmin */}
          <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Placeholders for other pages */}
          <Route path="admin" element={<Admin />} />
          <Route path="partners">
             <Route index element={<PartnerApplications />} />
             <Route path=":id" element={<PartnerApplicationReview />} />
          </Route>
          <Route path="users" element={<div className="p-4 text-gray-500">Users Page Placeholder</div>} />
          <Route path="operations" element={<div className="p-4 text-gray-500">Operations Page Placeholder</div>} />
          <Route path="finance" element={<div className="p-4 text-gray-500">Finance Page Placeholder</div>} />
          <Route path="reports" element={<div className="p-4 text-gray-500">Reports Page Placeholder</div>} />
          
          <Route path="profile" element={<div className="p-4 text-gray-500">Profile Page Placeholder</div>} />
          <Route path="settings" element={<div className="p-4 text-gray-500">Settings Page Placeholder</div>} />
          <Route path="help" element={<div className="p-4 text-gray-500">Help Page Placeholder</div>} />
        </Route>

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="partners">
             <Route index element={<PartnerApplications />} />
             <Route path=":id" element={<PartnerApplicationReview />} />
          </Route>
          <Route path="customers" element={<div className="p-4 text-gray-500">Customer Management Placeholder</div>} />
          <Route path="vehicles" element={<div className="p-4 text-gray-500">Vehicle Management Placeholder</div>} />
          <Route path="bookings" element={<div className="p-4 text-gray-500">Booking Management Placeholder</div>} />
          <Route path="payments" element={<div className="p-4 text-gray-500">Payment Management Placeholder</div>} />
          <Route path="location" element={<div className="p-4 text-gray-500">Online/Location Placeholder</div>} />
          <Route path="notifications" element={<div className="p-4 text-gray-500">Notifications Placeholder</div>} />
          <Route path="complaints" element={<div className="p-4 text-gray-500">Complaints Placeholder</div>} />
          <Route path="reports" element={<div className="p-4 text-gray-500">Reports Placeholder</div>} />
          
          <Route path="profile" element={<div className="p-4 text-gray-500">Profile Placeholder</div>} />
          <Route path="support" element={<div className="p-4 text-gray-500">Support Placeholder</div>} />
          <Route path="settings" element={<div className="p-4 text-gray-500">Settings Placeholder</div>} />
        </Route>

        {/* Protected Partner Routes */}
        <Route 
          path="/partner/onboarding" 
          element={
            <ProtectedPartnerRoute>
              <PartnerOnboarding />
            </ProtectedPartnerRoute>
          } 
        />

        <Route 
          path="/partner" 
          element={
            <ProtectedPartnerRoute>
              <PartnerLayout />
            </ProtectedPartnerRoute>
          }
        >
          <Route index element={<Navigate to="/partner/dashboard" replace />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="bookings" element={<div className="p-4 text-gray-500">Partner Bookings Placeholder</div>} />
          <Route path="trips" element={<div className="p-4 text-gray-500">Partner Trips Placeholder</div>} />
          <Route path="earnings" element={<div className="p-4 text-gray-500">Partner Earnings Placeholder</div>} />
          <Route path="vehicle" element={<div className="p-4 text-gray-500">Partner Vehicle Placeholder</div>} />
          <Route path="notifications" element={<div className="p-4 text-gray-500">Partner Notifications Placeholder</div>} />
          
          <Route path="support" element={<div className="p-4 text-gray-500">Partner Support Placeholder</div>} />
          <Route path="profile" element={<div className="p-4 text-gray-500">Partner Profile Placeholder</div>} />
          <Route path="settings" element={<div className="p-4 text-gray-500">Partner Settings Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
