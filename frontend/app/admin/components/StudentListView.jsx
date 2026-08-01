'use client';

import React, { useEffect, useState } from 'react';
import {
  Search, Filter, CheckCircle2, Clock, ShieldAlert, ShieldCheck,
  User, MapPin, GraduationCap, Award, Eye, RotateCcw,
} from 'lucide-react';
import { fetchJson } from '../lib/api';
import { useStudentList } from '../hooks/useStudentList';
import Pagination from './Pagination';
import PendingReasonInfo from './PendingReasonInfo';

const PAGE_SIZE = 25;

function StudentCardSkeleton() {
  return (
    <div className="gov-card animate-pulse border-t-4 border-t-slate-200">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-5 bg-slate-200 rounded w-2/3" />
      </div>
      <div className="p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function StudentListView({ onSelectStudent, onDataChange }) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { students, pagination, isLoading, error, refresh } = useStudentList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter,
    gender: genderFilter,
    category: categoryFilter,
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setGenderFilter('ALL');
    setCategoryFilter('ALL');
    setPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSendForVerification = async () => {
    try {
      const result = await fetchJson('/api/admin/verification/run', { method: 'POST' });
      alert(`Verification Completed: ${result.verifiedCount} verified, ${result.unverifiedCount} unverified.`);
      await refresh();
      onDataChange?.();
    } catch (err) {
      alert(err.message || 'Error while running verification.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0b2545] text-white p-4 rounded-md shadow-sm border border-[#1e3a8a] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Verified Student Records & Applications List
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Review submitted student allotment cards, verification status, and merit rankings
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-white/10 text-amber-300 rounded font-semibold border border-white/20">
            {isLoading ? 'Loading…' : `Total: ${pagination.total} Cards`}
          </span>
        </div>
      </div>

      <div className="gov-card p-4 space-y-3">
        <div className="text-xs font-bold text-[#0f2c59] uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Filter className="w-4 h-4 text-amber-600" />
          <span>Search & Filter Official Student Applications</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="lg:col-span-2 relative">
            <label className="block font-semibold text-slate-700 mb-1">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Name, Roll No, Application ID..."
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Verification Status</label>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified (सत्यापित)</option>
              <option value="PENDING">Pending (लंबित)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gender</label>
            <select
              value={genderFilter}
              onChange={handleFilterChange(setGenderFilter)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
            >
              <option value="ALL">All Hostels (Boys & Girls)</option>
              <option value="BOYS">Boys Hostel Candidates</option>
              <option value="GIRLS">Girls Hostel Candidates</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quota Category</label>
            <select
              value={categoryFilter}
              onChange={handleFilterChange(setCategoryFilter)}
              className="w-full py-2 px-2.5 border border-slate-300 rounded bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0f2c59] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="GEN">General (GEN)</option>
              <option value="OBC">OBC-NCL</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="EWS">EWS Quota</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-600 hover:text-[#0f2c59] flex items-center gap-1 font-semibold underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="gov-card p-4 text-rose-700 text-xs font-semibold border border-rose-300 bg-rose-50">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="gov-card p-12 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Student Cards Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No student record matched your search or filter options.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#0f2c59] text-white text-xs font-bold rounded"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {students.map((student) => {
              const isVerified = student.status === 'Verified';
              return (
                <div
                  key={student.id}
                  className={`gov-card relative flex flex-col justify-between hover:shadow-md transition-shadow border-t-4 ${
                    isVerified ? 'border-t-emerald-600' : 'border-t-amber-500'
                  }`}
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                          ROLL NO: <strong className="text-[#0f2c59] text-xs font-extrabold">{student.rollNo}</strong>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-700 font-semibold rounded">
                          App: {student.applicationNo}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{student.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isVerified ? (
                        <span className="gov-badge-verified text-[11px] font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified (सत्यापित)
                        </span>
                      ) : (
                        <>
                          <span className="gov-badge-pending text-[11px] font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 shadow-xs">
                            <Clock className="w-3.5 h-3.5" /> Pending (लंबित)
                          </span>
                          <PendingReasonInfo reasons={student.unverifiedReasons} />
                        </>
                      )}
                    </div>
                  </div>

                  {isVerified && (
                    <>
                      <div className="p-4 space-y-3 flex-1 text-xs text-slate-700">
                        <div className="grid grid-col gap-2 bg-slate-100/60 p-2.5 rounded border border-slate-200">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Department & Program</span>
                            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                              <GraduationCap className="w-3.5 h-3.5 text-[#0f2c59]" />
                              {student.branch} ({student.program})
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Marks & Category</span>
                            <span className="font-bold text-amber-800 flex items-center gap-1 mt-0.5">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              Marks: {student.marks != null ? student.marks : 'N/A'} | {student.category}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-red-600" /> Home District / State:
                            </span>
                            <span className="font-semibold text-slate-800">
                              {student.homeDistrict}, {student.homeState}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Gender & Academic Year:</span>
                            <span className="font-semibold text-slate-800">
                              {student.gender === 'Boys' ? 'Male' : 'Female'} • {student.year}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-500 font-medium">
                          Hostel: <span className="font-bold text-slate-800">{student.assignedHostel}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="px-3.5 py-1.5 bg-[#0f2c59] hover:bg-[#1e3a8a] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          View Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </>
      )}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleSendForVerification}
          className="w-72 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f2c59] hover:bg-[#163d78] text-white font-bold rounded-lg shadow-md transition-all"
        >
          <ShieldCheck className="w-5 h-5" />
          Send For Verification
        </button>
      </div>
    </div>
  );
}
