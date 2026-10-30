import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const WEBSITE_API = `${API_URL}/api/admins/website`;

/** Authenticated client for the website admin API. `canWrite` is true for the SuperAdmin only. */
export function useWebsiteAdmin() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const api = useCallback(
    (method, url, data, params) =>
      axios({ method, url: `${WEBSITE_API}${url}`, data, params, headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );
  return { api, canWrite: !!superAdminToken };
}

/** Trip types (value + label) as the server defines them, so no screen keeps its own copy of the list. */
export function useTripTypes(api) {
  const [state, setState] = useState({ tripTypes: [], loading: true, error: false });
  useEffect(() => {
    let alive = true;
    api('get', '/meta')
      .then(({ data }) => { if (alive) setState({ tripTypes: data.data.tripTypes, loading: false, error: false }); })
      .catch(() => { if (alive) setState({ tripTypes: [], loading: false, error: true }); });
    return () => { alive = false; };
  }, [api]);
  return state;
}
