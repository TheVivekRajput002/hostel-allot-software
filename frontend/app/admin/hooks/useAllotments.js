'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildQuery, fetchJson } from '../lib/api';

export function useAllotments({ gender, page, limit, search }) {
  const [allotments, setAllotments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllotments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = buildQuery({ page, limit, search });
      const res = await fetchJson(`/api/admin/allotment/${gender}${query}`);
      setAllotments(res.data || []);
      setPagination(res.pagination || { page, limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
      setAllotments([]);
    } finally {
      setIsLoading(false);
    }
  }, [gender, page, limit, search]);

  useEffect(() => {
    fetchAllotments();
  }, [fetchAllotments]);

  return { allotments, pagination, isLoading, error, refresh: fetchAllotments };
}
