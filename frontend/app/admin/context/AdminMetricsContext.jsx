'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchJson } from '../lib/api';

const AdminMetricsContext = createContext(null);

const EMPTY_METRICS = {
  totalStudentsFilled: 0,
  totalVerifiedStudents: 0,
  totalPendingVerification: 0,
  totalAllotted: 0,
  boysAllotted: 0,
  girlsAllotted: 0,
  activeHostels: 0,
};

export function AdminMetricsProvider({ children }) {
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchJson('/api/admin/metrics');
      setMetrics(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AdminMetricsContext.Provider value={{ metrics, isLoading, error, refresh }}>
      {children}
    </AdminMetricsContext.Provider>
  );
}

export function useAdminMetrics() {
  const ctx = useContext(AdminMetricsContext);
  if (!ctx) {
    throw new Error('useAdminMetrics must be used within AdminMetricsProvider');
  }
  return ctx;
}
