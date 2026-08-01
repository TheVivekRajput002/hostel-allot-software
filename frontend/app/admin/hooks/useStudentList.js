'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildQuery, fetchJson } from '../lib/api';
import { mapFormToStudent } from '../lib/mapStudent';

export function useStudentList({ page, limit, search, status, gender, category }) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = buildQuery({ page, limit, search, status, gender, category });
      const res = await fetchJson(`/api/students/form${query}`);
      setStudents((res.Data || []).map(mapFormToStudent));
      setPagination(res.pagination || { page, limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, gender, category]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, pagination, isLoading, error, refresh: fetchStudents, setStudents };
}
