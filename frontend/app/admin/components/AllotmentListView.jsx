'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2, FileText, RefreshCw, AlertCircle, CheckCircle2, Loader2, Search,
} from 'lucide-react';
import { fetchJson } from '../lib/api';
import { useAllotments } from '../hooks/useAllotments';
import { useAdminMetrics } from '../context/AdminMetricsContext';
import Pagination from './Pagination';

const PAGE_SIZE = 50;

export default function AllotmentListView() {
  const { metrics, isLoading: metricsLoading, refresh: refreshMetrics } = useAdminMetrics();

  const [activeTab, setActiveTab] = useState('boys');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const gender = activeTab === 'boys' ? 'MALE' : 'FEMALE';

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { allotments, pagination, isLoading, error, refresh } = useAllotments({
    gender,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const handleGenerateAllotment = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = await fetchJson('/api/admin/allotment/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      setSuccessMsg(
        `${data.message || 'Allotment generated successfully!'} (Allotted: ${data.maleStudentsAllotted} Boys, ${data.femaleStudentsAllotted} Girls)`
      );
      await refresh();
      await refreshMetrics();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while generating allotments.');
    } finally {
      setIsGenerating(false);
    }
  };

  const displayError = errorMsg || error;

  return (
    <div className="space-y-6">
      <div className="bg-[#0b2545] text-white rounded-md p-5 shadow flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="text-amber-400" />
            Hostel Allotment List
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Allotted students mapped to their hostels and room numbers.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Lists
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-850 rounded-md text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {displayError && (
        <div className="p-4 bg-rose-100 border border-rose-400 text-rose-850 rounded-md text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="gov-card p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Allotted Students</p>
          <h3 className="text-2xl font-bold text-[#0f2c59] mt-1">
            {metricsLoading ? '…' : metrics.totalAllotted}
          </h3>
        </div>
        <div className="gov-card p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Boys Allotted</p>
          <h3 className="text-2xl font-bold text-blue-700 mt-1">
            {metricsLoading ? '…' : metrics.boysAllotted}
          </h3>
        </div>
        <div className="gov-card p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Girls Allotted</p>
          <h3 className="text-2xl font-bold text-pink-700 mt-1">
            {metricsLoading ? '…' : metrics.girlsAllotted}
          </h3>
        </div>
        <div className="gov-card p-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Active Hostels</p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">
            {metricsLoading ? '…' : metrics.activeHostels}
          </h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-md shadow border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('boys')}
            className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
              activeTab === 'boys'
                ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Boys Hostel List ({metrics.boysAllotted})
          </button>
          <button
            onClick={() => handleTabChange('girls')}
            className={`px-4 py-2 text-xs font-bold rounded border transition-colors ${
              activeTab === 'girls'
                ? 'bg-[#0f2c59] text-white border-[#0f2c59]'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Girls Hostel List ({metrics.girlsAllotted})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search name, roll number, hostel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0f2c59]"
          />
        </div>
      </div>

      <div className="gov-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-[#0f2c59] capitalize">{activeTab} Allotment Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 font-bold bg-slate-100">
                <th className="py-3 px-3">Roll No</th>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Hostel</th>
                <th className="py-3 px-3">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="py-2.5 px-3">
                        <div className="h-3 bg-slate-200 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : allotments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">
                    No allotment records found.
                  </td>
                </tr>
              ) : (
                allotments.map((item) => {
                  const student = item.student || {};
                  const room = item.room || {};
                  const hostel = room.hostel || {};
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{student.rollNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0f2c59]">{student.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700">
                          {student.eligibleCategory || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-[10px] font-bold text-blue-800">
                          {hostel.hostelNumber ? `Hostel ${hostel.hostelNumber}` : '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{room.roomNumber ?? '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={handleGenerateAllotment}
          disabled={isGenerating || isLoading}
          className={`px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-md transition-colors ${
            isGenerating || isLoading
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed border-slate-300'
              : 'bg-green-700 hover:bg-green-800 text-white border-green-800'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Hostel Allotment List...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Hostel Allotment List
            </>
          )}
        </button>
      </div>
    </div>
  );
}
