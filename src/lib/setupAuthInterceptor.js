import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// When the server rejects a dashboard token (expired after 7 days, or invalid), end the session and
// send the person to the matching login page instead of leaving every screen on a silent 401.
const ROLES = [
  { prefix: '/superadmin', login: '/superadmin/login', logout: () => useAuthStore.getState().superAdminLogout() },
  { prefix: '/admin', login: '/admin/login', logout: () => useAuthStore.getState().adminLogout() },
  { prefix: '/partner', login: '/partner/login', logout: () => useAuthStore.getState().partnerLogout() },
];

let redirecting = false;

export function setupAuthInterceptor() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const sentToken = String(error?.config?.headers?.Authorization || error?.config?.headers?.authorization || '').startsWith('Bearer');
      const isLoginCall = /\/auth\/login|\/login$/.test(error?.config?.url || '');

      if (status === 401 && sentToken && !isLoginCall && !redirecting) {
        const path = window.location.pathname;
        const role = ROLES.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
        if (role && path !== role.login) {
          redirecting = true;
          role.logout();
          window.location.replace(`${role.login}?expired=1`);
        }
      }
      return Promise.reject(error);
    }
  );
}
