import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // SuperAdmin State
  superAdminUser: JSON.parse(localStorage.getItem('superadmin_user')) || null,
  superAdminToken: localStorage.getItem('superadmin_token') || null,

  // Admin State
  adminUser: JSON.parse(localStorage.getItem('admin_user')) || null,
  adminToken: localStorage.getItem('admin_token') || null,

  // Partner State
  partnerUser: JSON.parse(localStorage.getItem('partner_user')) || null,
  partnerToken: localStorage.getItem('partner_token') || null,

  // SuperAdmin Actions
  superAdminLogin: (userData, tokenData) => {
    localStorage.setItem('superadmin_user', JSON.stringify(userData));
    localStorage.setItem('superadmin_token', tokenData);
    set({ superAdminUser: userData, superAdminToken: tokenData });
  },

  superAdminLogout: () => {
    localStorage.removeItem('superadmin_user');
    localStorage.removeItem('superadmin_token');
    set({ superAdminUser: null, superAdminToken: null });
  },

  // Admin Actions
  adminLogin: (userData, tokenData) => {
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('admin_token', tokenData);
    set({ adminUser: userData, adminToken: tokenData });
  },

  adminLogout: () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    set({ adminUser: null, adminToken: null });
  },

  // Partner Actions
  partnerLogin: (userData, tokenData) => {
    localStorage.setItem('partner_user', JSON.stringify(userData));
    localStorage.setItem('partner_token', tokenData);
    set({ partnerUser: userData, partnerToken: tokenData });
  },

  partnerLogout: () => {
    localStorage.removeItem('partner_user');
    localStorage.removeItem('partner_token');
    set({ partnerUser: null, partnerToken: null });
  },
}));
