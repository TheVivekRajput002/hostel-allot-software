'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, isLoading }) {
  if (totalPages <= 1 && total === 0) return null;

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs">
      <span className="text-slate-500 font-medium">
        Showing {start}–{end} of {total} records
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <span className="px-2 font-bold text-[#0f2c59]">
          Page {page} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
