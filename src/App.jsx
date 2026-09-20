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
import Users from './pages/superadmin/Users';
import Vehicles from './pages/superadmin/Vehicles';
import VehicleDetails from './pages/superadmin/VehicleDetails';
import Bookings from './pages/superadmin/Bookings';
import BookingDetails from './pages/superadmin/BookingDetails';
import Payments from './pages/superadmin/Payments';
import Location from './pages/superadmin/Location';
import Operations from './pages/superadmin/Operations';
import Finance from './pages/superadmin/Finance';
import Reports from './pages/superadmin/Reports';
import Complaints from './pages/superadmin/Complaints';
import ComplaintDetails from './pages/superadmin/ComplaintDetails';
import AdminProfile from './pages/superadmin/Profile';
import Settings from './pages/superadmin/Settings';
import Help from './pages/superadmin/Help';
import PartnerBookings from './pages/partner/Bookings';
import PartnerBookingDetails from './pages/partner/BookingDetails';
import PartnerTrips from './pages/partner/Trips';
import PartnerEarnings from './pages/partner/Earnings';
import PartnerVehicle from './pages/partner/Vehicle';
import PartnerNotifications from './pages/partner/Notifications';
import PartnerProfile from './pages/partner/Profile';
import PartnerSupport from './pages/partner/Support';
import PartnerSettings from './pages/partner/Settings';

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
import UserProfile from './pages/user/Profile';

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
          <Route path="profile" element={<UserProfile />} />
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
          <Route path="users" element={<Users />} />
          <Route path="vehicles">
             <Route index element={<Vehicles />} />
             <Route path=":id" element={<VehicleDetails />} />
          </Route>
          <Route path="bookings">
             <Route index element={<Bookings />} />
             <Route path=":id" element={<BookingDetails />} />
          </Route>
          <Route path="operations" element={<Operations />} />
          <Route path="finance" element={<Payments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="location" element={<Location />} />
          <Route path="reports" element={<Reports />} />
          
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
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
          <Route path="customers" element={<Users />} />
          <Route path="vehicles">
             <Route index element={<Vehicles />} />
             <Route path=":id" element={<VehicleDetails />} />
          </Route>
          <Route path="bookings">
             <Route index element={<Bookings />} />
             <Route path=":id" element={<BookingDetails />} />
          </Route>
          <Route path="payments" element={<Payments />} />
          <Route path="location" element={<Location />} />
          <Route path="notifications" element={<div className="p-4 text-gray-500">Notifications Placeholder</div>} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="complaints/:id" element={<ComplaintDetails />} />
          <Route path="reports" element={<Reports />} />
          
          <Route path="profile" element={<AdminProfile />} />
          <Route path="support" element={<Help />} />
          <Route path="settings" element={<Settings />} />
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
          <Route path="bookings" element={<PartnerBookings />} />
          <Route path="bookings/:id" element={<PartnerBookingDetails />} />
          <Route path="trips" element={<PartnerTrips />} />
          <Route path="earnings" element={<PartnerEarnings />} />
          <Route path="vehicle" element={<PartnerVehicle />} />
          <Route path="notifications" element={<PartnerNotifications />} />
          
          <Route path="support" element={<PartnerSupport />} />
          <Route path="profile" element={<PartnerProfile />} />
          <Route path="settings" element={<PartnerSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
