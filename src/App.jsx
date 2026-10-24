import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUserAuthStore } from './store/userAuthStore';

// SuperAdmin Pages
const Login = lazy(() => import('./pages/superadmin/Login'));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const Dashboard = lazy(() => import('./pages/superadmin/Dashboard'));
const Admin = lazy(() => import('./pages/superadmin/Admin'));
const PartnerApplications = lazy(() => import('./pages/superadmin/PartnerApplications'));
const PartnerApplicationReview = lazy(() => import('./pages/superadmin/PartnerApplicationReview'));
const Users = lazy(() => import('./pages/superadmin/Users'));
const Vehicles = lazy(() => import('./pages/superadmin/Vehicles'));
const VehicleDetails = lazy(() => import('./pages/superadmin/VehicleDetails'));
const Bookings = lazy(() => import('./pages/superadmin/Bookings'));
const BookingDetails = lazy(() => import('./pages/superadmin/BookingDetails'));
const Payments = lazy(() => import('./pages/superadmin/Payments'));
const Location = lazy(() => import('./pages/superadmin/Location'));
const Operations = lazy(() => import('./pages/superadmin/Operations'));
const Finance = lazy(() => import('./pages/superadmin/Finance'));
const Reports = lazy(() => import('./pages/superadmin/Reports'));
const Complaints = lazy(() => import('./pages/superadmin/Complaints'));
const ComplaintDetails = lazy(() => import('./pages/superadmin/ComplaintDetails'));
const AdminProfile = lazy(() => import('./pages/superadmin/Profile'));
const Settings = lazy(() => import('./pages/superadmin/Settings'));
const WebsiteManagement = lazy(() => import('./pages/superadmin/WebsiteManagement'));
const Help = lazy(() => import('./pages/superadmin/Help'));
const FleetManagement = lazy(() => import('./pages/superadmin/FleetManagement'));
const CouponManagement = lazy(() => import('./pages/superadmin/CouponManagement'));
const PartnerBookings = lazy(() => import('./pages/partner/Bookings'));
const PartnerBookingDetails = lazy(() => import('./pages/partner/BookingDetails'));
const PartnerTrips = lazy(() => import('./pages/partner/Trips'));
const PartnerEarnings = lazy(() => import('./pages/partner/Earnings'));
const PartnerVehicle = lazy(() => import('./pages/partner/Vehicle'));
const PartnerNotifications = lazy(() => import('./pages/partner/Notifications'));
const PartnerProfile = lazy(() => import('./pages/partner/Profile'));
const PartnerSupport = lazy(() => import('./pages/partner/Support'));
const PartnerSettings = lazy(() => import('./pages/partner/Settings'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// Partner Pages
const PartnerLogin = lazy(() => import('./pages/partner/Login'));
const PartnerOnboarding = lazy(() => import('./pages/partner/Onboarding'));
const PartnerLayout = lazy(() => import('./layouts/PartnerLayout'));
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard'));

// User Pages
const UserLayout = lazy(() => import('./layouts/UserLayout'));
const UserLogin = lazy(() => import('./pages/user/UserLogin'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const BookCab = lazy(() => import('./pages/user/BookCab'));
const MyBookings = lazy(() => import('./pages/user/MyBookings'));
const TrackTrip = lazy(() => import('./pages/user/TrackTrip'));
const UserProfile = lazy(() => import('./pages/user/Profile'));
const UserPayments = lazy(() => import('./pages/user/Payments'));
const Notifications = lazy(() => import('./pages/user/Notifications'));
const Support = lazy(() => import('./pages/user/Support'));
const UserSettings = lazy(() => import('./pages/user/Settings'));

// Shared Pages
const LoginSelector = lazy(() => import('./pages/LoginSelector'));

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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
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
          <Route path="payments" element={<UserPayments />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<UserSettings />} />
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
          <Route path="website" element={<WebsiteManagement />} />
          <Route path="fleet" element={<FleetManagement />} />
          <Route path="coupons" element={<CouponManagement />} />
          <Route path="complaints">
            <Route index element={<Complaints />} />
            <Route path=":id" element={<ComplaintDetails />} />
          </Route>

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
      </Suspense>
    </Router>
  );
}

export default App;
